export interface ICourseResponse {
  id: number;
  code: string;
  name: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface IPaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ICreateCourse {
  code: string;
  name: string;
}

export interface IUpdateCourse {
  code?: string;
  name?: string;
}

export interface ICourseWithLecturers extends ICourseResponse {
  lecturerCourses: Array<{
    id: number;
    lecturerId: number;
    lecturer: {
      id: number;
      lecturerCode: string;
      name: string;
      user: {
        id: number;
        email: string;
        status: string;
      };
    };
  }>;
}

export interface ILecturerCourse {
  id: number;
  lecturerId: number;
  courseId: number;
  createdAt: Date;
}

export interface IAssignLecturer {
  lecturerId: number;
}

export interface ICourseLecturer {
  lecturerCourseId: number;
  lecturerId: number;
  lecturerCode: string;
  name: string;
  email: string;
  userStatus: string;
  assignedAt: Date;
}

export interface IAvailableLecturer {
  id: number;
  lecturerCode: string;
  name: string;
  user: {
    id: number;
    email: string;
    status: string;
  };
}

export interface ILecturerWithUser {
  id: number;
  userId: number;
  lecturerCode: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    email: string;
    status: string;
  };
}
