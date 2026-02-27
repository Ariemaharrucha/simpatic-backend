// Unified login request - identifier can be email (admin), NIM (student), or NIK (lecturer)
export interface ILoginRequest {
  identifier: string;
  password: string;
}

// Login request untuk Mahasiswa
export interface IStudentLoginRequest {
  nim: string;
  password: string;
}

// Login request untuk Dosen
export interface ILecturerLoginRequest {
  nik: string;
  password: string;
}

// Response setelah login sukses
export interface IAuthResponse {
  user: {
    id: number;
    email: string;
    role: string;
    profile: {
      id: number;
      name: string;
      lecturerCode?: string;
      nim?: string;
    };
  };
  token: string;
}

// JWT Payload
export interface IJWTPayload {
  userId: number;
  email: string;
  role: string;
  profileId: number;
}

// Change password request
export interface IChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// User response for get current user
export interface IUserResponse {
  id: number;
  email: string;
  role: string;
  status: string;
  profile: {
    id: number;
    name: string;
    lecturerCode?: string;
    nim?: string;
  };
}
