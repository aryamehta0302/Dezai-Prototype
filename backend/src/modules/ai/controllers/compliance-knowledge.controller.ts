import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ComplianceKnowledgeService } from '../services/compliance-knowledge.service';
import {
  ComplianceChatDto,
  RegenerateComplianceContentDto,
  UploadComplianceDocumentDto,
} from '../dto/compliance-knowledge.dto';

@Controller('ai-mentor/compliance')
@UseGuards(JwtAuthGuard)
export class ComplianceKnowledgeController {
  constructor(
    private readonly complianceKnowledgeService: ComplianceKnowledgeService,
  ) {}

  @Post('documents')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadDocument(
    @Req() req,
    @UploadedFile() file: any,
    @Body() dto: UploadComplianceDocumentDto,
  ) {
    const result = await this.complianceKnowledgeService.uploadDocument(
      req.user.id,
      file,
      dto,
    );

    return { success: true, ...result };
  }

  @Get('documents')
  @HttpCode(HttpStatus.OK)
  async listDocuments(
    @Req() req,
    @Query('organizationId') organizationId?: string,
  ) {
    const documents = await this.complianceKnowledgeService.listDocuments(
      req.user.id,
      organizationId,
    );

    return { success: true, documents };
  }

  @Get('documents/:documentId')
  @HttpCode(HttpStatus.OK)
  async getDocument(@Req() req, @Param('documentId') documentId: string) {
    const result = await this.complianceKnowledgeService.getDocument(
      req.user.id,
      documentId,
    );

    return { success: true, ...result };
  }

  @Post('documents/:documentId/generate')
  @HttpCode(HttpStatus.OK)
  async regenerateContent(
    @Req() req,
    @Param('documentId') documentId: string,
    @Body() dto: RegenerateComplianceContentDto,
  ) {
    const generatedContent = dto.type
      ? [
          await this.complianceKnowledgeService.generateContent(
            documentId,
            req.user.id,
            dto.type,
          ),
        ]
      : await this.complianceKnowledgeService.generateAllContent(
          documentId,
          req.user.id,
        );

    return { success: true, generatedContent };
  }

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(@Req() req, @Body() dto: ComplianceChatDto) {
    return this.complianceKnowledgeService.chat(req.user.id, dto);
  }
}
