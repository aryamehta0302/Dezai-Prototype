import { Controller, Post, Body, Get, Param, Patch, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { CredentialsService } from '../services/credentials.service';
import { TemplateService } from '../services/template.service';
import { CreateCredentialDto } from '../dto/CreateCredentialDto';
import { UpdateCredentialStatusDto } from '../dto/UpdateCredentialStatusDto';
import { CredentialType } from '@prisma/client';
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
        return result;
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.DEZAI_ADMIN, UserRole.UNIVERSITY_ADMIN, UserRole.FACULTY)
    async updateStatus(
        @Param('id') id: string,
        @Req() req,
        @Body() updateData: UpdateCredentialStatusDto
    ) {
        const credential = await this.credentialsService.changeCredentialStatus(id, updateData.status, req.user.id);
        return { success: true, credential };
    }

    @Get('student/:userId')
    @UseGuards(JwtAuthGuard)
    async getStudentCredentials(@Param('userId') userId: string) {
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

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getDetails(@Param('id') id: string) {
        const credential = await this.credentialsService.getCredentialDetails(id);
        return { success: true, credential };
    }
}
