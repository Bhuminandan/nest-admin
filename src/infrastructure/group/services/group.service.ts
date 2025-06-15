import { Group } from "@core/entities/group.entity";
import { UserRole } from "@core/enums/user-role.enum";
import { IGroupService } from "@core/interfaces/group-service.interface";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateGroupDto } from "src/application/dto/group.dto";
import { AuthService } from "src/infrastructure/auth/services/auth.service";
import { GroupRepository } from "src/infrastructure/database/repositories/group-repository";

@Injectable()
export class GroupService implements IGroupService {
    constructor(
        @InjectRepository(Group)
        private readonly groupRepository : GroupRepository,
        private readonly authService : AuthService
    ){}

  async createGroup(createGroup : CreateGroupDto): Promise<Partial<Group>> {
    const adminExists = await this.authService.findById({
        where : {
            id : createGroup.adminId,
            role: UserRole.ADMIN
        }
    });

    if(!adminExists) {
        throw new UnauthorizedException(`Admin with id ${createGroup.adminId}, dosen't exist`)
    }
    const createdGroup = this.groupRepository.create({
        name : createGroup.name,
        adminId : createGroup.adminId
    })

    return await this.groupRepository.save(createdGroup);
  }

  async getGroupById(groupId : string, adminId : string) {
    const group = await this.groupRepository.findOne({
        where : {
            id : groupId,
            adminId : adminId
        }
    });
    return group;
  }
}