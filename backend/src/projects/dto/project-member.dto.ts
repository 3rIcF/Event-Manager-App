import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

const PROJECT_MEMBER_ROLES = ['OWNER', 'MANAGER', 'MEMBER'] as const;
export type ProjectMemberRole = typeof PROJECT_MEMBER_ROLES[number];

export class AddProjectMemberDto {
  @ApiProperty({
    example: 'user-id-123',
    description: 'ID of the user to add to the project',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    enum: PROJECT_MEMBER_ROLES,
    example: 'MEMBER',
    description: 'Role of the member in the project',
  })
  @IsIn(PROJECT_MEMBER_ROLES)
  role: ProjectMemberRole;
}

export class UpdateProjectMemberDto {
  @ApiProperty({
    enum: PROJECT_MEMBER_ROLES,
    example: 'MANAGER',
    description: 'New role of the member in the project',
  })
  @IsIn(PROJECT_MEMBER_ROLES)
  role: ProjectMemberRole;
}