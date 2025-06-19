import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GroupService } from './group.service';
import { CreateGroupDto } from 'src/application/dto/group.dto';
import { UserRole } from '@core/enums/user-role.enum';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { Group } from '@core/entities/group.entity';
import { User } from '@core/entities/user.entity';
import { In } from 'typeorm';

describe('GroupService', () => {
  let service: GroupService;

  const mockGroupRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        {
          provide: getRepositoryToken(Group),
          useValue: mockGroupRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<GroupService>(GroupService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createGroup', () => {
    it('should successfully create a group when admin and members exist', async () => {
      const createGroupDto: CreateGroupDto = {
        name: 'Test Group',
        adminId: 'admin1',
        members: ['member1', 'member2'],
      };

      const mockAdmin = { id: 'admin1', role: UserRole.ADMIN };
      const mockMembers = [{ id: 'member1' }, { id: 'member2' }];
      const mockGroup = {
        id: 'group1',
        name: 'Test Group',
        adminId: 'admin1',
        users: mockMembers,
      };

      // Mock admin check
      mockUserRepository.findOne.mockResolvedValue(mockAdmin);
      // Mock members check
      mockUserRepository.find.mockResolvedValue(mockMembers);
      // Mock group creation
      mockGroupRepository.create.mockReturnValue(mockGroup);
      mockGroupRepository.save.mockResolvedValue(mockGroup);

      const result = await service.createGroup(createGroupDto);

      // Verify admin check
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 'admin1',
          role: UserRole.ADMIN,
        },
      });

      // Verify members check
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: {
          id: In(['member1', 'member2']),
        },
      });

      // Verify group creation
      expect(mockGroupRepository.create).toHaveBeenCalledWith({
        name: 'Test Group',
        users: mockMembers,
        adminId: 'admin1',
      });

      expect(mockGroupRepository.save).toHaveBeenCalledWith(mockGroup);
      expect(result).toEqual(mockGroup);
    });

    it('should throw UnauthorizedException when admin does not exist', async () => {
      const createGroupDto: CreateGroupDto = {
        name: 'Test Group',
        adminId: 'invalid-admin',
        members: ['member1', 'member2'],
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.createGroup(createGroupDto)).rejects.toThrow(
        new UnauthorizedException(
          `Admin with id ${createGroupDto.adminId}, dosen't exist`,
        ),
      );
    });

    it('should throw UnauthorizedException when members do not exist', async () => {
      const createGroupDto: CreateGroupDto = {
        name: 'Test Group',
        adminId: 'admin1',
        members: ['member1', 'invalid-member'],
      };

      const mockAdmin = { id: 'admin1', role: UserRole.ADMIN };
      const mockMembers = [{ id: 'member1' }]; // Only one member exists

      mockUserRepository.findOne.mockResolvedValue(mockAdmin);
      mockUserRepository.find.mockResolvedValue(mockMembers);

      await expect(service.createGroup(createGroupDto)).rejects.toThrow(
        new UnauthorizedException(
          `User with id ${createGroupDto.members}, dosen't exist`,
        ),
      );
    });

    it('should throw error when repository fails', async () => {
      const createGroupDto: CreateGroupDto = {
        name: 'Test Group',
        adminId: 'admin1',
        members: ['member1', 'member2'],
      };

      const mockAdmin = { id: 'admin1', role: UserRole.ADMIN };
      const mockMembers = [{ id: 'member1' }, { id: 'member2' }];
      const error = new Error('Database error');

      mockUserRepository.findOne.mockResolvedValue(mockAdmin);
      mockUserRepository.find.mockResolvedValue(mockMembers);
      mockGroupRepository.save.mockRejectedValue(error);

      await expect(service.createGroup(createGroupDto)).rejects.toThrow(error);
    });
  });

  describe('getGroupById', () => {
    it('should return group when found', async () => {
      const groupId = 'group1';
      const adminId = 'admin1';
      const mockGroup = {
        id: 'group1',
        name: 'Test Group',
        adminId: 'admin1',
        users: [],
      };

      mockGroupRepository.findOne.mockResolvedValue(mockGroup);

      const result = await service.getGroupById(groupId, adminId);

      expect(mockGroupRepository.findOne).toHaveBeenCalledWith({
        where: { id: groupId, adminId: adminId },
      });
      expect(result).toEqual(mockGroup);
    });

    it('should throw NotFoundException when group not found', async () => {
      const groupId = 'non-existent';
      const adminId = 'admin1';

      mockGroupRepository.findOne.mockResolvedValue(null);

      await expect(service.getGroupById(groupId, adminId)).rejects.toThrow(
        new NotFoundException(`Group with id ${groupId}, dosen't exist`),
      );
    });

    it('should throw error when repository fails', async () => {
      const groupId = 'group1';
      const adminId = 'admin1';
      const error = new Error('Database error');

      mockGroupRepository.findOne.mockRejectedValue(error);

      await expect(service.getGroupById(groupId, adminId)).rejects.toThrow(
        error,
      );
    });
  });
});
