import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTransactionDto } from 'src/application/dto/transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '@core/entities/transaction.entity';
import { AuthService } from 'src/infrastructure/auth/services/auth.service';
import { FileUploadService } from './file-upload.service';
import { ITransactionService } from '@core/interfaces/transaction-servcie.interface';

@Injectable()
export class TransactionService implements ITransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly authService: AuthService,
    private readonly fileUploadService: FileUploadService
  ) {}

  async createTransaction(
        createTransactionDto: CreateTransactionDto, 
        userId: string, 
        file: Express.Multer.File
    ): Promise<Partial<Transaction>> { 
    const existsUser = await this.authService.findById({
      where: { id: userId },
    });

    if (!existsUser) {
      throw new BadRequestException('User not found');
    }

    if(!file) {
      throw new BadRequestException('File not found');
    }


    const transaction = this.transactionRepository.create({
        ...createTransactionDto,
        user: { id: existsUser.id }, 
        filePath: this.fileUploadService.handleFileUpload(file),
    });

    return this.transactionRepository.save(transaction);
  }

  async getTransactionById(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if(!transaction) {
      throw new BadRequestException('Transaction not found');
    }
    return transaction;
  }

  async getAllTransactions(page: number, limit: number) {
    const transactions = await this.transactionRepository.find({
      skip: (page - 1) * limit,
      take: limit,
    });
    return transactions;
  }

  async getUserTransactions(userId: string, page: number, limit: number) {
    const transactions = await this.transactionRepository.find({
      where: { user: { id: userId } },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });
    return transactions;
  }
}
