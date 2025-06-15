// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { GroupModule } from './infrastructure/group/group.module';
import { TransactionModule } from './infrastructure/transaction/transaction.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    GroupModule,
    TransactionModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
