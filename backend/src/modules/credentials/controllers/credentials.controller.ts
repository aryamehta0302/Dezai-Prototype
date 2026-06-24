import { Controller, Post, Body, Get, Param, Patch, Req, UseGuards, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { CredentialsService } from '../services/credentials.service';
import { TemplateService } from '../services/template.service';
import { CreateCredentialDto } from '../dto/CreateCredentialDto';
import { UpdateCredentialStatusDto } from '../dto/UpdateCredentialStatusDto';
import { CredentialType, VerifyStatus, CredentialTier } from '@prisma/client';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/credentials')
export class CredentialsController {
    constructor(
        private readonly credentialsService: CredentialsService,
        private readonly templateService: TemplateService
    ) { }

    @Post('issue')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.DEZAI_ADMIN, UserRole.UNIVERSITY_ADMIN, UserRole.FACULTY)
    async issueNewCredential(@Req() req, @Body() createData: CreateCredentialDto) {
        const credential = await this.credentialsService.issueCredential(createData);
        return { success: true, credential };
    }

    @Post('claim')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async claim(@Req() req, @Body('programId') programId: string) {
        const cred = await this.credentialsService.issueStudentCredential(req.user.id, programId);
        return { success: true, credential: cred };
    }

    @Get('verify/:code')
    async verify(@Param('code') code: string) {
        const result = await this.credentialsService.verifyCredential(code);
        return {
            success: result.valid,
            valid: result.valid,
            credential: result.data || null,
            data: result.data || null,
            message: result.message
        };
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.DEZAI_ADMIN, UserRole.UNIVERSITY_ADMIN, UserRole.FACULTY)
    async updateStatus(
        @Param('id') id: string,
        @Req() req,
        @Body() updateData: UpdateCredentialStatusDto
    ) {
        const credential = await this.credentialsService.changeCredentialStatus(id, updateData.status, req.user.id, updateData.reason);
        return { success: true, credential };
    }

    @Get('student')
    @UseGuards(JwtAuthGuard)
    async getStudentCredentials(@Req() req) {
        const credentials = await this.credentialsService.getStudentCredentials(req.user.id);
        return { success: true, credentials };
    }

    @Get('student/:userId')
    @UseGuards(JwtAuthGuard)
    async getStudentCredentialsByParam(@Param('userId') userId: string) {
        const credentials = await this.credentialsService.getStudentCredentials(userId);
        return { success: true, credentials };
    }

    @Get('all')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.DEZAI_ADMIN, UserRole.UNIVERSITY_ADMIN, UserRole.FACULTY)
    async getAllCredentials() {
        const credentials = await this.credentialsService.getAllCredentials();
        return { success: true, credentials };
    }

    @Get('analytics')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.DEZAI_ADMIN, UserRole.UNIVERSITY_ADMIN, UserRole.FACULTY)
    async getCredentialAnalytics() {
        const stats = await this.credentialsService.getCredentialAnalytics();
        return { success: true, ...stats };
    }

    @Get('templates')
    async getAllTemplates() {
        const templates = await this.templateService.getAllTemplates();
        return { success: true, templates };
    }

    @Get('templates/:type')
    async getTemplatesByType(@Param('type') type: CredentialType) {
        const templates = await this.templateService.getTemplatesByType(type);
        return { success: true, templates };
    }

    @Get('stats')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.DEZAI_ADMIN, UserRole.UNIVERSITY_ADMIN, UserRole.FACULTY)
    async getCredentialStats() {
        const stats = await this.credentialsService.getCredentialStats();
        return { success: true, ...stats };
    }

    @Get(':id/audit')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.DEZAI_ADMIN, UserRole.UNIVERSITY_ADMIN, UserRole.FACULTY)
    async getAuditHistory(@Param('id') id: string) {
        const history = await this.credentialsService.getCredentialAuditHistory(id);
        return { success: true, ...history };
    }

    @Get('search')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.DEZAI_ADMIN, UserRole.UNIVERSITY_ADMIN, UserRole.FACULTY)
    async searchCredentials(
        @Query('query') query?: string,
        @Query('status') status?: VerifyStatus,
        @Query('tier') tier?: CredentialTier,
        @Query('programId') programId?: string,
        @Query('issuerId') issuerId?: string,
        @Query('institutionId') institutionId?: string,
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const result = await this.credentialsService.searchCredentials({
            query, status, tier, programId, issuerId, institutionId,
            dateFrom, dateTo,
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
        });
        return { success: true, ...result };
    }

    @Post('batch-status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.DEZAI_ADMIN, UserRole.UNIVERSITY_ADMIN, UserRole.FACULTY)
    @HttpCode(HttpStatus.OK)
    async batchStatusUpdate(
        @Req() req,
        @Body('ids') ids: string[],
        @Body('status') status: VerifyStatus,
        @Body('reason') reason?: string,
    ) {
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return { success: false, message: 'IDs array is required' };
        }
        const result = await this.credentialsService.batchStatusUpdate(ids, status, req.user.id, reason);
        return { success: true, ...result };
    }

    @Get('activity')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.DEZAI_ADMIN, UserRole.UNIVERSITY_ADMIN, UserRole.FACULTY)
    async getActivity(
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
    ) {
        const result = await this.credentialsService.getActivityFeed(
            limit ? parseInt(limit) : undefined,
            offset ? parseInt(offset) : undefined,
        );
        return { success: true, ...result };
    }

    @Get('enhanced-analytics')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.DEZAI_ADMIN, UserRole.UNIVERSITY_ADMIN, UserRole.FACULTY)
    async getEnhancedAnalytics() {
        const analytics = await this.credentialsService.getEnhancedAnalytics();
        return { success: true, ...analytics };
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getDetails(@Param('id') id: string) {
        const credential = await this.credentialsService.getCredentialDetails(id);
        return { success: true, credential };
    }
}

