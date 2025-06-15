import { Transaction } from "@core/entities/transaction.entity";
import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";

@Injectable()
export class TransactionRepository extends Repository<Transaction>{}