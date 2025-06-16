import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/core/enums/user-role.enum';

export class RegisterUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address for registration',
    required: true,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    example: UserRole.POWER_USER,
    description: 'Role for registration',
    required: true,
    enum: [UserRole.POWER_USER, UserRole.USER],
  })
  @IsEnum([UserRole.POWER_USER, UserRole.USER], {
    message: 'Role must be a valid enum value',
  })
  role: UserRole;
}

export class RegisterAdminDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address for registration',
    required: true,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Password for registration',
    required: true,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  password: string;
}

export class RegisterSupportUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address for registration',
    required: true,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Password for registration',
    required: true,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  password: string;
}
