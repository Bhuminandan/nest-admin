import { Group } from '@core/entities/group.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class GroupRepository extends Repository<Group> {
}
