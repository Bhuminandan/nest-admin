import { Group } from '@core/entities/group.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupController } from './controllers/group.controller';
import { GroupService } from './services/group.service';
import { AuthModule } from '../auth/auth.module';
import { User } from '@core/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Group, User]), AuthModule],
  controllers: [GroupController],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupModule {}
