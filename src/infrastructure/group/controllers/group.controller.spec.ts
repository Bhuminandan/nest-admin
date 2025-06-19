import { Test, TestingModule } from '@nestjs/testing';
import { GroupController } from './group.controller';
import { GroupService } from '../services/group.service';
import { JwtAuthGuard } from 'src/infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/infrastructure/auth/guards/roles.guard';
import { CreateGroupDto } from 'src/application/dto/group.dto';
import { UserRole } from '@core/enums/user-role.enum';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';
import { ROLES_KEY } from 'src/infrastructure/auth/decorators/roles.decorator';

describe('GroupController', () => {
  let controller: GroupController;
  let groupService: GroupService;

  const mockGroupService = {
    createGroup: jest.fn(),
    getGroupById: jest.fn(),
  };

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupController],
      providers: [
        {
          provide: GroupService,
          useValue: mockGroupService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<GroupController>(GroupController);
    groupService = module.get<GroupService>(GroupService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createGroup', () => {
    it('should create a group and return 201 status', async () => {
      const createGroupDto: CreateGroupDto = {
        name: 'Test Group',
        adminId: '1',
      };

      const expectedResult = { id: '1', ...createGroupDto };
      mockGroupService.createGroup.mockResolvedValue(expectedResult);

      await controller.createGroup(createGroupDto, mockResponse);

      expect(groupService.createGroup).toHaveBeenCalledWith(createGroupDto);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CREATED,
        message: 'Group created successfully',
        data: expectedResult,
      });
    });

    it('should throw an error when service fails', async () => {
      const createGroupDto: CreateGroupDto = {
        name: 'Test Group',
        adminId: '1',
      };

      const error = new Error('Service error');
      mockGroupService.createGroup.mockRejectedValue(error);

      await expect(
        controller.createGroup(createGroupDto, mockResponse),
      ).rejects.toThrow(error);
    });
  });

  describe('getGroupById', () => {
    it('should return group by id with 200 status', async () => {
      const mockRequest = {
        params: { id: '1' },
        user: { id: 'user1' },
      };

      const expectedResult = {
        id: '1',
        name: 'Test Group',
        description: 'Test Description',
      };
      mockGroupService.getGroupById.mockResolvedValue(expectedResult);

      await controller.getGroupById(mockRequest, mockResponse);

      expect(groupService.getGroupById).toHaveBeenCalledWith('1', 'user1');
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.OK,
        message: 'Group found successfully',
        data: expectedResult,
      });
    });

    it('should throw an error when service fails', async () => {
      const mockRequest = {
        params: { id: '1' },
        user: { id: 'user1' },
      };

      const error = new Error('Service error');
      mockGroupService.getGroupById.mockRejectedValue(error);

      await expect(
        controller.getGroupById(mockRequest, mockResponse),
      ).rejects.toThrow(error);
    });
  });

  describe('Guards and Decorators', () => {
    it('should have JwtAuthGuard and RolesGuard for createGroup', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        GroupController.prototype.createGroup,
      );
      expect(guards).toHaveLength(2);
      expect(new guards[0]()).toBeInstanceOf(JwtAuthGuard);
      expect(new guards[1]()).toBeInstanceOf(RolesGuard);
    });

    it('should have SUPER_ADMIN role required for createGroup', () => {
      const roles = Reflect.getMetadata(
        ROLES_KEY,
        GroupController.prototype.createGroup,
      );
      expect(roles).toEqual([UserRole.SUPER_ADMIN]);
    });

    it('should have JwtAuthGuard and RolesGuard for getGroupById', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        GroupController.prototype.getGroupById,
      );
      expect(guards).toHaveLength(2);
      expect(new guards[0]()).toBeInstanceOf(JwtAuthGuard);
      expect(new guards[1]()).toBeInstanceOf(RolesGuard);
    });

    it('should have ADMIN role required for getGroupById', () => {
      const roles = Reflect.getMetadata(
        ROLES_KEY,
        GroupController.prototype.getGroupById,
      );
      expect(roles).toEqual([UserRole.ADMIN]);
    });
  });
});
