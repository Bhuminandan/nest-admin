import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({
    example: 'Test transaction',
    description: 'Name for transaction',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Title is empty' })
  title: string;

  @ApiProperty({
    example: 'Test description',
    description: 'Description for transaction',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Description is empty' })
  description: string;
}

export class UpdateTransactionDto {
  @ApiProperty({
    example: 'Test transaction',
    description: 'Name for transaction',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Title is empty' })
  title: string;

  @ApiProperty({
    example: 'Test description',
    description: 'Description for transaction',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Description is empty' })
  description: string;
}
