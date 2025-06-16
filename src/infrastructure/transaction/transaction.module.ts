import { Module } from '@nestjs/common';
import { TransactionService } from './services/transaction.service';
import { TransactionController } from './controllers/transaction.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthModule } from '../auth/auth.module';
import { FileUploadService } from './services/file-upload.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '@core/entities/transaction.entity';
import { TransactionRepository } from '../database/repositories/transaction-repository';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Transaction, TransactionRepository]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  ],
  controllers: [TransactionController],
  providers: [TransactionService, FileUploadService],
  exports: [TransactionService],
})
export class TransactionModule {}
