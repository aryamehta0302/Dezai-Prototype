import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PlatformUserService } from '../services/platform-user.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../../../common/guards/super-admin.guard';
import { UserRole, AccountStatus } from '@prisma/client';
import { SuspendUserDto, AssignAdminRoleDto } from '../dto/platform-user.dto';

@Controller('platform-admin/users')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class PlatformUserController {
  constructor(private readonly userService: PlatformUserService) {}

  @Get()
  async getAllUsers(
    @Query('role') role?: UserRole,
    @Query('status') status?: AccountStatus,
    @Query('search') search?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;
    return this.userService.getAllUsers({ role, status, search, skip, take });
  }

  @Get('students')
  async getStudents(
    @Query('search') search?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;
    return this.userService.getAllUsers({ role: UserRole.STUDENT, search, skip, take });
  }

  @Get('faculty')
  async getFaculty(
    @Query('search') search?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;
    return this.userService.getAllUsers({ role: UserRole.FACULTY, search, skip, take });
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Post(':id/suspend')
  @HttpCode(HttpStatus.OK)
  async suspendUser(@Req() req, @Param('id') id: string, @Body() body: SuspendUserDto) {
    return this.userService.suspendUser(id, req.user.id || req.user.userId, body);
  }

  @Post(':id/reactivate')
  @HttpCode(HttpStatus.OK)
  async reactivateUser(@Req() req, @Param('id') id: string) {
    return this.userService.reactivateUser(id, req.user.id || req.user.userId);
  }

  @Post(':id/assign-role')
  @HttpCode(HttpStatus.OK)
  async assignAdminRole(@Req() req, @Param('id') id: string, @Body() body: AssignAdminRoleDto) {
    return this.userService.assignAdminRole(id, body, req.user.id || req.user.userId);
  }

  @Post(':id/revoke-role')
  @HttpCode(HttpStatus.OK)
  async revokeAdminRole(@Req() req, @Param('id') id: string) {
    return this.userService.revokeAdminRole(id, req.user.id || req.user.userId);
  }
}
