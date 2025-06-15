import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateTransactionDto {
  @ApiProperty({
    example: 'Test transaction',
    description: 'Name for transaction',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Title is empty' })
  title: string

  @ApiProperty({
    example: 'Test description',
    description: 'Description for transaction',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Description is empty' })
  description: string

  @ApiProperty({
    example: 'path/to/file.pdf',
    description: 'Path to file for transaction',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'File path is empty' })
  filePath: string
}