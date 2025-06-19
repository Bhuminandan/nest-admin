import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({
    example: 'Sales',
    description: 'Name for group',
    required: true,
  })
  @IsString()
  @MinLength(3, { message: 'Group name shoud be atleast 3 characters long' })
  @IsNotEmpty({ message: 'name is empty' })
  name: string;

  @ApiProperty({
    example: 'akjshdfla.asfhla..fskjahlsfj~',
    description: 'Id of group admin',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'adminId is empty' })
  @IsUUID()
  adminId: string;

  @Optional()
  @ApiProperty({
    example: [
      'akjshdfla.asfhla..fskjahlssfj~',
      'akjshdfla.asfhla..fskjahlssfj~',
      'akjshdfla.asfhla..fskjahlssfj~',
    ],
    description: 'User ids of group members',
    required: false,
  })
  @IsString({ each: true })
  members: string[];
}
