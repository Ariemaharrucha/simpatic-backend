export enum UserRole {
  ADMIN = "admin",
  LECTURER = "lecturer",
  STUDENT = "student",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

export interface IUser {
  id: number;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
}

export interface IAdminProfile {
  id: number;
  userId: number;
  name: string;
}

export interface ILecturerProfile {
  id: number;
  userId: number;
  lecturerCode: string;
  name: string;
}

export interface IStudentProfile {
  id: number;
  userId: number;
  nim: string;
  name: string;
  preClinicalPassed: boolean;
}

export interface IUserWithProfile extends IUser {
  admin?: IAdminProfile;
  lecturer?: ILecturerProfile;
  student?: IStudentProfile;
}
