import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GroupService } from './group.service';
import { AuthService } from 'src/infrastructure/auth/services/auth.service';
import { CreateGroupDto } from 'src/application/dto/group.dto';
import { UserRole } from '@core/enums/user-role.enum';
import { UnauthorizedException } from '@nestjs/common';
import { Group } from '@core/entities/group.entity';

describe('GroupService', () => {
  let service: GroupService;
  let authService: AuthService;

  const mockGroupRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockAuthService = {
    findById: jest.fn(),
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
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    service = module.get<GroupService>(GroupService);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createGroup', () => {
    it('should successfully create a group when admin exists', async () => {
      const createGroupDto: CreateGroupDto = {
        name: 'Test Group',
        adminId: 'admin1',
      };

      const mockAdmin = { id: 'admin1', role: UserRole.ADMIN };
      const mockGroup = {
        id: 'group1',
        name: 'Test Group',
        adminId: 'admin1',
      };

      mockAuthService.findById.mockResolvedValue(mockAdmin);
      mockGroupRepository.create.mockReturnValue(mockGroup);
      mockGroupRepository.save.mockResolvedValue(mockGroup);

      const result = await service.createGroup(createGroupDto);

      expect(authService.findById).toHaveBeenCalledWith({
        where: { id: 'admin1', role: UserRole.ADMIN },
      });
      expect(mockGroupRepository.create).toHaveBeenCalledWith({
        name: 'Test Group',
        adminId: 'admin1',
      });
      expect(mockGroupRepository.save).toHaveBeenCalledWith(mockGroup);
      expect(result).toEqual(mockGroup);
    });

    it('should throw UnauthorizedException when admin does not exist', async () => {
      const createGroupDto: CreateGroupDto = {
        name: 'Test Group',
        adminId: 'invalid-admin',
      };

      mockAuthService.findById.mockResolvedValue(null);

      await expect(service.createGroup(createGroupDto)).rejects.toThrow(
        new UnauthorizedException(
          `Admin with id ${createGroupDto.adminId}, dosen't exist`,
        ),
      );
    });

    it('should throw error when repository fails', async () => {
      const createGroupDto: CreateGroupDto = {
        name: 'Test Group',
        adminId: 'admin1',
      };

      const mockAdmin = { id: 'admin1', role: UserRole.ADMIN };
      const error = new Error('Database error');

      mockAuthService.findById.mockResolvedValue(mockAdmin);
      mockGroupRepository.create.mockImplementation(() => {
        throw error;
      });

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
      };

      mockGroupRepository.findOne.mockResolvedValue(mockGroup);

      const result = await service.getGroupById(groupId, adminId);

      expect(mockGroupRepository.findOne).toHaveBeenCalledWith({
        where: { id: groupId, adminId: adminId },
      });
      expect(result).toEqual(mockGroup);
    });

    it('should return null when group not found', async () => {
      const groupId = 'non-existent';
      const adminId = 'admin1';

      mockGroupRepository.findOne.mockResolvedValue(null);

      const result = await service.getGroupById(groupId, adminId);

      expect(result).toBeNull();
    });

    it('should throw error when repository fails', async () => {
      const groupId = 'group1';
      const adminId = 'admin1';
      const error = new Error('Database error');

      mockGroupRepository.findOne.mockRejectedValue(error);

      await expect(service.getGroupById(groupId, adminId)).rejects.toThrow(error);
    });
  });
});