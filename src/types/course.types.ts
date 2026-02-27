export interface ICourse {
  id: number;
  code: string;
  name: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface ICreateCourseRequest {
  code: string;
  name: string;
}

export interface IUpdateCourseRequest {
  code?: string;
  name?: string;
}

export interface ICourseWithLecturers extends ICourse {
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

export interface IAssignLecturerRequest {
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
