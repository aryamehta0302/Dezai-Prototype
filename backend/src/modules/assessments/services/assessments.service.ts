import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CredentialsService } from '../../credentials/services/credentials.service';
import { ExamStatus, ViolationType, UserRole } from '@prisma/client';

@Injectable()
export class AssessmentsService {
  constructor(
    private prisma: PrismaService,
    private credentialsService: CredentialsService,
  ) {}

  // Helper to retrieve mock questions matching frontend data
  private getMockQuestionsData(assessmentId: string) {
    if (assessmentId === 'quiz-1' || assessmentId === 'quiz-program') {
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

    // Create new exam session
    return this.prisma.examSession.create({
      data: {
        userId,
        assessmentId,
        status: ExamStatus.ACTIVE,
        warningsCount: 0,
        scoreDeduction: 0,
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
          include: {
            questionBank: {
              include: {
                questions: {
                  include: {
                    options: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!session || session.userId !== userId) {
      throw new NotFoundException('Exam session not found');
    }

    return session;
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

  async submitSession(userId: string, sessionId: string, selectedAnswers: Record<string, string | number>) {
    const session = await this.getSession(userId, sessionId);

    if (session.status !== ExamStatus.ACTIVE) {
      throw new BadRequestException('Exam session is not active or already submitted.');
    }

    const questions = session.assessment.questionBank.questions;
    let score = 0;
    const totalQuestions = questions.length;

    // Calculate score
    const attemptAnswersToCreate = [];
    const frontendCorrectAnswers: Record<string, number> = {
      'q-1-1': 0, 'q-1-2': 2, 'q-1-3': 1, 'q-1-4': 1, 'q-1-5': 1,
      'q-1-6': 1, 'q-1-7': 1, 'q-1-8': 1, 'q-1-9': 2, 'q-1-10': 1,
    };

    for (const question of questions) {
      let selectedVal = selectedAnswers[question.id];
      let frontendId = question.id;

      // Translate frontend IDs (q-1-X) to database IDs (q-quiz-program-X) for quiz-program
      if (selectedVal === undefined && session.assessmentId === 'quiz-program') {
        const match = question.id.match(/^q-quiz-program-(\d+)$/);
        if (match) {
          frontendId = `q-1-${match[1]}`;
          selectedVal = selectedAnswers[frontendId];
        }
      }

      let selectedOptionId: string | null = null;

      if (selectedVal !== undefined && selectedVal !== null) {
        // If it's a number (representing option index), map it to the deterministic ID
        if (typeof selectedVal === 'number' || !isNaN(Number(selectedVal))) {
          selectedOptionId = `${question.id}-opt-${selectedVal}`;
        } else {
          selectedOptionId = String(selectedVal);
        }
      }

      // Grade against frontendCorrectAnswers if it is quiz-program
      let isCorrect = false;
      if (session.assessmentId === 'quiz-program' && frontendCorrectAnswers[frontendId] !== undefined) {
        isCorrect = Number(selectedVal) === frontendCorrectAnswers[frontendId];
      } else {
        const correctOption = question.options.find((o) => o.isCorrect);
        isCorrect = selectedOptionId === correctOption?.id;
      }

      if (isCorrect) {
        score += 1;
      }

      if (selectedOptionId) {
        attemptAnswersToCreate.push({
          questionId: question.id,
          selectedOptionId,
          isCorrect,
        });
      }
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

    // --- CREDENTIAL AUTO-ISSUANCE HOOK ---
    if (passed) {
      try {
        // Retrieve the program ID associated with this assessment
        const assessment = await this.prisma.assessment.findUnique({
          where: { id: session.assessmentId },
          include: {
            module: {
              include: {
                track: true,
              },
            },
          },
        });
        
        if (assessment?.module?.track?.programId) {
          const programId = assessment.module.track.programId;
          // Trigger eligibility and issue if eligible
          const { eligible } = await this.credentialsService.checkEligibility(userId, programId);
          if (eligible) {
            await this.credentialsService.issueCredential(userId, programId);
          }
        }
      } catch (err) {
        console.error('Credential auto-issuance failed:', err);
      }
    }

    return {
      attemptId: attempt.id,
      score: percentage,
      passed,
    };
  }
}

