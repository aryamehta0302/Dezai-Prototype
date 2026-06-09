export interface MockUniversity {
  id: string;
  name: string;
  shortName: string;
  location: string;
  description: string;
  accreditation: string;
  logoUrl: string;
  revenueShare: number;
  stats: {
    students: number;
    courses: number;
    instructors: number;
    completionRate: number;
  };
}

export const mockUniversities: MockUniversity[] = [
  {
    id: "kpgu",
    name: "Krishna Patel Gyansagar University",
    shortName: "KPGU",
    location: "Vadodara, Gujarat",
    description: "A premier institution focused on innovation and technology-driven education in Gujarat, offering cutting-edge programs in AI, engineering, and management.",
    accreditation: "UGC Recognized | NAAC A+",
    logoUrl: "/brand/kpgu-logo.png",
    revenueShare: 70,
    stats: { students: 4280, courses: 12, instructors: 8, completionRate: 87.2 },
  },
  {
    id: "parul",
    name: "Parul University",
    shortName: "Parul",
    location: "Vadodara, Gujarat",
    description: "One of Gujarat's largest private universities with a strong focus on industry-integrated learning and global partnerships.",
    accreditation: "UGC Recognized | NAAC A++",
    logoUrl: "/brand/parul-logo.png",
    revenueShare: 70,
    stats: { students: 6120, courses: 15, instructors: 12, completionRate: 84.5 },
  },
  {
    id: "charusat",
    name: "Charotar University of Science & Technology",
    shortName: "CHARUSAT",
    location: "Changa, Anand, Gujarat",
    description: "A leading research-intensive university known for excellence in science, technology, and professional education.",
    accreditation: "UGC Recognized | NAAC A+",
    logoUrl: "/brand/charusat-logo.png",
    revenueShare: 70,
    stats: { students: 3450, courses: 10, instructors: 7, completionRate: 89.1 },
  },
  {
    id: "navrachana",
    name: "Navrachana University",
    shortName: "Navrachana",
    location: "Vadodara, Gujarat",
    description: "A progressive university fostering creativity, critical thinking, and interdisciplinary learning across design, technology, and liberal arts.",
    accreditation: "UGC Recognized | NAAC A",
    logoUrl: "/brand/navrachana-logo.png",
    revenueShare: 65,
    stats: { students: 1890, courses: 8, instructors: 5, completionRate: 91.3 },
  },
  {
    id: "msu",
    name: "Maharaja Sayajirao University of Baroda",
    shortName: "MSU Baroda",
    location: "Vadodara, Gujarat",
    description: "One of India's most prestigious public universities, established in 1949, known for its comprehensive academic programs and research contributions.",
    accreditation: "UGC Recognized | NAAC A++ | Heritage University",
    logoUrl: "/brand/msu-logo.png",
    revenueShare: 75,
    stats: { students: 8750, courses: 18, instructors: 15, completionRate: 82.8 },
  },
  {
    id: "stanford",
    name: "Stanford Institute for AI",
    shortName: "Stanford AI",
    location: "Stanford, California, USA",
    description: "World-renowned research institution partnering with Dezai to bring cutting-edge AI education to Indian universities.",
    accreditation: "WASC Accredited | International Partner",
    logoUrl: "/brand/stanford-logo.png",
    revenueShare: 60,
    stats: { students: 2100, courses: 4, instructors: 3, completionRate: 93.5 },
  },
];

export function getUniversityById(id: string): MockUniversity | undefined {
  return mockUniversities.find((u) => u.id === id);
}

export function getUniversityByName(name: string): MockUniversity | undefined {
  return mockUniversities.find((u) => u.name === name || u.shortName === name);
}
