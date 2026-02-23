export interface IRequestOTPRequest {
  email: string;
}

export interface IVerifyOTPRequest {
  email: string;
  otp: string;
}

export interface IResetPasswordRequest {
  email: string;
  resetToken: string;
  newPassword: string;
}

export interface IOTPResponse {
  message: string;
}

export interface IVerifyOTPResponse {
  message: string;
  resetToken: string;
}

export interface PasswordResetTokenData {
  id: number;
  userId: number;
  tokenHash: string;
  email: string;
  attempts: number;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}
