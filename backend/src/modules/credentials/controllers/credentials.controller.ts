// Imports ko update karo (Param, Get, Patch add kiya hai)
import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { CredentialsService } from '../services/credentials.service';
import { TemplateService } from '../services/template.service';
import { CreateCredentialDto } from '../dto/CreateCredentialDto';
import { UpdateCredentialStatusDto } from '../dto/UpdateCredentialStatusDto';
import { CredentialType } from '../dto/TemplateDto';

@Controller('api/credentials')
export class CredentialsController {
    constructor(
        private readonly credentialsService: CredentialsService,
        private readonly templateService: TemplateService
    ) { }

    // Routing the credential issuance
    @Post('issue')
    async issueNewCredential(@Body() createData: CreateCredentialDto) {
        return await this.credentialsService.issueCredential(createData);
    }

    // Routing the actual validation
    @Get('verify/:code')
    async verify(@Param('code') code: string) {
        return await this.credentialsService.verifyCredential(code);
    }

    //status update route
    @Patch(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body() updateData: UpdateCredentialStatusDto
    ) {
        return await this.credentialsService.changeCredentialStatus(id, updateData.status);
    }

    // student center route
    @Get('student/:userId')
    async getStudentCredentials(@Param('userId') userId: string) {
        return await this.credentialsService.getStudentCredentials(userId);
    }

    // faculty dashboard route
    @Get('all')
    async getAllCredentials() {
        return await this.credentialsService.getAllCredentials();
    }

    // template routes
    @Get('templates')
    async getAllTemplates() {
        return await this.templateService.getAllTemplates();
    }

    @Get('templates/:type')
    async getTemplatesByType(@Param('type') type: CredentialType) {
        return await this.templateService.getTemplatesByType(type);
    }
}