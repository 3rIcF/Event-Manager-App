import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // ✅ CSRF-Schutz implementiert
    
    // Überspringe CSRF-Validierung für GET-Requests
    if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS') {
      return true;
    }

    // Überspringe CSRF-Validierung für statische Assets
    if (request.path.startsWith('/api/docs') || request.path.startsWith('/health')) {
      return true;
    }

    // Hole CSRF-Token aus verschiedenen Quellen
    const csrfToken = this.extractCsrfToken(request);
    
    if (!csrfToken) {
      throw new ForbiddenException('CSRF-Token fehlt');
    }

    // Validiere CSRF-Token
    const isValid = await this.validateCsrfToken(csrfToken, request);
    
    if (!isValid) {
      throw new ForbiddenException('Ungültiger CSRF-Token');
    }

    return true;
  }

  private extractCsrfToken(request: Request): string | null {
    // Prüfe verschiedene Header und Body-Felder
    const tokenFromHeader = request.headers['x-csrf-token'] as string;
    const tokenFromBody = request.body?.csrfToken;
    const tokenFromQuery = request.query.csrfToken as string;
    
    return tokenFromHeader || tokenFromBody || tokenFromQuery || null;
  }

  private async validateCsrfToken(token: string, request: Request): Promise<boolean> {
    try {
      // Prüfe ob Token in der Datenbank existiert und gültig ist
      const csrfToken = await this.prisma.csrfToken.findUnique({
        where: { token },
        select: {
          id: true,
          userId: true,
          expiresAt: true,
          isUsed: true,
          ipAddress: true,
          userAgent: true,
        },
      });

      if (!csrfToken) {
        return false;
      }

      // Prüfe Token-Ablauf
      if (csrfToken.expiresAt < new Date()) {
        // Lösche abgelaufenen Token
        await this.prisma.csrfToken.delete({
          where: { id: csrfToken.id },
        });
        return false;
      }

      // Prüfe ob Token bereits verwendet wurde
      if (csrfToken.isUsed) {
        return false;
      }

      // Optional: Prüfe IP-Adresse und User-Agent
      const clientIP = this.getClientIP(request);
      const userAgent = request.headers['user-agent'];

      if (csrfToken.ipAddress && csrfToken.ipAddress !== clientIP) {
        // Log verdächtige Aktivität
        await this.logSuspiciousActivity(csrfToken.userId, 'CSRF_IP_MISMATCH', {
          expectedIP: csrfToken.ipAddress,
          actualIP: clientIP,
        });
        return false;
      }

      if (csrfToken.userAgent && csrfToken.userAgent !== userAgent) {
        // Log verdächtige Aktivität
        await this.logSuspiciousActivity(csrfToken.userId, 'CSRF_USER_AGENT_MISMATCH', {
          expectedUserAgent: csrfToken.userAgent,
          actualUserAgent: userAgent,
        });
        return false;
      }

      // Markiere Token als verwendet
      await this.prisma.csrfToken.update({
        where: { id: csrfToken.id },
        data: { isUsed: true },
      });

      return true;
    } catch (error) {
      console.error('Fehler bei CSRF-Token-Validierung:', error);
      return false;
    }
  }

  private getClientIP(request: Request): string {
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
      console.error('Fehler beim Loggen der verdächtigen CSRF-Aktivität:', error);
    }
  }
}
