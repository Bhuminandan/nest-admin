import { Group } from "@core/entities/group.entity";
import { CreateGroupDto } from "src/application/dto/group.dto";

export interface IGroupService {
    createGroup(createGroup : CreateGroupDto): Promise<Partial<Group>>
}
