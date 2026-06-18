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
} from "@nestjs/common";
import { AssessmentService } from "../services/assessment.service";
import { QuestionSelectionService } from "../services/question-selection.service";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { UserRole, ViolationType } from "@prisma/client";
import {
  CreateQuestionBankDto,
  UpdateQuestionBankDto,
  CreateQuestionDto,
  UpdateQuestionDto,
  CreateAssessmentDto,
  UpdateAssessmentDto,
} from "../dto/assessment.dto";

@Controller("assessments")
export class AssessmentController {
  constructor(
    private readonly assessmentService: AssessmentService,
    private readonly questionSelectionService: QuestionSelectionService
  ) {}

  // ─────────────────── QUESTION BANKS ───────────────────

  @Get("question-banks")
  @UseGuards(JwtAuthGuard)
  async getQuestionBanks(
    @Query("institutionId") institutionId?: string
  ) {
    const questionBanks =
      await this.assessmentService.getQuestionBanks(institutionId);
    return { success: true, questionBanks };
  }

  @Get("question-banks/:id")
  @UseGuards(JwtAuthGuard)
  async getQuestionBankById(@Param("id") id: string) {
    const questionBank =
      await this.assessmentService.getQuestionBankById(id);
    return { success: true, questionBank };
  }

  @Post("question-banks")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async createQuestionBank(@Req() req, @Body() body: CreateQuestionBankDto) {
    const questionBank = await this.assessmentService.createQuestionBank(
      req.user.id,
      req.user.role as UserRole,
      body
    );
    return { success: true, questionBank };
  }

  @Put("question-banks/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async updateQuestionBank(
    @Param("id") id: string,
    @Req() req,
    @Body() body: UpdateQuestionBankDto
  ) {
    await this.assessmentService.validateQuestionBankOwnership(
      req.user.id,
      id,
      req.user.role as UserRole
    );
    const questionBank = await this.assessmentService.updateQuestionBank(
      id,
      body,
      req.user.id
    );
    return { success: true, questionBank };
  }

  @Delete("question-banks/:id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async deleteQuestionBank(@Param("id") id: string, @Req() req) {
    await this.assessmentService.validateQuestionBankOwnership(
      req.user.id,
      id,
      req.user.role as UserRole
    );
    await this.assessmentService.deleteQuestionBank(id, req.user.id);
    return { success: true, message: "Question bank deleted" };
  }

  // ─────────────────── QUESTIONS ───────────────────

  @Post("question-banks/:bankId/questions")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async createQuestion(
    @Param("bankId") bankId: string,
    @Req() req,
    @Body() body: CreateQuestionDto
  ) {
    await this.assessmentService.validateQuestionBankOwnership(
      req.user.id,
      bankId,
      req.user.role as UserRole
    );
    const question = await this.assessmentService.createQuestion(
      bankId,
      body,
      req.user.id
    );
    return { success: true, question };
  }

  @Put("questions/:questionId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async updateQuestion(
    @Param("questionId") questionId: string,
    @Req() req,
    @Body() body: UpdateQuestionDto
  ) {
    const question = await this.assessmentService.updateQuestion(
      questionId,
      body,
      req.user.id
    );
    return { success: true, question };
  }

  @Delete("questions/:questionId")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async deleteQuestion(
    @Param("questionId") questionId: string,
    @Req() req
  ) {
    await this.assessmentService.deleteQuestion(questionId, req.user.id);
    return { success: true, message: "Question deleted" };
  }

  @Post("questions/:questionId/duplicate")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async duplicateQuestion(
    @Param("questionId") questionId: string,
    @Req() req
  ) {
    const question = await this.assessmentService.duplicateQuestion(
      questionId,
      req.user.id
    );
    return { success: true, question };
  }

  // ─────────────────── ASSESSMENTS ───────────────────

  @Get("modules/:moduleId")
  @UseGuards(JwtAuthGuard)
  async getAssessmentsByModule(@Param("moduleId") moduleId: string) {
    const assessments =
      await this.assessmentService.getAssessmentsByModule(moduleId);
    return { success: true, assessments };
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async getAssessmentById(@Param("id") id: string) {
    const assessment = await this.assessmentService.getAssessmentById(id);
    return { success: true, assessment };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async createAssessment(@Req() req, @Body() body: CreateAssessmentDto) {
    const assessment = await this.assessmentService.createAssessment(
      body,
      req.user.id
    );
    return { success: true, assessment };
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async updateAssessment(
    @Param("id") id: string,
    @Req() req,
    @Body() body: UpdateAssessmentDto
  ) {
    const assessment = await this.assessmentService.updateAssessment(
      id,
      body,
      req.user.id
    );
    return { success: true, assessment };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async deleteAssessment(@Param("id") id: string, @Req() req) {
    await this.assessmentService.deleteAssessment(id, req.user.id);
    return { success: true, message: "Assessment deleted" };
  }

  // ─────────────────── DYNAMIC QUESTION SELECTION ───────────────────

  @Get(":id/questions/select")
  @UseGuards(JwtAuthGuard)
  async selectQuestions(@Param("id") id: string) {
    const selection =
      await this.questionSelectionService.selectQuestions(id);
    return { success: true, selection };
  }

  // ─────────────────── FACULTY ANALYTICS ───────────────────

  @Get(":id/analytics")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async getAssessmentAnalytics(@Param("id") id: string) {
    const analytics =
      await this.assessmentService.getAssessmentAnalytics(id);
    return { success: true, analytics };
  }

  // ─────────────────── EXAM SESSIONS & PROCTORING ───────────────────

  @Get("sessions/active")
  @UseGuards(JwtAuthGuard)
  async getActiveSession(@Req() req, @Query("assessmentId") assessmentId?: string) {
    const session = await this.assessmentService.getActiveSession(req.user.id, assessmentId);
    return { success: true, session };
  }

  @Post("sessions")
  @UseGuards(JwtAuthGuard)
  async createSession(@Req() req, @Body() body: { assessmentId: string }) {
    const session = await this.assessmentService.createSession(req.user.id, body.assessmentId);
    return { success: true, session };
  }

  @Get("sessions/:id")
  @UseGuards(JwtAuthGuard)
  async getSessionById(@Req() req, @Param("id") id: string) {
    const session = await this.assessmentService.getSession(req.user.id, id);
    return { success: true, session };
  }

  @Post("sessions/:id/violations")
  @UseGuards(JwtAuthGuard)
  async logViolation(
    @Req() req,
    @Param("id") id: string,
    @Body() body: { type: ViolationType }
  ) {
    const session = await this.assessmentService.logViolation(req.user.id, id, body.type);
    return { success: true, session };
  }

  @Post("sessions/:id/submit")
  @UseGuards(JwtAuthGuard)
  async submitSession(
    @Req() req,
    @Param("id") id: string,
    @Body() body: { answers: Record<string, string> }
  ) {
    const result = await this.assessmentService.submitSession(req.user.id, id, body.answers);
    return { success: true, ...result };
  }
}
