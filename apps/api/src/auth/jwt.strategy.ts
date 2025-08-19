import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Extrahiere JWT aus verschiedenen Quellen
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromUrlQueryParameter('token'),
        ExtractJwt.fromHeader('x-access-token'),
      ]),
      ignoreExpiration: false, // Token-Ablauf prüfen
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true, // Request-Objekt an Callback übergeben
    });
  }

  async validate(request: Request, payload: any) {
    try {
      // ✅ Erweiterte JWT-Validierung implementiert
      
      // Prüfe Token-Blacklist
      const isBlacklisted = await this.isTokenBlacklisted(payload.jti);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token wurde widerrufen');
      }

      // Prüfe Benutzer-Existenz und Status
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          deletedAt: true,
          lastLoginAt: true,
          failedLoginAttempts: true,
          lockedUntil: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Benutzer nicht gefunden');
      }

      if (user.deletedAt) {
        throw new UnauthorizedException('Benutzerkonto wurde gelöscht');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('Benutzerkonto ist deaktiviert');
      }

      // Prüfe Account-Sperrung
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        throw new ForbiddenException('Benutzerkonto ist temporär gesperrt');
      }

      // Prüfe IP-Adresse (optional)
      const clientIP = this.getClientIP(request);
      if (payload.ip && payload.ip !== clientIP) {
        // Log verdächtige Aktivität
        await this.logSuspiciousActivity(user.id, 'IP-Mismatch', {
          expectedIP: payload.ip,
          actualIP: clientIP,
        });
        
        // Bei kritischen Rollen IP-Validierung erzwingen
        if ([UserRole.ADMIN, UserRole.ORGANIZER].includes(user.role)) {
          throw new UnauthorizedException('Ungültige IP-Adresse');
        }
      }

      // Prüfe User-Agent (optional)
      const userAgent = request.headers['user-agent'];
      if (payload.userAgent && payload.userAgent !== userAgent) {
        await this.logSuspiciousActivity(user.id, 'User-Agent-Mismatch', {
          expectedUserAgent: payload.userAgent,
          actualUserAgent: userAgent,
        });
      }

      // Aktualisiere Last-Login
      await this.updateLastLogin(user.id);

      // Erweitere Payload mit Benutzerdaten
      const enhancedPayload = {
        ...payload,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        permissions: await this.getUserPermissions(user.role),
        sessionId: payload.jti,
        issuedAt: payload.iat,
        expiresAt: payload.exp,
      };

      return enhancedPayload;
    } catch (error) {
      // Log Fehler für Sicherheitsanalyse
      await this.logJwtValidationError(payload?.sub, error.message);
      throw error;
    }
  }

  private async isTokenBlacklisted(jti: string): Promise<boolean> {
    try {
      const blacklistedToken = await this.prisma.blacklistedToken.findUnique({
        where: { jti },
      });
      return !!blacklistedToken;
    } catch (error) {
      // Bei Datenbankfehlern Token als sicher betrachten
      return false;
    }
  }

  private async getUserPermissions(role: UserRole): Promise<string[]> {
    const rolePermissions = {
      [UserRole.ADMIN]: [
        'user:read', 'user:write', 'user:delete',
        'project:read', 'project:write', 'project:delete',
        'bom:read', 'bom:write', 'bom:delete',
        'supplier:read', 'supplier:write', 'supplier:delete',
        'permit:read', 'permit:write', 'permit:delete',
        'logistics:read', 'logistics:write', 'logistics:delete',
        'operations:read', 'operations:write', 'operations:delete',
        'reports:read', 'reports:write',
        'system:admin',
      ],
      [UserRole.ORGANIZER]: [
        'user:read',
        'project:read', 'project:write',
        'bom:read', 'bom:write',
        'supplier:read', 'supplier:write',
        'permit:read', 'permit:write',
        'logistics:read', 'logistics:write',
        'operations:read', 'operations:write',
        'reports:read', 'reports:write',
      ],
      [UserRole.ONSITE]: [
        'project:read',
        'bom:read',
        'operations:read', 'operations:write',
        'logistics:read',
        'scanning:read', 'scanning:write',
      ],
      [UserRole.EXTERNAL_VENDOR]: [
        'project:read',
        'bom:read',
        'operations:read',
        'supplier:read', 'supplier:write',
      ],
    };

    return rolePermissions[role] || [];
  }

  private getClientIP(request: Request): string {
    // Verschiedene Header für IP-Adresse prüfen
    const forwardedFor = request.headers['x-forwarded-for'] as string;
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }

    const realIP = request.headers['x-real-ip'] as string;
    if (realIP) {
      return realIP;
    }

    return request.ip || request.connection.remoteAddress || 'unknown';
  }

  private async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { lastLoginAt: new Date() },
      });
    } catch (error) {
      // Log Fehler, aber nicht den Login blockieren
      console.error('Fehler beim Aktualisieren des Last-Login:', error);
    }
  }

  private async logSuspiciousActivity(
    userId: string,
    activityType: string,
    details: any,
  ): Promise<void> {
    try {
      await this.prisma.securityLog.create({
        data: {
          userId,
          activityType,
          details: JSON.stringify(details),
          ipAddress: details.actualIP || 'unknown',
          userAgent: details.actualUserAgent || 'unknown',
          severity: 'WARNING',
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error('Fehler beim Loggen der verdächtigen Aktivität:', error);
    }
  }

  private async logJwtValidationError(
    userId: string | undefined,
    errorMessage: string,
  ): Promise<void> {
    try {
      await this.prisma.securityLog.create({
        data: {
          userId: userId || 'unknown',
          activityType: 'JWT_VALIDATION_ERROR',
          details: JSON.stringify({ error: errorMessage }),
          severity: 'ERROR',
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error('Fehler beim Loggen des JWT-Validierungsfehlers:', error);
    }
  }
}
