export interface MockQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // index
  points: number;
}

export interface MockQuiz {
  id: string;
  courseId: string;
  title: string;
  description: string;
  duration: number; // minutes
  totalQuestions: number;
  passingScore: number; // percentage
  maxAttempts: number;
  questions: MockQuestion[];
}

export const mockQuizzes: MockQuiz[] = [
  {
    id: "quiz-1",
    courseId: "course-1",
    title: "Generative AI for Leaders — Final Assessment",
    description: "Test your understanding of strategic AI implementation, governance frameworks, and leadership decision-making.",
    duration: 15,
    totalQuestions: 10,
    passingScore: 70,
    maxAttempts: 3,
    questions: [
      { id: "q-1-1", text: "What is the primary advantage of transformer architecture over RNNs?", options: ["Faster training through parallelization", "Lower memory usage", "Simpler implementation", "Better for small datasets"], correctAnswer: 0, points: 4 },
      { id: "q-1-2", text: "Which of the following is NOT a key consideration in an AI readiness assessment?", options: ["Data infrastructure maturity", "Organizational culture", "Office location", "Technical talent availability"], correctAnswer: 2, points: 4 },
      { id: "q-1-3", text: "What does 'responsible AI' primarily focus on?", options: ["Maximizing profit", "Fairness, transparency, and accountability", "Speed of deployment", "Reducing headcount"], correctAnswer: 1, points: 4 },
      { id: "q-1-4", text: "In a Build vs Buy vs Partner decision for AI, what favors 'Buy'?", options: ["Unique competitive advantage needed", "Commodity use case with mature vendors", "No existing solutions in market", "Unlimited budget"], correctAnswer: 1, points: 4 },
      { id: "q-1-5", text: "Which framework is commonly used for AI ethics governance?", options: ["Scrum", "NIST AI RMF", "Waterfall", "Six Sigma"], correctAnswer: 1, points: 4 },
      { id: "q-1-6", text: "What is the 'hallucination' problem in generative AI?", options: ["Models generate visually distorted images", "Models produce plausible but factually incorrect outputs", "Models require too much memory", "Models cannot process images"], correctAnswer: 1, points: 4 },
      { id: "q-1-7", text: "Which is the most critical success factor for enterprise AI adoption?", options: ["Latest hardware", "Executive sponsorship and change management", "Largest dataset possible", "Most parameters in the model"], correctAnswer: 1, points: 4 },
      { id: "q-1-8", text: "What is the purpose of an AI governance committee?", options: ["To write code", "To oversee ethical use, risk, and compliance of AI systems", "To replace management", "To train AI models"], correctAnswer: 1, points: 4 },
      { id: "q-1-9", text: "Data privacy regulations in India are governed by which act?", options: ["GDPR", "CCPA", "Digital Personal Data Protection Act, 2023", "IT Act, 2000 only"], correctAnswer: 2, points: 4 },
      { id: "q-1-10", text: "What is the ROI measurement challenge unique to AI projects?", options: ["They always lose money", "Benefits are often indirect and accrue over time", "They never show results", "AI projects have fixed costs"], correctAnswer: 1, points: 4 },
    ],
  },
  {
    id: "quiz-2",
    courseId: "course-2",
    title: "Machine Learning Fundamentals — Assessment",
    description: "Evaluate your understanding of ML algorithms, model evaluation, and practical applications.",
    duration: 20,
    totalQuestions: 10,
    passingScore: 70,
    maxAttempts: 3,
    questions: [
      { id: "q-2-1", text: "Which algorithm is best suited for binary classification?", options: ["Linear Regression", "Logistic Regression", "K-Means", "PCA"], correctAnswer: 1, points: 4 },
      { id: "q-2-2", text: "What is overfitting?", options: ["Model performs poorly on all data", "Model performs well on training data but poorly on test data", "Model is too simple", "Model has too few features"], correctAnswer: 1, points: 4 },
      { id: "q-2-3", text: "What does the R² score measure?", options: ["Classification accuracy", "Proportion of variance explained by the model", "Training speed", "Number of features"], correctAnswer: 1, points: 4 },
      { id: "q-2-4", text: "Which is an unsupervised learning algorithm?", options: ["Random Forest", "K-Means Clustering", "Logistic Regression", "SVM"], correctAnswer: 1, points: 4 },
      { id: "q-2-5", text: "What is cross-validation used for?", options: ["Data cleaning", "Estimating model performance on unseen data", "Feature selection only", "Data visualization"], correctAnswer: 1, points: 4 },
      { id: "q-2-6", text: "In a confusion matrix, what is a 'false positive'?", options: ["Correctly predicted positive", "Incorrectly predicted as positive when actually negative", "Correctly predicted negative", "Missing data"], correctAnswer: 1, points: 4 },
      { id: "q-2-7", text: "What is the purpose of regularization?", options: ["Speed up training", "Prevent overfitting by penalizing complex models", "Increase model complexity", "Remove features"], correctAnswer: 1, points: 4 },
      { id: "q-2-8", text: "Which activation function is commonly used in hidden layers of neural networks?", options: ["Sigmoid", "ReLU", "Softmax", "Step function"], correctAnswer: 1, points: 4 },
      { id: "q-2-9", text: "What does 'gradient descent' optimize?", options: ["Data quality", "Loss function (minimizes error)", "Feature count", "Training time"], correctAnswer: 1, points: 4 },
      { id: "q-2-10", text: "What is feature scaling important for?", options: ["Reducing dataset size", "Ensuring features contribute equally to the model", "Adding new features", "Removing outliers"], correctAnswer: 1, points: 4 },
    ],
  },
];

// Generate simple quizzes for remaining courses
for (let i = 3; i <= 12; i++) {
  if (!mockQuizzes.find(q => q.id === `quiz-${i}`)) {
    mockQuizzes.push({
      id: `quiz-${i}`,
      courseId: `course-${i}`,
      title: `Course ${i} Final Assessment`,
      description: "Comprehensive assessment covering all course modules.",
      duration: 15,
      totalQuestions: 8,
      passingScore: 70,
      maxAttempts: 3,
      questions: Array.from({ length: 8 }, (_, j) => ({
        id: `q-${i}-${j + 1}`,
        text: `Question ${j + 1}: Which of the following best describes the key concept from Module ${Math.ceil((j + 1) / 2)}?`,
        options: ["Option A - Correct answer", "Option B - Common misconception", "Option C - Related but incorrect", "Option D - Unrelated concept"],
        correctAnswer: 0,
        points: 4,
      })),
    });
  }
}

// Statically seed quiz-program to match default program assessment to avoid new object references
const q1 = mockQuizzes.find(q => q.id === 'quiz-1');
if (q1 && !mockQuizzes.some(q => q.id === 'quiz-program')) {
  mockQuizzes.push({
    ...q1,
    id: 'quiz-program',
    courseId: 'default-program-id'
  });
}

export function getQuizByCourseId(courseId: string): MockQuiz | undefined {
  return mockQuizzes.find((q) => q.courseId === courseId);
}

export function getQuizById(id: string): MockQuiz | undefined {
  return mockQuizzes.find((q) => q.id === id);
}
