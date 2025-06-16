import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GroupService } from '../services/group.service';
import { CreateGroupDto } from 'src/application/dto/group.dto';
import { JwtAuthGuard } from 'src/infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/infrastructure/auth/guards/roles.guard';
import { UserRole } from '@core/enums/user-role.enum';
import { Roles } from 'src/infrastructure/auth/decorators/roles.decorator';
import { Response } from 'express';

@ApiTags('Authentication')
@Controller('group')
export class GroupController {
  constructor(private readonly gruopService: GroupService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new group, for SUPER_ADMIN only' })
  @ApiBody({ type: CreateGroupDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Group created successfully',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async createGroup(
    @Body() createGroupDto: CreateGroupDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.gruopService.createGroup(createGroupDto);
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        message: 'Group created successfully',
        data: result,
      });
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get group by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Group found successfully',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async getGroupById(@Req() req, @Res() res: Response) {
    try {
      const result = await this.gruopService.getGroupById(
        req.params.id,
        req.user.id,
      );
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Group found successfully',
        data: result,
      });
    } catch (error) {
      throw error;
    }
  }
}
