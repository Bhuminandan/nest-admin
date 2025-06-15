import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/core/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserRepository extends Repository<User> {}