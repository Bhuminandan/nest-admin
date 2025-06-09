import { IsEmail, IsNotEmpty, IsEnum } from 'class-validator';
import { UserRole } from './../../core/enums/user-role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty()
  @IsNotEmpty()
  groupId?: string; // Required for Admin creating users
}
