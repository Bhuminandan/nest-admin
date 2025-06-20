import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from '../services/transaction.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '@core/enums/user-role.enum';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
} from '../../../application/dto/transaction.dto';
import { HttpStatus } from '@nestjs/common';
import { ROLES_KEY } from 'src/infrastructure/auth/decorators/roles.decorator';

describe('TransactionController', () => {
  let controller: TransactionController;
  let transactionService: TransactionService;

  const mockTransactionService = {
    createTransaction: jest.fn(),
    getAllTransactionsByUser: jest.fn(),
    getTransactionById: jest.fn(),
    getAllTransactions: jest.fn(),
    deleteTransaction: jest.fn(),
    updateTransaction: jest.fn(),
    getFile: jest.fn(),
  };

  const mockFile = {
    originalname: 'test.jpg',
    buffer: Buffer.from('test'),
  } as Express.Multer.File;

  const mockRequest = {
    user: { id: 'user-id', role: UserRole.USER },
    params: { id: 'transaction-id' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    transactionService = module.get<TransactionService>(TransactionService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTransaction', () => {
    const createTransactionDto: CreateTransactionDto = {
      title: 'Test Transaction',
      description: 'Test Description',
    };

    it('should create a transaction', async () => {
      const mockResult = { id: '1', ...createTransactionDto };
      mockTransactionService.createTransaction.mockResolvedValue(mockResult);

      const result = await controller.createTransaction(
        mockRequest,
        createTransactionDto,
        mockFile,
      );

      expect(transactionService.createTransaction).toHaveBeenCalledWith(
        createTransactionDto,
        mockRequest.user.id,
        mockFile,
      );
      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Transaction created successfully',
        data: mockResult,
      });
    });

    it('should have JwtAuthGuard and RolesGuard', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        TransactionController.prototype.createTransaction,
      );
      expect(guards).toHaveLength(2);
      expect(new guards[0]()).toBeInstanceOf(JwtAuthGuard);
      expect(new guards[1]()).toBeInstanceOf(RolesGuard);
    });

    it('should require USER role', () => {
      const roles = Reflect.getMetadata(
        ROLES_KEY,
        TransactionController.prototype.createTransaction,
      );
      expect(roles).toEqual([UserRole.USER]);
    });
  });

  describe('getFile', () => {
    it('should get a transaction file', async () => {
      const fileName = 'test-file.txt';
      const mockFileContent = 'file-content';
      mockTransactionService.getFile.mockResolvedValue(mockFileContent);

      const result = await controller.getFile(fileName);

      expect(transactionService.getFile).toHaveBeenCalledWith(fileName);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'File found successfully',
        data: mockFileContent,
      });
    });

    it('should have JwtAuthGuard and RolesGuard', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        TransactionController.prototype.getFile,
      );
      expect(guards).toHaveLength(2);
      expect(new guards[0]()).toBeInstanceOf(JwtAuthGuard);
      expect(new guards[1]()).toBeInstanceOf(RolesGuard);
    });

    it('should allow USER, POWER_USER and SUPPORT_DESK roles', () => {
      const roles = Reflect.getMetadata(
        ROLES_KEY,
        TransactionController.prototype.getFile,
      );
      expect(roles).toEqual([
        UserRole.USER,
        UserRole.POWER_USER,
        UserRole.SUPPORT_DESK,
      ]);
    });
  });

  describe('getAllTransactionsByUser', () => {
    it('should get all transactions for user', async () => {
      const mockTransactions = [{ id: '1' }, { id: '2' }];
      mockTransactionService.getAllTransactionsByUser.mockResolvedValue(
        mockTransactions,
      );

      const result = await controller.getAllTransactionsByUser(
        mockRequest,
        1,
        10,
      );

      expect(transactionService.getAllTransactionsByUser).toHaveBeenCalledWith(
        mockRequest.user.id,
        1,
        10,
      );
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Transactions found successfully',
        data: mockTransactions,
      });
    });

    it('should have JwtAuthGuard and RolesGuard', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        TransactionController.prototype.getAllTransactionsByUser,
      );
      expect(guards).toHaveLength(2);
      expect(new guards[0]()).toBeInstanceOf(JwtAuthGuard);
      expect(new guards[1]()).toBeInstanceOf(RolesGuard);
    });

    it('should require USER role', () => {
      const roles = Reflect.getMetadata(
        ROLES_KEY,
        TransactionController.prototype.getAllTransactionsByUser,
      );
      expect(roles).toEqual([UserRole.USER]);
    });
  });

  describe('getAllTransactions', () => {
    it('should get all transactions (for power user and support desk)', async () => {
      const mockTransactions = [{ id: '1' }, { id: '2' }];
      mockTransactionService.getAllTransactions.mockResolvedValue(
        mockTransactions,
      );

      const result = await controller.getAllTransactions(mockRequest, 1, 10);

      expect(transactionService.getAllTransactions).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Transactions found successfully',
        data: mockTransactions,
      });
    });

    it('should have JwtAuthGuard and RolesGuard', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        TransactionController.prototype.getAllTransactions,
      );
      expect(guards).toHaveLength(2);
      expect(new guards[0]()).toBeInstanceOf(JwtAuthGuard);
      expect(new guards[1]()).toBeInstanceOf(RolesGuard);
    });

    it('should require POWER_USER or SUPPORT_DESK role', () => {
      const roles = Reflect.getMetadata(
        ROLES_KEY,
        TransactionController.prototype.getAllTransactions,
      );
      expect(roles).toEqual([UserRole.POWER_USER, UserRole.SUPPORT_DESK]);
    });
  });

  describe('getTransactionById', () => {
    it('should get a transaction by id', async () => {
      const mockTransaction = { id: 'transaction-id' };
      mockTransactionService.getTransactionById.mockResolvedValue(
        mockTransaction,
      );

      const result = await controller.getTransactionById(mockRequest);

      expect(transactionService.getTransactionById).toHaveBeenCalledWith(
        mockRequest.params.id,
      );
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Transaction found successfully',
        data: mockTransaction,
      });
    });

    it('should have JwtAuthGuard and RolesGuard', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        TransactionController.prototype.getTransactionById,
      );
      expect(guards).toHaveLength(2);
      expect(new guards[0]()).toBeInstanceOf(JwtAuthGuard);
      expect(new guards[1]()).toBeInstanceOf(RolesGuard);
    });

    it('should require POWER_USER or SUPPORT_DESK role', () => {
      const roles = Reflect.getMetadata(
        ROLES_KEY,
        TransactionController.prototype.getTransactionById,
      );
      expect(roles).toEqual([UserRole.POWER_USER, UserRole.SUPPORT_DESK]);
    });
  });

  describe('deleteTransaction', () => {
    it('should delete a transaction', async () => {
      mockTransactionService.deleteTransaction.mockResolvedValue(undefined);

      const result = await controller.deleteTransaction(mockRequest);

      expect(transactionService.deleteTransaction).toHaveBeenCalledWith(
        mockRequest.params.id,
        mockRequest.user.id,
      );
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Transaction deleted successfully',
      });
    });

    it('should have JwtAuthGuard and RolesGuard', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        TransactionController.prototype.deleteTransaction,
      );
      expect(guards).toHaveLength(2);
      expect(new guards[0]()).toBeInstanceOf(JwtAuthGuard);
      expect(new guards[1]()).toBeInstanceOf(RolesGuard);
    });

    it('should require USER role', () => {
      const roles = Reflect.getMetadata(
        ROLES_KEY,
        TransactionController.prototype.deleteTransaction,
      );
      expect(roles).toEqual([UserRole.USER]);
    });
  });

  describe('updateTransaction', () => {
    const updateTransactionDto: UpdateTransactionDto = {
      title: 'Updated Title',
      description: 'Updated Description',
    };

    it('should update a transaction', async () => {
      const mockResult = { id: '1', ...updateTransactionDto };
      mockTransactionService.updateTransaction.mockResolvedValue(mockResult);

      const result = await controller.updateTransaction(
        mockRequest,
        mockRequest.params.id,
        updateTransactionDto,
        mockFile,
      );

      expect(transactionService.updateTransaction).toHaveBeenCalledWith(
        mockRequest.params.id,
        updateTransactionDto,
        mockRequest.user.id,
        mockFile,
      );
      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Transaction updated successfully',
        data: mockResult,
      });
    });

    it('should have JwtAuthGuard and RolesGuard', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        TransactionController.prototype.updateTransaction,
      );
      expect(guards).toHaveLength(2);
      expect(new guards[0]()).toBeInstanceOf(JwtAuthGuard);
      expect(new guards[1]()).toBeInstanceOf(RolesGuard);
    });

    it('should require USER role', () => {
      const roles = Reflect.getMetadata(
        ROLES_KEY,
        TransactionController.prototype.updateTransaction,
      );
      expect(roles).toEqual([UserRole.USER]);
    });
  });
});
