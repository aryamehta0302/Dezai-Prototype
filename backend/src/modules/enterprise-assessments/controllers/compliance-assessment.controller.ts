import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ComplianceAssessmentService } from '../services/compliance-assessment.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  CreateComplianceAssessmentDto,
  UpdateComplianceAssessmentDto,
} from '../dto/enterprise-assessment.dto';

@Controller('enterprise/assessments/compliance')
@UseGuards(JwtAuthGuard)
export class ComplianceAssessmentController {
  constructor(
    private readonly assessmentService: ComplianceAssessmentService,
  ) {}

  @Get()
  async getAssessments(
    @Query('organizationId') organizationId?: string,
    @Query('complianceTrack') complianceTrack?: string,
  ) {
    const assessments = await this.assessmentService.getAssessments(
      organizationId,
      complianceTrack,
    );
    return { success: true, assessments };
  }

  @Get(':id')
  async getAssessmentById(@Param('id') id: string) {
    const assessment = await this.assessmentService.getAssessmentById(id);
    return { success: true, assessment };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.DEZAI_ADMIN)
  async createAssessment(@Req() req, @Body() body: CreateComplianceAssessmentDto) {
    const assessment = await this.assessmentService.createAssessment(
      body,
      req.user.id,
    );
    return { success: true, assessment };
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DEZAI_ADMIN)
  async updateAssessment(
    @Param('id') id: string,
    @Req() req,
    @Body() body: UpdateComplianceAssessmentDto,
  ) {
    await this.assessmentService.validateAssessmentOwnership(
      req.user.id,
      id,
      req.user.role as UserRole,
    );
    const assessment = await this.assessmentService.updateAssessment(
      id,
      body,
      req.user.id,
    );
    return { success: true, assessment };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.DEZAI_ADMIN)
  async deleteAssessment(@Param('id') id: string, @Req() req) {
    await this.assessmentService.validateAssessmentOwnership(
      req.user.id,
      id,
      req.user.role as UserRole,
    );
    await this.assessmentService.deleteAssessment(id, req.user.id);
    return { success: true, message: 'Compliance assessment deleted' };
  }

  @Get(':id/questions/select')
  async selectQuestions(@Param('id') id: string) {
    const selection = await this.assessmentService.selectEnterpriseQuestions(id);
    return { success: true, selection };
  }
}
