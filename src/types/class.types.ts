export interface IClassResponse {
  id: number;
  name: string;
  academicYear: string;
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

export interface ICreateClass {
  name: string;
  academicYear: string;
}

export interface IUpdateClass {
  name?: string;
  academicYear?: string;
}

export interface IClassWithStudents extends IClassResponse {
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

export interface IAssignStudent {
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
