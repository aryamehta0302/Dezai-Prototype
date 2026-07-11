import { Controller, Post, Body, Get, Param, Patch, Req, UseGuards, HttpCode, HttpStatus, Query, BadRequestException, Res, NotFoundException } from '@nestjs/common';
import { EnterpriseCredentialsService } from '../services/enterprise-credentials.service';
import { EnterpriseTemplateService } from '../services/enterprise-template.service';
import { CreateEnterpriseCredentialDto } from '../dto/CreateEnterpriseCredentialDto';
import { UpdateEnterpriseCredentialStatusDto } from '../dto/UpdateEnterpriseCredentialStatusDto';
import { VerifyStatus, ComplianceTrack, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Response } from 'express';

@Controller('enterprise-credentials')
export class EnterpriseCredentialsController {
    constructor(
        private readonly service: EnterpriseCredentialsService,
        private readonly templateService: EnterpriseTemplateService,
    ) { }

    @Post('issue')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.DEZAI_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.ORGANIZATION_MANAGER)
    async issueNewCredential(@Req() req, @Body() createData: CreateEnterpriseCredentialDto) {
        const credential = await this.service.issueCredential(createData, req.user.id);
        return { success: true, credential };
    }

    @Get('verify/:code')
    async verify(@Param('code') code: string, @Req() req, @Res({ passthrough: true }) res: Response) {
        // Validation: 18 chars uppercase hex or length-matching
        if (!code) {
            throw new BadRequestException('Verification code is required');
        }

        const result = await this.service.verifyCredential(code);

        // Set cache control headers
        if (result.valid && result.status === 'ACTIVE') {
            res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
        } else {
            res.setHeader('Cache-Control', 'no-store, must-revalidate');
        }

        return {
            success: result.valid,
            valid: result.valid,
            credential: result.data || null,
            data: result.data || null,
            message: result.message,
            status: result.status || null,
            tampered: result.tampered || false,
        };
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.DEZAI_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.ORGANIZATION_MANAGER)
    async updateStatus(
        @Param('id') id: string,
        @Req() req,
        @Body() updateData: UpdateEnterpriseCredentialStatusDto
    ) {
        const credential = await this.service.changeCredentialStatus(id, updateData.status, req.user.id, updateData.reason);
        return { success: true, credential };
    }

    @Post('batch-status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.DEZAI_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.ORGANIZATION_MANAGER)
    @HttpCode(HttpStatus.OK)
    async batchStatusUpdate(
        @Req() req,
        @Body('ids') ids: string[],
        @Body('status') status: VerifyStatus,
        @Body('reason') reason?: string,
    ) {
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            throw new BadRequestException('IDs array is required');
        }
        const result = await this.service.batchStatusUpdate(ids, status, req.user.id, reason);
        return { success: true, ...result };
    }

    @Get('employee/me')
    @UseGuards(JwtAuthGuard)
    async getMyCredentials(@Req() req) {
        const credentials = await this.service.getEmployeeCredentialsByUserId(req.user.id);
        return { success: true, credentials };
    }

    @Get('employee/:employeeId')
    @UseGuards(JwtAuthGuard)
    async getEmployeeCredentials(@Param('employeeId') employeeId: string) {
        const credentials = await this.service.getEmployeeCredentials(employeeId);
        return { success: true, credentials };
    }

    @Get('user/:userId')
    @UseGuards(JwtAuthGuard)
    async getEmployeeCredentialsByUserId(@Param('userId') userId: string) {
        const credentials = await this.service.getEmployeeCredentialsByUserId(userId);
        return { success: true, credentials };
    }

    @Get('analytics')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.DEZAI_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.ORGANIZATION_MANAGER)
    async getCredentialAnalytics(@Req() req, @Query('organizationId') orgId?: string) {
        // For security, if non-DezaiAdmin, use the user's mapped organizationId
        let organizationId = orgId;
        if (req.user.role !== UserRole.DEZAI_ADMIN) {
            const employee = await this.service['prisma'].employee.findUnique({ where: { userId: req.user.id } });
            const orgAdmin = await this.service['prisma'].organizationAdmin.findUnique({ where: { userId: req.user.id } });
            organizationId = employee?.organizationId || orgAdmin?.organizationId;
        }

        if (!organizationId) {
            throw new BadRequestException('Organization ID is required');
        }

        const stats = await this.service.getCredentialAnalytics(organizationId);
        return { success: true, ...stats };
    }

    @Get('templates')
    @UseGuards(JwtAuthGuard)
    async getAllTemplates(@Req() req, @Query('organizationId') orgId?: string) {
        let organizationId = orgId;
        if (req.user.role !== UserRole.DEZAI_ADMIN) {
            const employee = await this.service['prisma'].employee.findUnique({ where: { userId: req.user.id } });
            const orgAdmin = await this.service['prisma'].organizationAdmin.findUnique({ where: { userId: req.user.id } });
            organizationId = employee?.organizationId || orgAdmin?.organizationId;
        }

        if (!organizationId) {
            throw new BadRequestException('Organization ID is required');
        }

        const templates = await this.templateService.getAllTemplates(organizationId);
        return { success: true, templates };
    }

    @Get('search')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.DEZAI_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.ORGANIZATION_MANAGER)
    async searchCredentials(
        @Req() req,
        @Query('organizationId') orgId?: string,
        @Query('query') query?: string,
        @Query('status') status?: VerifyStatus,
        @Query('track') track?: ComplianceTrack,
        @Query('departmentId') departmentId?: string,
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        let organizationId = orgId;
        if (req.user.role !== UserRole.DEZAI_ADMIN) {
            const employee = await this.service['prisma'].employee.findUnique({ where: { userId: req.user.id } });
            const orgAdmin = await this.service['prisma'].organizationAdmin.findUnique({ where: { userId: req.user.id } });
            organizationId = employee?.organizationId || orgAdmin?.organizationId;
        }

        if (!organizationId) {
            throw new BadRequestException('Organization ID is required');
        }

        const result = await this.service.searchCredentials(organizationId, {
            query,
            status,
            track,
            departmentId,
            dateFrom,
            dateTo,
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
        });

        return { success: true, ...result };
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getDetails(@Param('id') id: string) {
        const credential = await this.service.getCredentialDetails(id);
        return { success: true, credential };
    }
}
