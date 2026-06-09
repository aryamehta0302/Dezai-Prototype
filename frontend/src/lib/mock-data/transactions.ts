import { PaymentStatus } from "@/shared/types/common.types";

export interface MockTransaction {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  universityId: string;
  universityName: string;
  amount: number;
  platformFee: number;
  universityShare: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  createdAt: string;
}

function generateTransactions(): MockTransaction[] {
  const transactions: MockTransaction[] = [];
  const courses = [
    { id: "course-1", title: "Generative AI for Leaders", price: 899, univId: "stanford", univName: "Stanford AI" },
    { id: "course-2", title: "Machine Learning Fundamentals", price: 1299, univId: "kpgu", univName: "KPGU" },
    { id: "course-3", title: "Deep Learning Masterclass", price: 1499, univId: "charusat", univName: "CHARUSAT" },
    { id: "course-4", title: "AI Ethics & Governance", price: 699, univId: "kpgu", univName: "KPGU" },
    { id: "course-5", title: "Digital Marketing Strategy", price: 799, univId: "msu", univName: "MSU Baroda" },
    { id: "course-6", title: "Financial Technology", price: 999, univId: "parul", univName: "Parul" },
    { id: "course-7", title: "E-Commerce Operations", price: 599, univId: "charusat", univName: "CHARUSAT" },
    { id: "course-8", title: "Business Analytics", price: 899, univId: "parul", univName: "Parul" },
    { id: "course-9", title: "UI/UX Design Principles", price: 699, univId: "navrachana", univName: "Navrachana" },
    { id: "course-10", title: "Design Thinking", price: 499, univId: "msu", univName: "MSU Baroda" },
    { id: "course-11", title: "Visual Communication", price: 599, univId: "navrachana", univName: "Navrachana" },
    { id: "course-12", title: "Product Design", price: 799, univId: "msu", univName: "MSU Baroda" },
  ];

  const students = [
    "Aarav Patel", "Ishaan Shah", "Priya Sharma", "Arjun Mehta", "Kavya Joshi",
    "Rohan Desai", "Diya Patel", "Vivaan Modi", "Ananya Trivedi", "Sai Raval",
    "Neha Gupta", "Raj Kumar", "Meera Nair", "Dev Chopra", "Aisha Khan",
  ];

  const methods = ["UPI", "Debit Card", "Credit Card", "Net Banking", "UPI"];
  const statuses: PaymentStatus[] = [
    PaymentStatus.SUCCESS, PaymentStatus.SUCCESS, PaymentStatus.SUCCESS,
    PaymentStatus.SUCCESS, PaymentStatus.SUCCESS, PaymentStatus.SUCCESS,
    PaymentStatus.SUCCESS, PaymentStatus.PENDING, PaymentStatus.FAILED,
    PaymentStatus.SUCCESS,
  ];

  for (let i = 0; i < 80; i++) {
    const course = courses[i % courses.length];
    const student = students[i % students.length];
    const status = statuses[i % statuses.length];
    const platformFee = Math.round(course.price * 0.30);
    const universityShare = course.price - platformFee;
    const day = Math.floor(i / 3) + 1;
    const month = Math.min(Math.floor(i / 15) + 1, 6);

    transactions.push({
      id: `txn-${String(i + 1).padStart(4, "0")}`,
      userId: `user-student-${(i % 10) + 1}`,
      userName: student,
      courseId: course.id,
      courseTitle: course.title,
      universityId: course.univId,
      universityName: course.univName,
      amount: course.price,
      platformFee,
      universityShare,
      currency: "INR",
      status,
      paymentMethod: methods[i % methods.length],
      createdAt: `2026-${String(month).padStart(2, "0")}-${String(Math.min(day, 28)).padStart(2, "0")}T${String(9 + (i % 12))}:${String(i % 60).padStart(2, "0")}:00Z`,
    });
  }

  return transactions;
}

export const mockTransactions = generateTransactions();

export function getTransactionsByUser(userId: string): MockTransaction[] {
  return mockTransactions.filter((t) => t.userId === userId);
}

export function getTransactionsByUniversity(universityId: string): MockTransaction[] {
  return mockTransactions.filter((t) => t.universityId === universityId);
}

export function getTotalRevenue(): number {
  return mockTransactions
    .filter((t) => t.status === PaymentStatus.SUCCESS)
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getPlatformRevenue(): number {
  return mockTransactions
    .filter((t) => t.status === PaymentStatus.SUCCESS)
    .reduce((sum, t) => sum + t.platformFee, 0);
}
