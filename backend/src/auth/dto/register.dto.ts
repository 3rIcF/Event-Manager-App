import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsIn, IsOptional } from 'class-validator';

// Define enum constants
export const UserRole = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  USER: 'USER',
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

export class RegisterDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    enum: Object.values(UserRole),
    example: UserRole.USER,
    description: 'User role',
    required: false,
  })
  @IsOptional()
  @IsIn(Object.values(UserRole))
  role?: UserRoleType = UserRole.USER;
}