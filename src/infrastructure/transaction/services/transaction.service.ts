import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
} from 'src/application/dto/transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '@core/entities/transaction.entity';
import { AuthService } from 'src/infrastructure/auth/services/auth.service';
import { FileUploadService } from './file-upload.service';
import { ITransactionService } from '@core/interfaces/transaction-servcie.interface';
import * as fs from 'fs';

@Injectable()
export class TransactionService implements ITransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly authService: AuthService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async createTransaction(
    createTransactionDto: CreateTransactionDto,
    userId: string,
    file: Express.Multer.File,
  ): Promise<Partial<Transaction>> {
    const existsUser = await this.authService.findById({
      where: { id: userId },
    });

    if (!existsUser) {
      throw new BadRequestException('User not found');
    }

    if (!file) {
      throw new BadRequestException('File not found');
    }

    const transaction = this.transactionRepository.create({
      ...createTransactionDto,
      user: existsUser,
      filePath: this.fileUploadService.handleFileUpload(file),
    });

    return this.transactionRepository.save(transaction);
  }

  async updateTransaction(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
    userId: string,
    file: Express.Multer.File,
  ) {
    const transaction = await this.getTransactionById(id, userId);
    transaction.title = updateTransactionDto.title;
    transaction.description = updateTransactionDto.description;
    if (file) {
      this.deleteFile(transaction.filePath);
      transaction.filePath = this.fileUploadService.handleFileUpload(file);
    }
    return this.transactionRepository.save(transaction);
  }

  async getTransactionById(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!transaction) {
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

  async getAllTransactionsByUser(userId: string, page: number, limit: number) {
    const transactions = await this.transactionRepository.find({
      where: { user: { id: userId } },
      skip: (page - 1) * limit,
      take: limit,
    });
    return transactions;
  }

  async deleteTransaction(id: string, userId: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    this.deleteFile(transaction.filePath);
    await this.transactionRepository.remove(transaction);
  }

  async getFile(fileName: string) {
    const fullPath = process.cwd() + '/uploads/' + fileName;
    if (!fs.existsSync(fullPath)) {
      throw new BadRequestException('File not found');
    }
    return fs.readFileSync(fullPath);
  }

  private deleteFile(filePath: string) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error deleting file at ${filePath}:`, err);
      } else {
        console.log(`File at ${filePath} deleted successfully`);
      }
    });
  }
}
