import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service";
import { UserRole, AuditAction, ExamStatus, ViolationType, Difficulty } from "@prisma/client";
import { AuditService } from "../../audit/services/audit.service";
import { PassFailEvaluationService } from './pass-fail-evaluation.service';
import type {
  ResultAnalyticsResponseDto,
  MissedQuestionsAnalyticsResponseDto,
} from '../dto/result.dto';
import {
  CreateQuestionBankDto,
  UpdateQuestionBankDto,
  CreateQuestionDto,
  UpdateQuestionDto,
  CreateAssessmentDto,
  UpdateAssessmentDto,
} from "../dto/assessment.dto";

// ─────────────────── SHUFFLE UTILITY ───────────────────

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

@Injectable()
export class AssessmentService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private passFailEvaluationService: PassFailEvaluationService,
  ) {}

  // ─────────────────── OWNERSHIP GUARD ───────────────────

  /**
   * Validates that the requesting user has ownership/access to a QuestionBank.
   * DEZAI_ADMIN bypasses all checks.
   * UNIVERSITY_ADMIN must belong to the same institution.
   * FACULTY must belong to the same institution as the QuestionBank.
   */
  async validateQuestionBankOwnership(
    userId: string,
    bankId: string,
    userRole: UserRole
  ): Promise<true> {
    if (userRole === UserRole.DEZAI_ADMIN) return true;

    const bank = await this.prisma.questionBank.findUnique({
      where: { id: bankId },
    });
    if (!bank) throw new NotFoundException("Question bank not found");

    if (userRole === UserRole.UNIVERSITY_ADMIN) {
      const admin = await this.prisma.institutionAdmin.findUnique({
        where: { userId },
      });
      if (!admin || admin.institutionId !== bank.institutionId) {
        throw new ForbiddenException(
          "Unauthorized: Admin institution mismatch"
        );
      }
      return true;
    }

    if (userRole === UserRole.FACULTY) {
      const faculty = await this.prisma.facultyMember.findUnique({
        where: { userId },
      });
      if (!faculty)
        throw new ForbiddenException("Faculty profile not found");
      if (faculty.institutionId !== bank.institutionId) {
        throw new ForbiddenException(
          "Unauthorized: You do not belong to this question bank's institution"
        );
      }
      return true;
    }

    throw new ForbiddenException("Unauthorized role");
  }

  // ─────────────────── QUESTION BANKS ───────────────────

  async getQuestionBanks(institutionId?: string) {
    return this.prisma.questionBank.findMany({
      where: institutionId ? { institutionId } : undefined,
      include: {
        institution: { select: { name: true, logoUrl: true } },
        faculty: { include: { user: { select: { name: true } } } },
        _count: { select: { questions: true } },
      },
    });
  }

  async getQuestionBankById(id: string) {
    const bank = await this.prisma.questionBank.findUnique({
      where: { id },
      include: {
        institution: { select: { name: true, logoUrl: true } },
        faculty: { include: { user: { select: { name: true } } } },
        questions: {
          include: { options: true },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { questions: true } },
      },
    });
    if (!bank)
      throw new NotFoundException(`Question bank with ID ${id} not found`);
    return bank;
  }

  async createQuestionBank(
    userId: string,
    userRole: UserRole,
    data: CreateQuestionBankDto
  ) {
    let institutionId = data.institutionId;
    let facultyId: string | null = null;

    if (userRole === UserRole.FACULTY) {
      const faculty = await this.prisma.facultyMember.findUnique({
        where: { userId },
      });
      if (!faculty)
        throw new ForbiddenException(
          "Faculty profile must exist to create a question bank"
        );
      facultyId = faculty.id;
      institutionId = faculty.institutionId;
    } else if (userRole === UserRole.UNIVERSITY_ADMIN) {
      const admin = await this.prisma.institutionAdmin.findUnique({
        where: { userId },
      });
      if (!admin)
        throw new ForbiddenException(
          "Admin profile must exist to create a question bank"
        );
      institutionId = admin.institutionId;
    }

    if (!institutionId)
      throw new ForbiddenException("An institutionId is required");

    const bank = await this.prisma.questionBank.create({
      data: {
        title: data.title,
        description: data.description,
        institutionId,
        facultyId,
      },
    });

    await this.auditService.logAction(
      userId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `QuestionBank "${bank.title}" (ID: ${bank.id}) created by ${userRole}`
    );

    return this.getQuestionBankById(bank.id);
  }

  async updateQuestionBank(
    id: string,
    data: UpdateQuestionBankDto,
    userId: string
  ) {
    const bank = await this.prisma.questionBank.update({
      where: { id },
      data,
    });
    await this.auditService.logAction(
      userId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `QuestionBank "${bank.title}" (ID: ${bank.id}) updated`
    );
    return bank;
  }

  async deleteQuestionBank(id: string, userId: string) {
    const bank = await this.prisma.questionBank.delete({ where: { id } });
    await this.auditService.logAction(
      userId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `QuestionBank "${bank.title}" (ID: ${bank.id}) deleted`
    );
  }

  // ─────────────────── QUESTIONS ───────────────────

  async createQuestion(bankId: string, data: CreateQuestionDto, userId: string) {
    // Verify the bank exists
    const bank = await this.prisma.questionBank.findUnique({
      where: { id: bankId },
    });
    if (!bank)
      throw new NotFoundException(`Question bank with ID ${bankId} not found`);

    const question = await this.prisma.questionBankQuestion.create({
      data: {
        questionBankId: bankId,
        text: data.text,
        category: data.category,
        difficulty: data.difficulty ?? Difficulty.MEDIUM,
        tags: data.tags ?? [],
        timerSeconds: data.timerSeconds ?? 60,
        options: {
          create: data.options.map((opt) => ({
            text: opt.text,
            isCorrect: opt.isCorrect ?? false,
          })),
        },
      },
      include: { options: true },
    });

    await this.auditService.logAction(
      userId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `Question (ID: ${question.id}) added to QuestionBank "${bank.title}" (ID: ${bankId})`
    );

    return question;
  }

  async updateQuestion(questionId: string, data: UpdateQuestionDto, userId: string) {
    const existing = await this.prisma.questionBankQuestion.findUnique({
      where: { id: questionId },
    });
    if (!existing)
      throw new NotFoundException(`Question with ID ${questionId} not found`);

    const question = await this.prisma.questionBankQuestion.update({
      where: { id: questionId },
      data: {
        text: data.text,
        category: data.category,
        difficulty: data.difficulty,
        tags: data.tags,
        timerSeconds: data.timerSeconds,
      },
      include: { options: true },
    });

    await this.auditService.logAction(
      userId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `Question (ID: ${questionId}) updated`
    );

    return question;
  }

  async deleteQuestion(questionId: string, userId: string) {
    const existing = await this.prisma.questionBankQuestion.findUnique({
      where: { id: questionId },
    });
    if (!existing)
      throw new NotFoundException(`Question with ID ${questionId} not found`);

    // Cascade deletes QuestionOption rows via Prisma schema onDelete: Cascade
    await this.prisma.questionBankQuestion.delete({
      where: { id: questionId },
    });

    await this.auditService.logAction(
      userId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `Question (ID: ${questionId}) deleted from QuestionBank (ID: ${existing.questionBankId})`
    );
  }

  async duplicateQuestion(questionId: string, userId: string) {
    const original = await this.prisma.questionBankQuestion.findUnique({
      where: { id: questionId },
      include: { options: true },
    });
    if (!original)
      throw new NotFoundException(`Question with ID ${questionId} not found`);

    const duplicate = await this.prisma.questionBankQuestion.create({
      data: {
        questionBankId: original.questionBankId,
        text: `${original.text} (Copy)`,
        category: original.category,
        difficulty: original.difficulty,
        tags: original.tags,
        timerSeconds: original.timerSeconds,
        options: {
          create: original.options.map((opt) => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
          })),
        },
      },
      include: { options: true },
    });

    await this.auditService.logAction(
      userId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `Question (ID: ${questionId}) duplicated as (ID: ${duplicate.id})`
    );

    return duplicate;
  }

  // ─────────────────── ASSESSMENTS ───────────────────

  async getAssessmentsByModule(moduleId: string) {
    return this.prisma.assessment.findMany({
      where: { moduleId },
      include: {
        questionBank: {
          select: {
            id: true,
            title: true,
            _count: { select: { questions: true } },
          },
        },
      },
    });
  }

  async getAssessmentById(id: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id },
      include: {
        module: { select: { id: true, title: true } },
        questionBank: {
          include: {
            _count: { select: { questions: true } },
          },
        },
      },
    });
    if (!assessment)
      throw new NotFoundException(`Assessment with ID ${id} not found`);
    return assessment;
  }

  async createAssessment(data: CreateAssessmentDto, userId: string) {
    // Verify the module exists
    const moduleExists = await this.prisma.module.findUnique({
      where: { id: data.moduleId },
    });
    if (!moduleExists)
      throw new NotFoundException(
        `Module with ID ${data.moduleId} not found`
      );

    // Verify the question bank exists and has ≥ 100 questions
    const bank = await this.prisma.questionBank.findUnique({
      where: { id: data.questionBankId },
      include: { _count: { select: { questions: true } } },
    });
    if (!bank)
      throw new NotFoundException(
        `Question bank with ID ${data.questionBankId} not found`
      );

    if (bank._count.questions < 100) {
      throw new BadRequestException(
        `Question bank must have at least 100 questions to create an assessment. Current count: ${bank._count.questions}`
      );
    }

    const assessment = await this.prisma.assessment.create({
      data: {
        moduleId: data.moduleId,
        questionBankId: data.questionBankId,
        title: data.title,
        passingScore: data.passingScore ?? 80,
        sampleSize: data.sampleSize ?? 15,
        timeLimit: data.timeLimit ?? 1800,
      },
    });

    await this.auditService.logAction(
      userId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `Assessment "${assessment.title}" (ID: ${assessment.id}) published for Module (ID: ${data.moduleId})`
    );

    return this.getAssessmentById(assessment.id);
  }

  async updateAssessment(
    id: string,
    data: UpdateAssessmentDto,
    userId: string
  ) {
    const existing = await this.prisma.assessment.findUnique({
      where: { id },
    });
    if (!existing)
      throw new NotFoundException(`Assessment with ID ${id} not found`);

    const assessment = await this.prisma.assessment.update({
      where: { id },
      data: {
        title: data.title,
        passingScore: data.passingScore,
        sampleSize: data.sampleSize,
        timeLimit: data.timeLimit,
      },
    });

    await this.auditService.logAction(
      userId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `Assessment "${assessment.title}" (ID: ${assessment.id}) updated`
    );

    return assessment;
  }

  async deleteAssessment(id: string, userId: string) {
    const existing = await this.prisma.assessment.findUnique({
      where: { id },
    });
    if (!existing)
      throw new NotFoundException(`Assessment with ID ${id} not found`);

    await this.prisma.assessment.delete({ where: { id } });

    await this.auditService.logAction(
      userId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `Assessment "${existing.title}" (ID: ${existing.id}) deleted`
    );
  }

  async getAssessmentResults(assessmentId: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
    });
    if (!assessment) {
      throw new NotFoundException(
        `Assessment with ID ${assessmentId} not found`
      );
    }

    const attempts = await this.prisma.assessmentAttempt.findMany({
      where: {
        assessmentId,
        completedAt: { not: null },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            violations: true,
          },
        },
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    return attempts.map((attempt) => ({
      id: attempt.id,
      studentName: attempt.user.name || attempt.user.email,
      studentEmail: attempt.user.email,
      score: attempt.score,
      passed: attempt.passed,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      violationCount: attempt._count.violations,
    }));
  }

  // ─────────────────── FACULTY ANALYTICS ───────────────────

  /**
   * Compute analytics for an assessment from AssessmentAttempt rows.
   * Only considers completed attempts (completedAt is not null).
   */
  async getAssessmentAnalytics(assessmentId: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
    });
    if (!assessment)
      throw new NotFoundException(
        `Assessment with ID ${assessmentId} not found`
      );

    const attempts = await this.prisma.assessmentAttempt.findMany({
      where: {
        assessmentId,
        completedAt: { not: null },
      },
      select: {
        score: true,
        passed: true,
      },
    });

    const total = attempts.length;

    if (total === 0) {
      return {
        total: 0,
        passRate: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
      };
    }

    const passedCount = attempts.filter((a) => a.passed).length;
    const scores = attempts.map((a) => a.score);
    const sum = scores.reduce((acc, s) => acc + s, 0);

    return {
      total,
      passRate: Math.round((passedCount / total) * 100 * 100) / 100,
      averageScore: Math.round((sum / total) * 100) / 100,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
    };
  }

  // ─────────────────── EXAM SESSIONS & PROCTORING ───────────────────

  // Helper to retrieve mock questions matching frontend data
  private getMockQuestionsData(assessmentId: string) {
    if (assessmentId === 'quiz-1') {
      return [
        { id: "q-1-1", text: "What is the primary advantage of transformer architecture over RNNs?", options: ["Faster training through parallelization", "Lower memory usage", "Simpler implementation", "Better for small datasets"], correctAnswer: 0 },
        { id: "q-1-2", text: "Which of the following is NOT a key consideration in an AI readiness assessment?", options: ["Data infrastructure maturity", "Organizational culture", "Office location", "Technical talent availability"], correctAnswer: 2 },
        { id: "q-1-3", text: "What does 'responsible AI' primarily focus on?", options: ["Maximizing profit", "Fairness, transparency, and accountability", "Speed of deployment", "Reducing headcount"], correctAnswer: 1 },
        { id: "q-1-4", text: "In a Build vs Buy vs Partner decision for AI, what favors 'Buy'?", options: ["Unique competitive advantage needed", "Commodity use case with mature vendors", "No existing solutions in market", "Unlimited budget"], correctAnswer: 1 },
        { id: "q-1-5", text: "Which framework is commonly used for AI ethics governance?", options: ["Scrum", "NIST AI RMF", "Waterfall", "Six Sigma"], correctAnswer: 1 },
        { id: "q-1-6", text: "What is the 'hallucination' problem in generative AI?", options: ["Models generate visually distorted images", "Models produce plausible but factually incorrect outputs", "Models require too much memory", "Models cannot process images"], correctAnswer: 1 },
        { id: "q-1-7", text: "Which is the most critical success factor for enterprise AI adoption?", options: ["Latest hardware", "Executive sponsorship and change management", "Largest dataset possible", "Most parameters in the model"], correctAnswer: 1 },
        { id: "q-1-8", text: "What is the purpose of an AI governance committee?", options: ["To write code", "To oversee ethical use, risk, and compliance of AI systems", "To replace management", "To train AI models"], correctAnswer: 1 },
        { id: "q-1-9", text: "Data privacy regulations in India are governed by which act?", options: ["GDPR", "CCPA", "Digital Personal Data Protection Act, 2023", "IT Act, 2000 only"], correctAnswer: 2 },
        { id: "q-1-10", text: "What is the ROI measurement challenge unique to AI projects?", options: ["They always lose money", "Benefits are often indirect and accrue over time", "They never show results", "AI projects have fixed costs"], correctAnswer: 1 },
      ];
    } else if (assessmentId === 'quiz-2') {
      return [
        { id: "q-2-1", text: "Which algorithm is best suited for binary classification?", options: ["Linear Regression", "Logistic Regression", "K-Means", "PCA"], correctAnswer: 1 },
        { id: "q-2-2", text: "What is overfitting?", options: ["Model performs poorly on all data", "Model performs well on training data but poorly on test data", "Model is too simple", "Model has too few features"], correctAnswer: 1 },
        { id: "q-2-3", text: "What does the R² score measure?", options: ["Classification accuracy", "Proportion of variance explained by the model", "Training speed", "Number of features"], correctAnswer: 1 },
        { id: "q-2-4", text: "Which is an unsupervised learning algorithm?", options: ["Random Forest", "K-Means Clustering", "Logistic Regression", "SVM"], correctAnswer: 1 },
        { id: "q-2-5", text: "What is cross-validation used for?", options: ["Data cleaning", "Estimating model performance on unseen data", "Feature selection only", "Data visualization"], correctAnswer: 1 },
        { id: "q-2-6", text: "In a confusion matrix, what is a 'false positive'?", options: ["Correctly predicted positive", "Incorrectly predicted as positive when actually negative", "Correctly predicted negative", "Missing data"], correctAnswer: 1 },
        { id: "q-2-7", text: "What is the purpose of regularization?", options: ["Speed up training", "Prevent overfitting by penalizing complex models", "Increase model complexity", "Remove features"], correctAnswer: 1 },
        { id: "q-2-8", text: "Which activation function is commonly used in hidden layers of neural networks?", options: ["Sigmoid", "ReLU", "Softmax", "Step function"], correctAnswer: 1 },
        { id: "q-2-9", text: "What does 'gradient descent' optimize?", options: ["Data quality", "Loss function (minimizes error)", "Feature count", "Training time"], correctAnswer: 1 },
        { id: "q-2-10", text: "What is feature scaling important for?", options: ["Reducing dataset size", "Ensuring features contribute equally to the model", "Adding new features", "Removing outliers"], correctAnswer: 1 },
      ];
    } else {
      // Default fallback for dynamically generated quizzes (quiz-3 to quiz-12)
      return Array.from({ length: 8 }, (_, j) => ({
        id: `q-${assessmentId}-${j + 1}`,
        text: `Question ${j + 1}: Which of the following best describes the key concept from Module ${Math.ceil((j + 1) / 2)}?`,
        options: ["Option A - Correct answer", "Option B - Common misconception", "Option C - Related but incorrect", "Option D - Unrelated concept"],
        correctAnswer: 0,
      }));
    }
  }

  async ensureAssessmentExists(assessmentId: string) {
    let assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      // 1. Ensure default institution exists
      const inst = await this.prisma.institution.upsert({
        where: { id: 'default-institution-id' },
        update: {},
        create: {
          id: 'default-institution-id',
          name: 'Dezai Technical University',
          description: 'Default institution for V1 demonstration and development.',
        },
      });

      // 2. Ensure default program exists
      const program = await this.prisma.program.upsert({
        where: { id: 'default-program-id' },
        update: {},
        create: {
          id: 'default-program-id',
          title: 'Strategic AI Leadership',
          description: 'Master general and specialized generative AI models.',
          institutionId: inst.id,
        },
      });

      // 3. Ensure default track exists
      const track = await this.prisma.programTrack.upsert({
        where: { id: 'default-track-id' },
        update: {},
        create: {
          id: 'default-track-id',
          programId: program.id,
          type: 'ROOTS',
          title: 'Roots Track',
        },
      });

      // 4. Ensure default module exists
      const module = await this.prisma.module.upsert({
        where: { id: 'default-module-id' },
        update: {},
        create: {
          id: 'default-module-id',
          trackId: track.id,
          title: 'Core AI Frameworks',
          order: 1,
        },
      });

      // 5. Ensure question bank exists
      const qBank = await this.prisma.questionBank.upsert({
        where: { id: `qbank-${assessmentId}` },
        update: {},
        create: {
          id: `qbank-${assessmentId}`,
          title: `${assessmentId} Question Bank`,
          institutionId: inst.id,
        },
      });

      // 6. Create assessment
      assessment = await this.prisma.assessment.create({
        data: {
          id: assessmentId,
          moduleId: module.id,
          questionBankId: qBank.id,
          title: `${assessmentId.replace('-', ' ').toUpperCase()} Assessment`,
          passingScore: 70,
          sampleSize: 10,
        },
      });

      // 7. Seed questions for the mock quizzes
      const questionsData = this.getMockQuestionsData(assessmentId);
      for (const q of questionsData) {
        const question = await this.prisma.questionBankQuestion.create({
          data: {
            id: q.id,
            questionBankId: qBank.id,
            text: q.text,
          },
        });

        for (let idx = 0; idx < q.options.length; idx++) {
          await this.prisma.questionOption.create({
            data: {
              id: `${q.id}-opt-${idx}`,
              questionId: question.id,
              text: q.options[idx],
              isCorrect: idx === q.correctAnswer,
            },
          });
        }
      }
    }

    return assessment;
  }

  /**
 * Samples `sampleSize` random questions from the assessment's question bank,
 * shuffles question order and each question's option order, and returns
 * a locked, JSON-serializable structure to store on the ExamSession.
 */
  private async generateQuestionSet(assessmentId: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questionBank: {
          include: {
            questions: {
              include: { options: true },
            },
          },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${assessmentId} not found`);
    }

    const allQuestions = assessment.questionBank.questions;

    if (allQuestions.length < assessment.sampleSize) {
      throw new BadRequestException(
        `Question bank only has ${allQuestions.length} questions, but assessment requires ${assessment.sampleSize}.`
      );
    }

    // 1. Randomly select `sampleSize` questions (no repeats)
    const shuffledPool = shuffleArray(allQuestions);
    const selected = shuffledPool.slice(0, assessment.sampleSize);

    // 2. Shuffle each selected question's options too
    const questionSet = selected.map((q) => ({
      questionId: q.id,
      text: q.text,
      options: shuffleArray(
        q.options.map((opt) => ({ optionId: opt.id, text: opt.text }))
        // NOTE: deliberately NOT including isCorrect here —
        // this object gets sent to the frontend, so the correct answer
        // must never be exposed to the client.
      ),
    }));

    return questionSet;
  }

  async createSession(userId: string, assessmentId: string) {
    // Ensure the assessment exists (seeding if missing)
    await this.ensureAssessmentExists(assessmentId);

    // Check for existing active session
    const activeSession = await this.prisma.examSession.findFirst({
      where: {
        userId,
        assessmentId,
        status: ExamStatus.ACTIVE,
      },
    });

    if (activeSession) {
      return activeSession;
    }

    // Check attempt count (max 3 free attempts)
    const attemptsCount = await this.prisma.assessmentAttempt.count({
      where: {
        userId,
        assessmentId,
      },
    });

    if (attemptsCount >= 3) {
      throw new BadRequestException('Maximum attempts (3) exceeded for this assessment.');
    }

    // Generate this student's locked, shuffled question set
    const questionSet = await this.generateQuestionSet(assessmentId);

    // Create new exam session
    return this.prisma.examSession.create({
      data: {
        userId,
        assessmentId,
        status: ExamStatus.ACTIVE,
        warningsCount: 0,
        scoreDeduction: 0,
        questionSet,
      },
    });
  }

  async getActiveSession(userId: string, assessmentId?: string) {
    const whereClause: any = {
      userId,
      status: ExamStatus.ACTIVE,
    };
    if (assessmentId) {
      whereClause.assessmentId = assessmentId;
    }
    return this.prisma.examSession.findFirst({
      where: whereClause,
    });
  }

  async getSession(userId: string, sessionId: string) {
    const session = await this.prisma.examSession.findUnique({
      where: { id: sessionId },
      include: {
        violations: true,
        assessment: {
          select: {
            id: true,
            title: true,
            passingScore: true,
            timeLimit: true,
          },
        },
      },
    });

    if (!session || session.userId !== userId) {
      throw new NotFoundException('Exam session not found');
    }

    return session; // session.questionSet has the locked, shuffled questions
  }

  async logViolation(userId: string, sessionId: string, type: ViolationType) {
    const session = await this.prisma.examSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new NotFoundException('Exam session not found');
    }

    if (session.status !== ExamStatus.ACTIVE) {
      throw new BadRequestException('Session is not active');
    }

    // Create the Violation Log
    await this.prisma.violationLog.create({
      data: {
        sessionId,
        userId,
        type,
      },
    });

    const newWarningsCount = session.warningsCount + 1;
    let newStatus: ExamStatus = ExamStatus.ACTIVE;
    let newDeduction = session.scoreDeduction;
    let lockoutUntil: Date | null = null;

    if (newWarningsCount === 1) {
      // First warning: visual warning overlay + timer halt on client side
    } else if (newWarningsCount === 2) {
      // Second warning: 15% deduction + 30-second lockout
      newDeduction = 15;
      lockoutUntil = new Date(Date.now() + 30 * 1000);
    } else if (newWarningsCount >= 3) {
      // Third warning: terminate session immediately + zero grade
      newStatus = ExamStatus.TERMINATED;
    }

    const updatedSession = await this.prisma.examSession.update({
      where: { id: sessionId },
      data: {
        warningsCount: newWarningsCount,
        status: newStatus,
        scoreDeduction: newDeduction,
        lockoutUntil,
        endedAt: newStatus === ExamStatus.TERMINATED ? new Date() : null,
      },
    });

    // If terminated, register a zero grade assessment attempt
    if (newStatus === ExamStatus.TERMINATED) {
      await this.prisma.assessmentAttempt.create({
        data: {
          userId,
          assessmentId: session.assessmentId,
          score: 0,
          passed: false,
          completedAt: new Date(),
        },
      });
    }

    return updatedSession;
  }

  async submitSession(userId: string, sessionId: string, selectedAnswers: Record<string, string>) {
    const session = await this.getSession(userId, sessionId);

    if (session.status !== ExamStatus.ACTIVE) {
      throw new BadRequestException('Exam session is not active or already submitted.');
    }

    // Use the LOCKED question set from session creation, not the live bank
    const lockedQuestions = session.questionSet as Array<{
      questionId: string;
      text: string;
      options: { optionId: string; text: string }[];
    }>;

    let score = 0;
    const totalQuestions = lockedQuestions.length;
    const attemptAnswersToCreate = [];

    for (const question of lockedQuestions) {
      const selectedOptionId = selectedAnswers[question.questionId] ?? null;

      if (!selectedOptionId) continue;

      // Look up the real option from the DB to check isCorrect
      // (isCorrect was deliberately stripped from questionSet so it's never sent to the client)
      const realOption = await this.prisma.questionOption.findUnique({
        where: { id: selectedOptionId },
      });

      const isCorrect = realOption?.isCorrect ?? false;

      if (isCorrect) {
        score += 1;
      }

      attemptAnswersToCreate.push({
        questionId: question.questionId,
        selectedOptionId,
        isCorrect,
      });
    }

    // Apply percentage-based score calculation
    let percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    // Apply proctoring violation deduction (15% deduction on second warning)
    percentage = Math.max(0, percentage - session.scoreDeduction);

    const passed = percentage >= session.assessment.passingScore;

    // Update session status to SUBMITTED
    await this.prisma.examSession.update({
      where: { id: sessionId },
      data: {
        status: ExamStatus.SUBMITTED,
        endedAt: new Date(),
      },
    });

    // Create final assessment attempt
    const attempt = await this.prisma.assessmentAttempt.create({
      data: {
        userId,
        assessmentId: session.assessmentId,
        score: percentage,
        passed,
        completedAt: new Date(),
        attemptAnswers: {
          create: attemptAnswersToCreate,
        },
      },
    });

    // If there were violations, link them to the attempt too for historical record
    await this.prisma.violationLog.updateMany({
      where: { sessionId },
      data: { attemptId: attempt.id },
    });

    return {
      attemptId: attempt.id,
      score: percentage,
      passed,
    };
  }

  // ─────────────────── FACULTY OWNERSHIP VALIDATION (Sprint 5) ───────────────────

  /**
   * Validates that a faculty member owns the assessment through the
   * Assessment → Module → Track → Program → Faculty chain.
   * DEZAI_ADMIN and UNIVERSITY_ADMIN bypass with institution check.
   */
  async validateAssessmentFacultyOwnership(
    assessmentId: string,
    userId: string,
  ): Promise<true> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        module: {
          include: {
            track: {
              include: {
                program: {
                  include: {
                    faculty: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${assessmentId} not found`);
    }

    const program = assessment.module.track.program;

    // Check if the faculty member owns this program
    const faculty = await this.prisma.facultyMember.findUnique({
      where: { userId },
    });

    if (!faculty) {
      throw new ForbiddenException('Faculty profile not found');
    }

    if (program.facultyId !== faculty.id && program.institutionId !== faculty.institutionId) {
      throw new ForbiddenException(
        'You do not have access to this assessment',
      );
    }

    return true;
  }

  // ─────────────────── RESULT ANALYTICS (Sprint 5 Task 4) ───────────────────

  /**
   * Aggregates completed attempt data for faculty analytics:
   * total attempts, unique students, average score/percentage,
   * pass rate, and score distribution buckets.
   */
  async getResultAnalytics(
    assessmentId: string,
  ): Promise<ResultAnalyticsResponseDto> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${assessmentId} not found`);
    }

    const attempts = await this.prisma.assessmentAttempt.findMany({
      where: {
        assessmentId,
        completedAt: { not: null },
      },
      select: {
        score: true,
        passed: true,
        userId: true,
      },
    });

    const totalAttempts = attempts.length;

    if (totalAttempts === 0) {
      return {
        assessmentId,
        totalAttempts: 0,
        uniqueStudents: 0,
        averageScore: 0,
        averagePercentage: 0,
        passRate: 0,
        passedAttempts: 0,
        failedAttempts: 0,
        scoreDistribution: [
          { range: '0-20%', count: 0 },
          { range: '21-40%', count: 0 },
          { range: '41-60%', count: 0 },
          { range: '61-80%', count: 0 },
          { range: '81-100%', count: 0 },
        ],
      };
    }

    const uniqueStudents = new Set(attempts.map((a) => a.userId)).size;
    const passedAttempts = attempts.filter((a) => a.passed).length;
    const failedAttempts = totalAttempts - passedAttempts;
    const passRate = this.passFailEvaluationService.calculatePercentage(
      passedAttempts,
      totalAttempts,
    );

    const scores = attempts.map((a) => a.score);
    const scoreSum = scores.reduce((acc, s) => acc + s, 0);
    const averageScore = Math.round((scoreSum / totalAttempts) * 100) / 100;

    // Calculate percentages for each attempt
    const percentages = attempts.map((a) =>
      this.passFailEvaluationService.calculatePercentage(
        a.score,
        assessment.sampleSize,
      ),
    );
    const percentageSum = percentages.reduce((acc, p) => acc + p, 0);
    const averagePercentage =
      Math.round((percentageSum / totalAttempts) * 100) / 100;

    // Score distribution buckets
    const buckets = [
      { range: '0-20%', min: 0, max: 20, count: 0 },
      { range: '21-40%', min: 21, max: 40, count: 0 },
      { range: '41-60%', min: 41, max: 60, count: 0 },
      { range: '61-80%', min: 61, max: 80, count: 0 },
      { range: '81-100%', min: 81, max: 100, count: 0 },
    ];

    for (const pct of percentages) {
      for (const bucket of buckets) {
        if (pct >= bucket.min && pct <= bucket.max) {
          bucket.count += 1;
          break;
        }
      }
    }

    return {
      assessmentId,
      totalAttempts,
      uniqueStudents,
      averageScore,
      averagePercentage,
      passRate,
      passedAttempts,
      failedAttempts,
      scoreDistribution: buckets.map((b) => ({
        range: b.range,
        count: b.count,
      })),
    };
  }

  // ─────────────────── MISSED QUESTIONS ANALYTICS (Sprint 5 Task 4) ───────────────────

  /**
   * Aggregates per-question wrong-answer rates across all completed
   * attempts for a given assessment. Sorted by wrongRate DESC
   * (hardest questions first).
   */
  async getMissedQuestionsAnalytics(
    assessmentId: string,
  ): Promise<MissedQuestionsAnalyticsResponseDto> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questionBank: {
          include: {
            questions: {
              select: {
                id: true,
                text: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${assessmentId} not found`);
    }

    // Get all attempt answers for completed attempts of this assessment
    const answers = await this.prisma.attemptAnswer.findMany({
      where: {
        attempt: {
          assessmentId,
          completedAt: { not: null },
        },
      },
      select: {
        questionId: true,
        isCorrect: true,
      },
    });

    // Aggregate per question
    const questionStatsMap = new Map<
      string,
      { totalAnswered: number; totalWrong: number }
    >();

    for (const ans of answers) {
      const stats = questionStatsMap.get(ans.questionId) ?? {
        totalAnswered: 0,
        totalWrong: 0,
      };
      stats.totalAnswered += 1;
      if (!ans.isCorrect) {
        stats.totalWrong += 1;
      }
      questionStatsMap.set(ans.questionId, stats);
    }

    // Build response, joining with question metadata
    const questionMap = new Map(
      assessment.questionBank.questions.map((q) => [q.id, q]),
    );

    const questions = Array.from(questionStatsMap.entries())
      .map(([questionId, stats]) => {
        const qMeta = questionMap.get(questionId);
        const wrongRate = this.passFailEvaluationService.calculatePercentage(
          stats.totalWrong,
          stats.totalAnswered,
        );

        return {
          questionId,
          questionText: qMeta?.text ?? 'Unknown question',
          category: qMeta?.category ?? null,
          totalAnswered: stats.totalAnswered,
          totalWrong: stats.totalWrong,
          wrongRate,
        };
      })
      .sort((a, b) => b.wrongRate - a.wrongRate);

    return {
      assessmentId,
      questions,
    };
  }

  async getFacultyInsightsStreamData(userId: string, role: UserRole) {
    let programIds: string[] = [];

    if (role === UserRole.DEZAI_ADMIN) {
      const programs = await this.prisma.program.findMany({ select: { id: true } });
      programIds = programs.map((p) => p.id);
    } else if (role === UserRole.UNIVERSITY_ADMIN) {
      const admin = await this.prisma.institutionAdmin.findUnique({
        where: { userId },
      });
      if (admin) {
        const programs = await this.prisma.program.findMany({
          where: { institutionId: admin.institutionId },
          select: { id: true },
        });
        programIds = programs.map((p) => p.id);
      }
    } else if (role === UserRole.FACULTY) {
      const faculty = await this.prisma.facultyMember.findUnique({
        where: { userId },
      });
      if (faculty) {
        const programs = await this.prisma.program.findMany({
          where: { facultyId: faculty.id },
          select: { id: true },
        });
        programIds = programs.map((p) => p.id);
      }
    }

    if (programIds.length === 0) {
      return {
        timestamp: new Date().toISOString(),
        summary: {
          totalAtRisk: 0,
          totalLowProgress: 0,
          totalInactive: 0,
          totalStudentsMonitored: 0,
        },
        alerts: [],
      };
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: { programId: { in: programIds } },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            lastActiveAt: true,
            attempts: {
              select: {
                assessmentId: true,
                passed: true,
              },
            },
          },
        },
      },
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let totalAtRisk = 0;
    let totalLowProgress = 0;
    let totalInactive = 0;
    const alerts: any[] = [];

    for (const e of enrollments) {
      const isInactive = !e.user.lastActiveAt || e.user.lastActiveAt < sevenDaysAgo;
      const isLowProgress = e.progress < 25;

      const failuresPerAssessment = new Map<string, number>();
      e.user.attempts.forEach((att) => {
        if (!att.passed) {
          failuresPerAssessment.set(att.assessmentId, (failuresPerAssessment.get(att.assessmentId) ?? 0) + 1);
        }
      });

      let hasRepeatedFailures = false;
      failuresPerAssessment.forEach((count) => {
        if (count >= 2) {
          hasRepeatedFailures = true;
        }
      });

      const reasons: string[] = [];
      if (isInactive) {
        reasons.push("inactivity");
        totalInactive++;
        alerts.push({
          type: "INACTIVE",
          userId: e.user.id,
          userName: e.user.name || "Unknown Student",
          detail: `Inactive for ${
            e.user.lastActiveAt
              ? Math.floor((Date.now() - e.user.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24))
              : "many"
          } days`,
        });
      }
      if (isLowProgress) {
        reasons.push("low progress");
        totalLowProgress++;
        alerts.push({
          type: "LOW_PROGRESS",
          userId: e.user.id,
          userName: e.user.name || "Unknown Student",
          detail: `Low syllabus progress (${e.progress}%)`,
        });
      }

      const isAtRisk = hasRepeatedFailures || reasons.length > 1;
      if (isAtRisk) {
        totalAtRisk++;
        alerts.push({
          type: "AT_RISK",
          userId: e.user.id,
          userName: e.user.name || "Unknown Student",
          detail: hasRepeatedFailures
            ? "Repeated quiz failures (2+ attempts)"
            : "Multiple risk factors (inactive and low progress)",
        });
      }
    }

    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalAtRisk,
        totalLowProgress,
        totalInactive,
        totalStudentsMonitored: enrollments.length,
      },
      alerts,
    };
  }
}
