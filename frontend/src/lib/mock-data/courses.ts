import { CourseCategory, CertificateTier } from "@/shared/types/common.types";

export interface MockLesson {
  id: string;
  title: string;
  duration: number; // minutes
  type: "video" | "article" | "quiz";
  content?: string;
}

export interface MockModule {
  id: string;
  title: string;
  lessons: MockLesson[];
}

export interface MockCourse {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  category: CourseCategory;
  tier: CertificateTier;
  price: number;
  currency: string;
  duration: string;
  totalLessons: number;
  totalModules: number;
  rating: number;
  reviewCount: number;
  enrollmentCount: number;
  instructorId: string;
  instructorName: string;
  universityId: string;
  universityName: string;
  thumbnailUrl: string;
  modules: MockModule[];
  prerequisites: string[];
  outcomes: string[];
  quizId: string;
}

export const mockCourses: MockCourse[] = [
  // ===== AI CATEGORY =====
  {
    id: "course-1",
    slug: "generative-ai-for-leaders",
    title: "Generative AI for Leaders: Strategic Implementation",
    shortDescription: "Master the strategic implementation of generative AI technologies in enterprise settings.",
    description: "This comprehensive course equips business leaders with the knowledge and frameworks needed to strategically implement generative AI across their organizations. From understanding transformer architectures to building AI governance frameworks, you'll gain practical skills that translate directly to business impact.",
    category: CourseCategory.AI,
    tier: CertificateTier.TIER_3,
    price: 899,
    currency: "INR",
    duration: "7 days",
    totalLessons: 20,
    totalModules: 5,
    rating: 4.9,
    reviewCount: 342,
    enrollmentCount: 2847,
    instructorId: "inst-7",
    instructorName: "Dr. Elena Rostova",
    universityId: "stanford",
    universityName: "Stanford Institute for AI",
    thumbnailUrl: "",
    prerequisites: ["Basic understanding of technology", "Management experience"],
    outcomes: ["Develop an AI implementation strategy", "Evaluate generative AI tools", "Build governance frameworks", "Manage AI-driven organizational change"],
    quizId: "quiz-1",
    modules: [
      {
        id: "mod-1-1", title: "Foundations of Generative AI",
        lessons: [
          { id: "les-1-1-1", title: "What is Generative AI?", duration: 25, type: "video", content: "Generative AI refers to a class of artificial intelligence systems capable of creating new content — text, images, code, music, and more — by learning patterns from vast datasets. Unlike traditional AI that classifies or predicts, generative models produce original outputs that didn't exist before.\n\n## The Evolution of AI\n\nArtificial intelligence has evolved through several paradigms:\n\n1. **Rule-based systems** (1960s-1980s): Hand-coded logic for specific tasks\n2. **Machine learning** (1990s-2010s): Statistical models that learn from data\n3. **Deep learning** (2012-present): Neural networks with many layers\n4. **Generative AI** (2020-present): Models that create new content\n\n## Key Technologies\n\n### Transformer Architecture\nThe transformer architecture, introduced in the 2017 paper \"Attention Is All You Need,\" revolutionized natural language processing. Its self-attention mechanism allows models to understand context across entire sequences of text.\n\n### Large Language Models (LLMs)\nModels like GPT-4, Claude, and Gemini are trained on trillions of tokens and can perform a wide variety of language tasks.\n\n### Diffusion Models\nUsed in image generation (DALL-E, Midjourney, Stable Diffusion), these models learn to create images by reversing a noise-adding process.\n\n> \"The most profound technologies are those that disappear. They weave themselves into the fabric of everyday life until they are indistinguishable from it.\" — Mark Weiser" },
          { id: "les-1-1-2", title: "History & Evolution of AI", duration: 20, type: "article" },
          { id: "les-1-1-3", title: "Key Players & Market Landscape", duration: 18, type: "video" },
          { id: "les-1-1-4", title: "Transformer Architecture Overview", duration: 30, type: "video" },
        ],
      },
      {
        id: "mod-1-2", title: "Strategic Assessment Framework",
        lessons: [
          { id: "les-1-2-1", title: "Evaluating AI Readiness", duration: 22, type: "video" },
          { id: "les-1-2-2", title: "Identifying High-Impact Use Cases", duration: 25, type: "video" },
          { id: "les-1-2-3", title: "Cost-Benefit Analysis for AI Projects", duration: 28, type: "article" },
          { id: "les-1-2-4", title: "Building the Business Case", duration: 20, type: "video" },
        ],
      },
      {
        id: "mod-1-3", title: "Implementation Strategies",
        lessons: [
          { id: "les-1-3-1", title: "Build vs Buy vs Partner", duration: 25, type: "video" },
          { id: "les-1-3-2", title: "Technical Infrastructure Requirements", duration: 30, type: "article" },
          { id: "les-1-3-3", title: "Team Structure & Talent Strategy", duration: 22, type: "video" },
          { id: "les-1-3-4", title: "Change Management Playbook", duration: 28, type: "video" },
        ],
      },
      {
        id: "mod-1-4", title: "Governance & Ethics",
        lessons: [
          { id: "les-1-4-1", title: "AI Ethics Frameworks", duration: 25, type: "video" },
          { id: "les-1-4-2", title: "Risk Management & Compliance", duration: 22, type: "article" },
          { id: "les-1-4-3", title: "Data Privacy & Security", duration: 20, type: "video" },
          { id: "les-1-4-4", title: "Responsible AI Guidelines", duration: 18, type: "video" },
        ],
      },
      {
        id: "mod-1-5", title: "Capstone & Assessment",
        lessons: [
          { id: "les-1-5-1", title: "Case Study: Enterprise AI Transformation", duration: 35, type: "article" },
          { id: "les-1-5-2", title: "Final Assessment Preparation", duration: 15, type: "article" },
          { id: "les-1-5-3", title: "Module 5 Assessment", duration: 45, type: "quiz" },
          { id: "les-1-5-4", title: "Course Wrap-up & Next Steps", duration: 10, type: "video" },
        ],
      },
    ],
  },
  {
    id: "course-2",
    slug: "machine-learning-fundamentals",
    title: "Machine Learning Fundamentals",
    shortDescription: "Build a strong foundation in machine learning algorithms and practical applications.",
    description: "Master the core concepts of machine learning from supervised and unsupervised learning to neural networks. This hands-on course emphasizes practical implementation with Python and real-world datasets.",
    category: CourseCategory.AI,
    tier: CertificateTier.TIER_2,
    price: 1299,
    currency: "INR",
    duration: "4 weeks",
    totalLessons: 24,
    totalModules: 6,
    rating: 4.7,
    reviewCount: 518,
    enrollmentCount: 3912,
    instructorId: "inst-2",
    instructorName: "Dr. Rajesh Patel",
    universityId: "kpgu",
    universityName: "KPGU",
    thumbnailUrl: "",
    prerequisites: ["Python basics", "Linear algebra fundamentals"],
    outcomes: ["Implement ML algorithms from scratch", "Use scikit-learn and TensorFlow", "Build predictive models", "Evaluate model performance"],
    quizId: "quiz-2",
    modules: [
      { id: "mod-2-1", title: "Introduction to Machine Learning", lessons: [
        { id: "les-2-1-1", title: "What is Machine Learning?", duration: 20, type: "video" },
        { id: "les-2-1-2", title: "Types of Machine Learning", duration: 25, type: "video" },
        { id: "les-2-1-3", title: "Setting Up Your Environment", duration: 15, type: "article" },
        { id: "les-2-1-4", title: "Your First ML Model", duration: 30, type: "video" },
      ]},
      { id: "mod-2-2", title: "Supervised Learning", lessons: [
        { id: "les-2-2-1", title: "Linear Regression", duration: 28, type: "video" },
        { id: "les-2-2-2", title: "Logistic Regression", duration: 25, type: "video" },
        { id: "les-2-2-3", title: "Decision Trees & Random Forests", duration: 30, type: "video" },
        { id: "les-2-2-4", title: "Support Vector Machines", duration: 25, type: "video" },
      ]},
      { id: "mod-2-3", title: "Unsupervised Learning", lessons: [
        { id: "les-2-3-1", title: "K-Means Clustering", duration: 22, type: "video" },
        { id: "les-2-3-2", title: "Dimensionality Reduction", duration: 28, type: "video" },
        { id: "les-2-3-3", title: "Anomaly Detection", duration: 20, type: "video" },
        { id: "les-2-3-4", title: "Practical Applications", duration: 25, type: "article" },
      ]},
      { id: "mod-2-4", title: "Neural Networks", lessons: [
        { id: "les-2-4-1", title: "Perceptrons & Activation Functions", duration: 25, type: "video" },
        { id: "les-2-4-2", title: "Backpropagation", duration: 30, type: "video" },
        { id: "les-2-4-3", title: "Building Neural Networks with TensorFlow", duration: 35, type: "video" },
        { id: "les-2-4-4", title: "Regularization Techniques", duration: 22, type: "article" },
      ]},
      { id: "mod-2-5", title: "Model Evaluation & Deployment", lessons: [
        { id: "les-2-5-1", title: "Cross-Validation", duration: 20, type: "video" },
        { id: "les-2-5-2", title: "Metrics: Precision, Recall, F1", duration: 22, type: "video" },
        { id: "les-2-5-3", title: "Model Deployment Basics", duration: 25, type: "video" },
        { id: "les-2-5-4", title: "ML Ops Overview", duration: 20, type: "article" },
      ]},
      { id: "mod-2-6", title: "Capstone Project", lessons: [
        { id: "les-2-6-1", title: "Project: Predictive Analytics", duration: 45, type: "article" },
        { id: "les-2-6-2", title: "Final Assessment", duration: 40, type: "quiz" },
        { id: "les-2-6-3", title: "Peer Review", duration: 20, type: "article" },
        { id: "les-2-6-4", title: "Certificate & Next Steps", duration: 10, type: "video" },
      ]},
    ],
  },
  {
    id: "course-3",
    slug: "deep-learning-masterclass",
    title: "Deep Learning Masterclass",
    shortDescription: "Advanced deep learning techniques including CNNs, RNNs, and GANs.",
    description: "Dive deep into modern neural network architectures. This masterclass covers convolutional networks, recurrent architectures, attention mechanisms, and generative adversarial networks with cutting-edge research papers.",
    category: CourseCategory.AI,
    tier: CertificateTier.TIER_3,
    price: 1499,
    currency: "INR",
    duration: "4 weeks",
    totalLessons: 20,
    totalModules: 5,
    rating: 4.8,
    reviewCount: 267,
    enrollmentCount: 1653,
    instructorId: "inst-5",
    instructorName: "Dr. Kavita Joshi",
    universityId: "charusat",
    universityName: "CHARUSAT",
    thumbnailUrl: "",
    prerequisites: ["Machine Learning Fundamentals", "Python proficiency", "Calculus"],
    outcomes: ["Build CNNs for computer vision", "Implement sequence models", "Train GANs", "Deploy deep learning models"],
    quizId: "quiz-3",
    modules: [
      { id: "mod-3-1", title: "Deep Learning Foundations", lessons: [
        { id: "les-3-1-1", title: "Deep Neural Networks", duration: 30, type: "video" },
        { id: "les-3-1-2", title: "Optimization Algorithms", duration: 25, type: "video" },
        { id: "les-3-1-3", title: "Batch Normalization", duration: 20, type: "video" },
        { id: "les-3-1-4", title: "Advanced Regularization", duration: 22, type: "article" },
      ]},
      { id: "mod-3-2", title: "Convolutional Neural Networks", lessons: [
        { id: "les-3-2-1", title: "CNN Architecture", duration: 28, type: "video" },
        { id: "les-3-2-2", title: "Image Classification", duration: 30, type: "video" },
        { id: "les-3-2-3", title: "Object Detection", duration: 35, type: "video" },
        { id: "les-3-2-4", title: "Transfer Learning", duration: 25, type: "video" },
      ]},
      { id: "mod-3-3", title: "Sequence Models", lessons: [
        { id: "les-3-3-1", title: "RNNs & LSTMs", duration: 30, type: "video" },
        { id: "les-3-3-2", title: "Attention Mechanisms", duration: 35, type: "video" },
        { id: "les-3-3-3", title: "Transformers Deep Dive", duration: 40, type: "video" },
        { id: "les-3-3-4", title: "NLP Applications", duration: 25, type: "article" },
      ]},
      { id: "mod-3-4", title: "Generative Models", lessons: [
        { id: "les-3-4-1", title: "Autoencoders & VAEs", duration: 28, type: "video" },
        { id: "les-3-4-2", title: "Generative Adversarial Networks", duration: 35, type: "video" },
        { id: "les-3-4-3", title: "Diffusion Models", duration: 30, type: "video" },
        { id: "les-3-4-4", title: "Ethical Considerations", duration: 20, type: "article" },
      ]},
      { id: "mod-3-5", title: "Final Project", lessons: [
        { id: "les-3-5-1", title: "Research Paper Review", duration: 40, type: "article" },
        { id: "les-3-5-2", title: "Implementation Project", duration: 60, type: "article" },
        { id: "les-3-5-3", title: "Final Assessment", duration: 45, type: "quiz" },
        { id: "les-3-5-4", title: "Course Completion", duration: 10, type: "video" },
      ]},
    ],
  },
  {
    id: "course-4",
    slug: "ai-ethics-governance",
    title: "AI Ethics & Governance",
    shortDescription: "Navigate the ethical challenges and governance frameworks for AI systems.",
    description: "Explore the critical intersection of artificial intelligence, ethics, and governance. Learn to build responsible AI systems that are fair, transparent, and accountable.",
    category: CourseCategory.AI,
    tier: CertificateTier.TIER_1,
    price: 699,
    currency: "INR",
    duration: "7 days",
    totalLessons: 16,
    totalModules: 4,
    rating: 4.7,
    reviewCount: 189,
    enrollmentCount: 1234,
    instructorId: "inst-8",
    instructorName: "Dr. Neel Trivedi",
    universityId: "kpgu",
    universityName: "KPGU",
    thumbnailUrl: "",
    prerequisites: ["Basic understanding of AI"],
    outcomes: ["Build AI ethics frameworks", "Conduct bias audits", "Design governance policies", "Navigate regulatory landscape"],
    quizId: "quiz-4",
    modules: [
      { id: "mod-4-1", title: "Ethics in AI", lessons: [
        { id: "les-4-1-1", title: "Why AI Ethics Matters", duration: 20, type: "video" },
        { id: "les-4-1-2", title: "Bias & Fairness", duration: 25, type: "video" },
        { id: "les-4-1-3", title: "Transparency & Explainability", duration: 22, type: "video" },
        { id: "les-4-1-4", title: "Case Studies", duration: 30, type: "article" },
      ]},
      { id: "mod-4-2", title: "Governance Frameworks", lessons: [
        { id: "les-4-2-1", title: "Global AI Regulations", duration: 25, type: "video" },
        { id: "les-4-2-2", title: "India's AI Policy", duration: 20, type: "video" },
        { id: "les-4-2-3", title: "Organizational Governance", duration: 28, type: "video" },
        { id: "les-4-2-4", title: "Risk Assessment", duration: 22, type: "article" },
      ]},
      { id: "mod-4-3", title: "Responsible AI Practices", lessons: [
        { id: "les-4-3-1", title: "Privacy by Design", duration: 25, type: "video" },
        { id: "les-4-3-2", title: "Accountability Mechanisms", duration: 22, type: "video" },
        { id: "les-4-3-3", title: "Environmental Impact", duration: 18, type: "video" },
        { id: "les-4-3-4", title: "Inclusive AI Development", duration: 20, type: "article" },
      ]},
      { id: "mod-4-4", title: "Assessment", lessons: [
        { id: "les-4-4-1", title: "Policy Writing Workshop", duration: 40, type: "article" },
        { id: "les-4-4-2", title: "Final Assessment", duration: 30, type: "quiz" },
        { id: "les-4-4-3", title: "Peer Discussion", duration: 15, type: "article" },
        { id: "les-4-4-4", title: "Certification", duration: 10, type: "video" },
      ]},
    ],
  },

  // ===== COMMERCE CATEGORY =====
  {
    id: "course-5",
    slug: "digital-marketing-strategy",
    title: "Digital Marketing Strategy",
    shortDescription: "Master modern digital marketing channels and data-driven strategies.",
    description: "Comprehensive digital marketing course covering SEO, SEM, social media, content marketing, email automation, and analytics. Focused on the Indian digital ecosystem.",
    category: CourseCategory.COMMERCE,
    tier: CertificateTier.TIER_2,
    price: 799,
    currency: "INR",
    duration: "4 weeks",
    totalLessons: 20,
    totalModules: 5,
    rating: 4.6,
    reviewCount: 421,
    enrollmentCount: 4567,
    instructorId: "inst-4",
    instructorName: "Dr. Vikram Mehta",
    universityId: "msu",
    universityName: "MSU Baroda",
    thumbnailUrl: "",
    prerequisites: ["Basic marketing knowledge"],
    outcomes: ["Plan digital campaigns", "Optimize for search engines", "Analyze marketing data", "Build conversion funnels"],
    quizId: "quiz-5",
    modules: [
      { id: "mod-5-1", title: "Digital Marketing Landscape", lessons: [
        { id: "les-5-1-1", title: "The Digital Ecosystem in India", duration: 22, type: "video" },
        { id: "les-5-1-2", title: "Consumer Behavior Online", duration: 25, type: "video" },
        { id: "les-5-1-3", title: "Channel Strategy", duration: 20, type: "video" },
        { id: "les-5-1-4", title: "Building a Digital Presence", duration: 18, type: "article" },
      ]},
      { id: "mod-5-2", title: "SEO & Content Marketing", lessons: [
        { id: "les-5-2-1", title: "Search Engine Optimization", duration: 28, type: "video" },
        { id: "les-5-2-2", title: "Content Strategy", duration: 25, type: "video" },
        { id: "les-5-2-3", title: "Keyword Research", duration: 22, type: "video" },
        { id: "les-5-2-4", title: "Content Calendar Planning", duration: 20, type: "article" },
      ]},
      { id: "mod-5-3", title: "Social Media & Paid Ads", lessons: [
        { id: "les-5-3-1", title: "Social Media Strategy", duration: 25, type: "video" },
        { id: "les-5-3-2", title: "Facebook & Instagram Ads", duration: 30, type: "video" },
        { id: "les-5-3-3", title: "Google Ads", duration: 28, type: "video" },
        { id: "les-5-3-4", title: "Budget Optimization", duration: 22, type: "article" },
      ]},
      { id: "mod-5-4", title: "Analytics & Automation", lessons: [
        { id: "les-5-4-1", title: "Google Analytics", duration: 25, type: "video" },
        { id: "les-5-4-2", title: "Email Automation", duration: 22, type: "video" },
        { id: "les-5-4-3", title: "Conversion Optimization", duration: 28, type: "video" },
        { id: "les-5-4-4", title: "Reporting & ROI", duration: 20, type: "article" },
      ]},
      { id: "mod-5-5", title: "Final Project", lessons: [
        { id: "les-5-5-1", title: "Campaign Planning Project", duration: 45, type: "article" },
        { id: "les-5-5-2", title: "Final Assessment", duration: 35, type: "quiz" },
        { id: "les-5-5-3", title: "Portfolio Presentation", duration: 20, type: "article" },
        { id: "les-5-5-4", title: "Certification", duration: 10, type: "video" },
      ]},
    ],
  },
  {
    id: "course-6",
    slug: "financial-technology",
    title: "Financial Technology & Innovation",
    shortDescription: "Explore the intersection of finance and technology in India's digital economy.",
    description: "From UPI to blockchain, explore how technology is transforming financial services in India. Learn about digital payments, lending platforms, InsurTech, and regulatory frameworks.",
    category: CourseCategory.COMMERCE,
    tier: CertificateTier.TIER_2,
    price: 999,
    currency: "INR",
    duration: "4 weeks",
    totalLessons: 20,
    totalModules: 5,
    rating: 4.5,
    reviewCount: 298,
    enrollmentCount: 2341,
    instructorId: "inst-6",
    instructorName: "Prof. Amit Shah",
    universityId: "parul",
    universityName: "Parul University",
    thumbnailUrl: "",
    prerequisites: ["Basic financial knowledge"],
    outcomes: ["Understand FinTech ecosystems", "Analyze digital payment systems", "Evaluate blockchain applications", "Navigate regulatory compliance"],
    quizId: "quiz-6",
    modules: [
      { id: "mod-6-1", title: "FinTech Fundamentals", lessons: [
        { id: "les-6-1-1", title: "Evolution of FinTech", duration: 22, type: "video" },
        { id: "les-6-1-2", title: "India's Digital Payment Revolution", duration: 28, type: "video" },
        { id: "les-6-1-3", title: "UPI Deep Dive", duration: 25, type: "video" },
        { id: "les-6-1-4", title: "Global FinTech Landscape", duration: 20, type: "article" },
      ]},
      { id: "mod-6-2", title: "Digital Banking & Lending", lessons: [
        { id: "les-6-2-1", title: "Neobanks & Digital Banking", duration: 25, type: "video" },
        { id: "les-6-2-2", title: "Digital Lending Platforms", duration: 22, type: "video" },
        { id: "les-6-2-3", title: "Credit Scoring with AI", duration: 28, type: "video" },
        { id: "les-6-2-4", title: "Case Study: Paytm & PhonePe", duration: 25, type: "article" },
      ]},
      { id: "mod-6-3", title: "Blockchain & Crypto", lessons: [
        { id: "les-6-3-1", title: "Blockchain Technology", duration: 30, type: "video" },
        { id: "les-6-3-2", title: "Smart Contracts", duration: 25, type: "video" },
        { id: "les-6-3-3", title: "Cryptocurrency Fundamentals", duration: 22, type: "video" },
        { id: "les-6-3-4", title: "India's Regulatory Position", duration: 20, type: "article" },
      ]},
      { id: "mod-6-4", title: "InsurTech & WealthTech", lessons: [
        { id: "les-6-4-1", title: "Insurance Technology", duration: 22, type: "video" },
        { id: "les-6-4-2", title: "Robo-Advisory", duration: 25, type: "video" },
        { id: "les-6-4-3", title: "RegTech & Compliance", duration: 20, type: "video" },
        { id: "les-6-4-4", title: "Future of Finance", duration: 18, type: "article" },
      ]},
      { id: "mod-6-5", title: "Assessment", lessons: [
        { id: "les-6-5-1", title: "FinTech Business Plan", duration: 40, type: "article" },
        { id: "les-6-5-2", title: "Final Assessment", duration: 35, type: "quiz" },
        { id: "les-6-5-3", title: "Industry Analysis", duration: 25, type: "article" },
        { id: "les-6-5-4", title: "Certification", duration: 10, type: "video" },
      ]},
    ],
  },
  {
    id: "course-7",
    slug: "ecommerce-operations",
    title: "E-Commerce Operations & Management",
    shortDescription: "Build and manage scalable e-commerce businesses for the Indian market.",
    description: "From marketplace management to last-mile delivery, master the operations of running a successful e-commerce business in India.",
    category: CourseCategory.COMMERCE, tier: CertificateTier.TIER_1, price: 599, currency: "INR",
    duration: "7 days", totalLessons: 16, totalModules: 4, rating: 4.4, reviewCount: 187,
    enrollmentCount: 1987, instructorId: "inst-11", instructorName: "Dr. Meera Krishnan",
    universityId: "charusat", universityName: "CHARUSAT", thumbnailUrl: "",
    prerequisites: ["Business basics"], outcomes: ["Manage e-commerce operations", "Optimize supply chains", "Implement digital payments", "Scale marketplace presence"],
    quizId: "quiz-7",
    modules: [
      { id: "mod-7-1", title: "E-Commerce Fundamentals", lessons: [
        { id: "les-7-1-1", title: "Indian E-Commerce Landscape", duration: 22, type: "video" },
        { id: "les-7-1-2", title: "Business Models", duration: 20, type: "video" },
        { id: "les-7-1-3", title: "Platform Selection", duration: 18, type: "video" },
        { id: "les-7-1-4", title: "Setting Up Your Store", duration: 25, type: "article" },
      ]},
      { id: "mod-7-2", title: "Operations & Logistics", lessons: [
        { id: "les-7-2-1", title: "Inventory Management", duration: 25, type: "video" },
        { id: "les-7-2-2", title: "Last-Mile Delivery", duration: 22, type: "video" },
        { id: "les-7-2-3", title: "Returns Management", duration: 20, type: "video" },
        { id: "les-7-2-4", title: "COD vs Digital Payments", duration: 18, type: "article" },
      ]},
      { id: "mod-7-3", title: "Growth & Marketing", lessons: [
        { id: "les-7-3-1", title: "Marketplace Optimization", duration: 25, type: "video" },
        { id: "les-7-3-2", title: "Customer Retention", duration: 22, type: "video" },
        { id: "les-7-3-3", title: "Data-Driven Decisions", duration: 28, type: "video" },
        { id: "les-7-3-4", title: "Scaling Strategies", duration: 20, type: "article" },
      ]},
      { id: "mod-7-4", title: "Assessment", lessons: [
        { id: "les-7-4-1", title: "Business Plan Project", duration: 35, type: "article" },
        { id: "les-7-4-2", title: "Final Assessment", duration: 30, type: "quiz" },
        { id: "les-7-4-3", title: "Peer Review", duration: 15, type: "article" },
        { id: "les-7-4-4", title: "Certification", duration: 10, type: "video" },
      ]},
    ],
  },
  {
    id: "course-8",
    slug: "business-analytics",
    title: "Business Analytics & Decision Making",
    shortDescription: "Transform data into actionable business insights.",
    description: "Learn to use data analytics tools and frameworks to make better business decisions. Covers Excel analytics, SQL, visualization with Tableau, and statistical analysis.",
    category: CourseCategory.COMMERCE, tier: CertificateTier.TIER_2, price: 899, currency: "INR",
    duration: "4 weeks", totalLessons: 20, totalModules: 5, rating: 4.6, reviewCount: 356,
    enrollmentCount: 3456, instructorId: "inst-9", instructorName: "Prof. Sneha Raval",
    universityId: "parul", universityName: "Parul University", thumbnailUrl: "",
    prerequisites: ["Basic statistics", "Excel familiarity"], outcomes: ["Analyze business data", "Create dashboards", "Write SQL queries", "Build predictive models"],
    quizId: "quiz-8",
    modules: [
      { id: "mod-8-1", title: "Analytics Foundations", lessons: [
        { id: "les-8-1-1", title: "Introduction to Analytics", duration: 20, type: "video" },
        { id: "les-8-1-2", title: "Data Types & Sources", duration: 22, type: "video" },
        { id: "les-8-1-3", title: "Excel for Analytics", duration: 30, type: "video" },
        { id: "les-8-1-4", title: "Statistical Fundamentals", duration: 25, type: "article" },
      ]},
      { id: "mod-8-2", title: "SQL & Databases", lessons: [
        { id: "les-8-2-1", title: "SQL Basics", duration: 28, type: "video" },
        { id: "les-8-2-2", title: "Advanced Queries", duration: 30, type: "video" },
        { id: "les-8-2-3", title: "Database Design", duration: 25, type: "video" },
        { id: "les-8-2-4", title: "Practice Problems", duration: 35, type: "article" },
      ]},
      { id: "mod-8-3", title: "Data Visualization", lessons: [
        { id: "les-8-3-1", title: "Visualization Principles", duration: 22, type: "video" },
        { id: "les-8-3-2", title: "Tableau Fundamentals", duration: 30, type: "video" },
        { id: "les-8-3-3", title: "Dashboard Design", duration: 28, type: "video" },
        { id: "les-8-3-4", title: "Storytelling with Data", duration: 20, type: "article" },
      ]},
      { id: "mod-8-4", title: "Predictive Analytics", lessons: [
        { id: "les-8-4-1", title: "Regression Analysis", duration: 25, type: "video" },
        { id: "les-8-4-2", title: "Forecasting Methods", duration: 28, type: "video" },
        { id: "les-8-4-3", title: "A/B Testing", duration: 22, type: "video" },
        { id: "les-8-4-4", title: "Business Applications", duration: 20, type: "article" },
      ]},
      { id: "mod-8-5", title: "Capstone", lessons: [
        { id: "les-8-5-1", title: "Analytics Project", duration: 45, type: "article" },
        { id: "les-8-5-2", title: "Final Assessment", duration: 35, type: "quiz" },
        { id: "les-8-5-3", title: "Presentation", duration: 20, type: "article" },
        { id: "les-8-5-4", title: "Certification", duration: 10, type: "video" },
      ]},
    ],
  },

  // ===== DESIGN CATEGORY =====
  {
    id: "course-9",
    slug: "ui-ux-design-principles",
    title: "UI/UX Design Principles",
    shortDescription: "Master the fundamentals of user interface and user experience design.",
    description: "From user research to high-fidelity prototypes, learn the complete UI/UX design process. Focused on practical skills using Figma and modern design systems.",
    category: CourseCategory.DESIGN, tier: CertificateTier.TIER_2, price: 699, currency: "INR",
    duration: "4 weeks", totalLessons: 20, totalModules: 5, rating: 4.8, reviewCount: 412,
    enrollmentCount: 3789, instructorId: "inst-3", instructorName: "Prof. Ananya Desai",
    universityId: "navrachana", universityName: "Navrachana University", thumbnailUrl: "",
    prerequisites: ["No prerequisites"], outcomes: ["Conduct user research", "Create wireframes", "Build design systems", "Prototype in Figma"],
    quizId: "quiz-9",
    modules: [
      { id: "mod-9-1", title: "Design Fundamentals", lessons: [
        { id: "les-9-1-1", title: "What is UX Design?", duration: 22, type: "video" },
        { id: "les-9-1-2", title: "Design Principles", duration: 25, type: "video" },
        { id: "les-9-1-3", title: "Color Theory", duration: 20, type: "video" },
        { id: "les-9-1-4", title: "Typography", duration: 22, type: "video" },
      ]},
      { id: "mod-9-2", title: "User Research", lessons: [
        { id: "les-9-2-1", title: "Research Methods", duration: 25, type: "video" },
        { id: "les-9-2-2", title: "Personas & Journey Maps", duration: 28, type: "video" },
        { id: "les-9-2-3", title: "Usability Testing", duration: 22, type: "video" },
        { id: "les-9-2-4", title: "Research Synthesis", duration: 20, type: "article" },
      ]},
      { id: "mod-9-3", title: "Wireframing & Prototyping", lessons: [
        { id: "les-9-3-1", title: "Information Architecture", duration: 25, type: "video" },
        { id: "les-9-3-2", title: "Wireframing in Figma", duration: 30, type: "video" },
        { id: "les-9-3-3", title: "Interactive Prototypes", duration: 35, type: "video" },
        { id: "les-9-3-4", title: "Design Handoff", duration: 20, type: "article" },
      ]},
      { id: "mod-9-4", title: "Design Systems", lessons: [
        { id: "les-9-4-1", title: "Building Design Systems", duration: 30, type: "video" },
        { id: "les-9-4-2", title: "Component Libraries", duration: 25, type: "video" },
        { id: "les-9-4-3", title: "Accessibility in Design", duration: 22, type: "video" },
        { id: "les-9-4-4", title: "Design Tokens", duration: 18, type: "article" },
      ]},
      { id: "mod-9-5", title: "Portfolio Project", lessons: [
        { id: "les-9-5-1", title: "End-to-End Design Project", duration: 50, type: "article" },
        { id: "les-9-5-2", title: "Final Assessment", duration: 30, type: "quiz" },
        { id: "les-9-5-3", title: "Portfolio Review", duration: 20, type: "article" },
        { id: "les-9-5-4", title: "Certification", duration: 10, type: "video" },
      ]},
    ],
  },
  {
    id: "course-10",
    slug: "design-thinking",
    title: "Design Thinking for Innovation",
    shortDescription: "Apply design thinking methodology to solve complex business problems.",
    description: "Learn the five-stage design thinking process: empathize, define, ideate, prototype, and test. Apply creative problem-solving to real-world challenges.",
    category: CourseCategory.DESIGN, tier: CertificateTier.TIER_1, price: 499, currency: "INR",
    duration: "7 days", totalLessons: 16, totalModules: 4, rating: 4.7, reviewCount: 289,
    enrollmentCount: 2456, instructorId: "inst-10", instructorName: "Dr. Arjun Nair",
    universityId: "msu", universityName: "MSU Baroda", thumbnailUrl: "",
    prerequisites: ["No prerequisites"], outcomes: ["Apply design thinking", "Facilitate ideation sessions", "Build rapid prototypes", "Test solutions with users"],
    quizId: "quiz-10",
    modules: [
      { id: "mod-10-1", title: "Empathize & Define", lessons: [
        { id: "les-10-1-1", title: "Introduction to Design Thinking", duration: 20, type: "video" },
        { id: "les-10-1-2", title: "Empathy Mapping", duration: 25, type: "video" },
        { id: "les-10-1-3", title: "Problem Definition", duration: 22, type: "video" },
        { id: "les-10-1-4", title: "How Might We Questions", duration: 18, type: "article" },
      ]},
      { id: "mod-10-2", title: "Ideate", lessons: [
        { id: "les-10-2-1", title: "Brainstorming Techniques", duration: 25, type: "video" },
        { id: "les-10-2-2", title: "SCAMPER Method", duration: 20, type: "video" },
        { id: "les-10-2-3", title: "Mind Mapping", duration: 18, type: "video" },
        { id: "les-10-2-4", title: "Idea Selection", duration: 22, type: "article" },
      ]},
      { id: "mod-10-3", title: "Prototype & Test", lessons: [
        { id: "les-10-3-1", title: "Rapid Prototyping", duration: 28, type: "video" },
        { id: "les-10-3-2", title: "Testing with Users", duration: 25, type: "video" },
        { id: "les-10-3-3", title: "Iteration Cycles", duration: 22, type: "video" },
        { id: "les-10-3-4", title: "Real-World Case Studies", duration: 30, type: "article" },
      ]},
      { id: "mod-10-4", title: "Assessment", lessons: [
        { id: "les-10-4-1", title: "Design Challenge", duration: 40, type: "article" },
        { id: "les-10-4-2", title: "Final Assessment", duration: 25, type: "quiz" },
        { id: "les-10-4-3", title: "Reflection", duration: 15, type: "article" },
        { id: "les-10-4-4", title: "Certification", duration: 10, type: "video" },
      ]},
    ],
  },
  {
    id: "course-11",
    slug: "visual-communication",
    title: "Visual Communication & Storytelling",
    shortDescription: "Create compelling visual narratives for digital and print media.",
    description: "Master the art of visual storytelling through composition, color, typography, and motion. Build skills in brand identity, infographic design, and presentation aesthetics.",
    category: CourseCategory.DESIGN, tier: CertificateTier.TIER_1, price: 599, currency: "INR",
    duration: "7 days", totalLessons: 16, totalModules: 4, rating: 4.5, reviewCount: 156,
    enrollmentCount: 1678, instructorId: "inst-3", instructorName: "Prof. Ananya Desai",
    universityId: "navrachana", universityName: "Navrachana University", thumbnailUrl: "",
    prerequisites: ["Basic computer skills"], outcomes: ["Create visual narratives", "Design brand identities", "Build infographics", "Master presentation design"],
    quizId: "quiz-11",
    modules: [
      { id: "mod-11-1", title: "Visual Language", lessons: [
        { id: "les-11-1-1", title: "Elements of Visual Design", duration: 22, type: "video" },
        { id: "les-11-1-2", title: "Composition Rules", duration: 25, type: "video" },
        { id: "les-11-1-3", title: "Visual Hierarchy", duration: 20, type: "video" },
        { id: "les-11-1-4", title: "Mood Boards", duration: 18, type: "article" },
      ]},
      { id: "mod-11-2", title: "Brand Identity", lessons: [
        { id: "les-11-2-1", title: "Brand Strategy", duration: 25, type: "video" },
        { id: "les-11-2-2", title: "Logo Design", duration: 30, type: "video" },
        { id: "les-11-2-3", title: "Color Psychology", duration: 22, type: "video" },
        { id: "les-11-2-4", title: "Brand Guidelines", duration: 20, type: "article" },
      ]},
      { id: "mod-11-3", title: "Data Visualization", lessons: [
        { id: "les-11-3-1", title: "Infographic Design", duration: 28, type: "video" },
        { id: "les-11-3-2", title: "Chart Design Principles", duration: 22, type: "video" },
        { id: "les-11-3-3", title: "Presentation Design", duration: 25, type: "video" },
        { id: "les-11-3-4", title: "Storytelling Frameworks", duration: 20, type: "article" },
      ]},
      { id: "mod-11-4", title: "Final Project", lessons: [
        { id: "les-11-4-1", title: "Brand Identity Project", duration: 45, type: "article" },
        { id: "les-11-4-2", title: "Final Assessment", duration: 25, type: "quiz" },
        { id: "les-11-4-3", title: "Portfolio Showcase", duration: 20, type: "article" },
        { id: "les-11-4-4", title: "Certification", duration: 10, type: "video" },
      ]},
    ],
  },
  {
    id: "course-12",
    slug: "product-design",
    title: "Product Design: From Concept to Launch",
    shortDescription: "End-to-end product design process for digital products.",
    description: "Learn to design digital products from initial concept to market launch. Covers product strategy, user-centered design, prototyping, and design leadership.",
    category: CourseCategory.DESIGN, tier: CertificateTier.TIER_3, price: 799, currency: "INR",
    duration: "4 weeks", totalLessons: 20, totalModules: 5, rating: 4.8, reviewCount: 234,
    enrollmentCount: 1890, instructorId: "inst-10", instructorName: "Dr. Arjun Nair",
    universityId: "msu", universityName: "MSU Baroda", thumbnailUrl: "",
    prerequisites: ["UI/UX basics recommended"], outcomes: ["Define product strategy", "Design end-to-end flows", "Lead design teams", "Launch digital products"],
    quizId: "quiz-12",
    modules: [
      { id: "mod-12-1", title: "Product Strategy", lessons: [
        { id: "les-12-1-1", title: "Product-Market Fit", duration: 25, type: "video" },
        { id: "les-12-1-2", title: "Competitive Analysis", duration: 22, type: "video" },
        { id: "les-12-1-3", title: "Feature Prioritization", duration: 25, type: "video" },
        { id: "les-12-1-4", title: "Product Roadmapping", duration: 20, type: "article" },
      ]},
      { id: "mod-12-2", title: "User-Centered Design", lessons: [
        { id: "les-12-2-1", title: "User Flows", duration: 28, type: "video" },
        { id: "les-12-2-2", title: "Interaction Design", duration: 25, type: "video" },
        { id: "les-12-2-3", title: "Micro-interactions", duration: 22, type: "video" },
        { id: "les-12-2-4", title: "Motion Design", duration: 25, type: "video" },
      ]},
      { id: "mod-12-3", title: "Advanced Prototyping", lessons: [
        { id: "les-12-3-1", title: "High-Fidelity Prototypes", duration: 30, type: "video" },
        { id: "les-12-3-2", title: "Design Systems at Scale", duration: 28, type: "video" },
        { id: "les-12-3-3", title: "Developer Handoff", duration: 22, type: "video" },
        { id: "les-12-3-4", title: "Design QA", duration: 20, type: "article" },
      ]},
      { id: "mod-12-4", title: "Design Leadership", lessons: [
        { id: "les-12-4-1", title: "Leading Design Teams", duration: 25, type: "video" },
        { id: "les-12-4-2", title: "Stakeholder Management", duration: 22, type: "video" },
        { id: "les-12-4-3", title: "Design Metrics", duration: 20, type: "video" },
        { id: "les-12-4-4", title: "Building Design Culture", duration: 18, type: "article" },
      ]},
      { id: "mod-12-5", title: "Capstone", lessons: [
        { id: "les-12-5-1", title: "Product Design Project", duration: 50, type: "article" },
        { id: "les-12-5-2", title: "Final Assessment", duration: 35, type: "quiz" },
        { id: "les-12-5-3", title: "Portfolio & Presentation", duration: 25, type: "article" },
        { id: "les-12-5-4", title: "Certification", duration: 10, type: "video" },
      ]},
    ],
  },
];

export function getCourseBySlug(slug: string): MockCourse | undefined {
  return mockCourses.find((c) => c.slug === slug);
}

export function getCourseById(id: string): MockCourse | undefined {
  return mockCourses.find((c) => c.id === id);
}

export function getCoursesByCategory(category: CourseCategory): MockCourse[] {
  return mockCourses.filter((c) => c.category === category);
}

export function getCoursesByUniversity(universityId: string): MockCourse[] {
  return mockCourses.filter((c) => c.universityId === universityId);
}

export function searchCourses(query: string): MockCourse[] {
  const q = query.toLowerCase();
  return mockCourses.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      c.shortDescription.toLowerCase().includes(q) ||
      c.instructorName.toLowerCase().includes(q) ||
      c.universityName.toLowerCase().includes(q)
  );
}

export function getTotalLessonsForCourse(course: MockCourse): number {
  return course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
}
