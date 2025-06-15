import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address for registration',
    required: true,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;
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
