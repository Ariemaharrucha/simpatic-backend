export interface IClass {
  id: number;
  name: string;
  academicYear: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface ICreateClassRequest {
  name: string;
  academicYear: string;
}

export interface IUpdateClassRequest {
  name?: string;
  academicYear?: string;
}

export interface IClassWithStudents extends IClass {
  classStudents: Array<{
    id: number;
    studentId: number;
    student: {
      id: number;
      nim: string;
      name: string;
      user: {
        id: number;
        email: string;
        status: string;
      };
    };
  }>;
}

export interface IClassStudent {
  id: number;
  classId: number;
  studentId: number;
  createdAt: Date;
}

export interface IAssignStudentRequest {
  studentId: number;
}

export interface IAvailableStudent {
  id: number;
  nim: string;
  name: string;
  user: {
    id: number;
    email: string;
    status: string;
  };
}
