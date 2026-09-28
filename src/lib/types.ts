interface Student {
  studentId: string;
  firstName: string;
  lastName: string;
  program: "CPE" | "ISNE";
  status: "Active" | "Inactive";
  enrolledCourses: string[]; // เช่น ["CS101", "CS201"]
}
export type { Student };

interface Course {
  courseCode: string; // เช่น "CPE301"
  courseTitle: string;
  instructors?: string[];
}
export type { Course };

interface User {
  username: string;
  password: string;
  studentId?: string | null;
  role: "STUDENT" | "ADMIN";
  tokens?: string[];
}
export type { User };