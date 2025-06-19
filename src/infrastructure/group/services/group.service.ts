import { Group } from '@core/entities/group.entity';
import { User } from '@core/entities/user.entity';
import { UserRole } from '@core/enums/user-role.enum';
import { IGroupService } from '@core/interfaces/group-service.interface';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateGroupDto } from 'src/application/dto/group.dto';
import { GroupRepository } from 'src/infrastructure/database/repositories/group-repository';
import { UserRepository } from 'src/infrastructure/database/repositories/user-repository';
import { In } from 'typeorm';

@Injectable()
export class GroupService implements IGroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: GroupRepository,
    @InjectRepository(User)
    private readonly userRepository: UserRepository,
  ) {}

  async createGroup(createGroup: CreateGroupDto): Promise<Partial<Group>> {
    const adminExists = await this.userRepository.findOne({
      where: {
        id: createGroup.adminId,
        role: UserRole.ADMIN,
      },
    });

    if (!adminExists) {
      throw new UnauthorizedException(
        `Admin with id ${createGroup.adminId}, dosen't exist`,
      );
    }

    const users = await this.userRepository.find({
      where: {
        id: In(createGroup.members),
      },
    });

    if (users.length !== createGroup.members.length) {
      throw new UnauthorizedException(
        `User with id ${createGroup.members}, dosen't exist`,
      );
    }

    const createdGroup = this.groupRepository.create({
      name: createGroup.name,
      users: users,
      adminId: createGroup.adminId,
    });

    return await this.groupRepository.save(createdGroup);
  }

  async getGroupById(groupId: string, adminId: string) {
    const group = await this.groupRepository.findOne({
      where: {
        id: groupId,
        adminId: adminId,
      },
    });
    if (!group) {
      throw new NotFoundException(`Group with id ${groupId}, dosen't exist`);
    }
    return group;
  }
}
