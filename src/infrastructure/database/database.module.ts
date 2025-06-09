import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../../core/entities/user.entity';
import { Group } from '../../core/entities/group.entity';
import { Transaction } from '../../core/entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [User, Group, Transaction],
        synchronize: true,
        logging: true,
      }),
    }),
    TypeOrmModule.forFeature([User, Group, Transaction]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
