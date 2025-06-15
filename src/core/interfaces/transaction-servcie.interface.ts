import { Transaction } from "@core/entities/transaction.entity";
import { CreateTransactionDto } from "src/application/dto/transaction.dto";
export interface ITransactionService {
    createTransaction(
        createTransactionDto: CreateTransactionDto, 
        userId: string, 
        file : Express.Multer.File
    ): Promise<Partial<Transaction>>;

    getTransactionById(id: string, userId: string): Promise<Transaction>;
}
