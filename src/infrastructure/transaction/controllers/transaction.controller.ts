import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TransactionService } from '../services/transaction.service';
import { JwtAuthGuard } from 'src/infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/infrastructure/auth/guards/roles.guard';
import { Roles } from 'src/infrastructure/auth/decorators/roles.decorator';
import { UserRole } from '@core/enums/user-role.enum';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTransactionDto } from 'src/application/dto/transaction.dto';
import { Express } from 'express';

@ApiTags('Transaction')
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Create a new transaction with file (User only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Transaction created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
  })
  async createTransaction(
    @Req() req: any,
    @Body() createTransactionDto: CreateTransactionDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.transactionService.createTransaction(
      createTransactionDto,
      req.user.id,
      file, 
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Transaction created successfully',
      data: result,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Get a transaction by id (User only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transaction found successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
  })
  async getTransactionById(@Req() req: any) {
    const transaction = await this.transactionService.getTransactionById(
      req.params.id,
      req.user.id
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Transaction found successfully',
      data: transaction,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.POWER_USER)
  @ApiOperation({ summary: 'Get all transactions (Power user only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transactions found successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
  })
  async getAllTransactions(@Req() req: any) {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const transactions = await this.transactionService.getAllTransactions(page, limit);
    return {
      statusCode: HttpStatus.OK,
      message: 'Transactions found successfully',
      data: transactions,
    };
  }

  @Get('/user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.POWER_USER)
  @ApiOperation({ summary: 'Get all transactions for a user (User only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transactions found successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
  })
  async getUserTransactions(@Req() req: any) {
    console.log('User ID: >>>> ', req.user.id);
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const transactions = await this.transactionService.getUserTransactions(req.user.id, page, limit);
    return {
      statusCode: HttpStatus.OK,
      message: 'Transactions found successfully',
      data: transactions,
    };
  }
}