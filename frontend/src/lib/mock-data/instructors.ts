export interface MockInstructor {
  id: string;
  name: string;
  title: string;
  university: string;
  universityId: string;
  specialization: string;
  bio: string;
  avatar: string;
  coursesCount: number;
  rating: number;
}

export const mockInstructors: MockInstructor[] = [
  {
    id: "inst-1",
    name: "Dr. Priya Sharma",
    title: "Professor of Artificial Intelligence",
    university: "KPGU",
    universityId: "kpgu",
    specialization: "Generative AI & NLP",
    bio: "15+ years in AI research with publications in NeurIPS and ICML. Former research lead at Google AI India.",
    avatar: "",
    coursesCount: 3,
    rating: 4.9,
  },
  {
    id: "inst-2",
    name: "Dr. Rajesh Patel",
    title: "Associate Professor",
    university: "KPGU",
    universityId: "kpgu",
    specialization: "Machine Learning & Data Science",
    bio: "Expert in applied ML with industry experience at TCS Research and Microsoft India.",
    avatar: "",
    coursesCount: 2,
    rating: 4.7,
  },
  {
    id: "inst-3",
    name: "Prof. Ananya Desai",
    title: "Head of Design Department",
    university: "Navrachana",
    universityId: "navrachana",
    specialization: "UI/UX Design & Human-Computer Interaction",
    bio: "Award-winning designer with 12 years of experience at Infosys Design and Wipro Digital.",
    avatar: "",
    coursesCount: 2,
    rating: 4.8,
  },
  {
    id: "inst-4",
    name: "Dr. Vikram Mehta",
    title: "Professor of Commerce",
    university: "MSU Baroda",
    universityId: "msu",
    specialization: "Digital Marketing & E-Commerce",
    bio: "Published author and consultant for Fortune 500 companies on digital transformation strategies.",
    avatar: "",
    coursesCount: 2,
    rating: 4.6,
  },
  {
    id: "inst-5",
    name: "Dr. Kavita Joshi",
    title: "Assistant Professor",
    university: "CHARUSAT",
    universityId: "charusat",
    specialization: "Deep Learning & Computer Vision",
    bio: "Postdoc from IIT Bombay with research focus on medical imaging and autonomous systems.",
    avatar: "",
    coursesCount: 2,
    rating: 4.8,
  },
  {
    id: "inst-6",
    name: "Prof. Amit Shah",
    title: "Professor of FinTech",
    university: "Parul",
    universityId: "parul",
    specialization: "Financial Technology & Blockchain",
    bio: "Former VP at HDFC Bank's innovation lab. Pioneer in UPI-based financial systems.",
    avatar: "",
    coursesCount: 2,
    rating: 4.5,
  },
  {
    id: "inst-7",
    name: "Dr. Elena Rostova",
    title: "Visiting Professor",
    university: "Stanford AI",
    universityId: "stanford",
    specialization: "Strategic AI Implementation",
    bio: "Stanford researcher specializing in enterprise AI adoption. Advisor to multiple Fortune 100 companies.",
    avatar: "",
    coursesCount: 1,
    rating: 4.9,
  },
  {
    id: "inst-8",
    name: "Dr. Neel Trivedi",
    title: "Associate Professor",
    university: "KPGU",
    universityId: "kpgu",
    specialization: "AI Ethics & Governance",
    bio: "Lead researcher in responsible AI. Consultant to NITI Aayog on AI policy for India.",
    avatar: "",
    coursesCount: 1,
    rating: 4.7,
  },
  {
    id: "inst-9",
    name: "Prof. Sneha Raval",
    title: "Assistant Professor",
    university: "Parul",
    universityId: "parul",
    specialization: "Business Analytics & Strategy",
    bio: "MBA from IIM Ahmedabad. 8 years consulting experience at McKinsey India.",
    avatar: "",
    coursesCount: 2,
    rating: 4.6,
  },
  {
    id: "inst-10",
    name: "Dr. Arjun Nair",
    title: "Professor of Design",
    university: "MSU Baroda",
    universityId: "msu",
    specialization: "Product Design & Design Thinking",
    bio: "Internationally acclaimed designer. Founded the Design Innovation Centre at MSU.",
    avatar: "",
    coursesCount: 2,
    rating: 4.8,
  },
  {
    id: "inst-11",
    name: "Dr. Meera Krishnan",
    title: "Associate Professor",
    university: "CHARUSAT",
    universityId: "charusat",
    specialization: "E-Commerce & Digital Operations",
    bio: "Specialist in supply chain optimization and digital marketplace design for Indian markets.",
    avatar: "",
    coursesCount: 1,
    rating: 4.5,
  },
  {
    id: "inst-12",
    name: "Prof. James Chen",
    title: "Research Fellow",
    university: "Stanford AI",
    universityId: "stanford",
    specialization: "Advanced Machine Learning",
    bio: "Stanford PhD in ML. Published 40+ papers on transformer architectures and foundation models.",
    avatar: "",
    coursesCount: 1,
    rating: 4.9,
  },
];

export function getInstructorById(id: string): MockInstructor | undefined {
  return mockInstructors.find((i) => i.id === id);
}

export function getInstructorsByUniversity(universityId: string): MockInstructor[] {
  return mockInstructors.filter((i) => i.universityId === universityId);
}
