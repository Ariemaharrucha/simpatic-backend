import { UserRepository } from "../repositories/user.repository";
import { PasswordResetRepository } from "../repositories/password-reset.repository";
import { PasswordUtils } from "../utils/password.utils";
import { JwtUtils } from "../utils/jwt.utils";
import {
  generateOTP,
  hashOTP,
  verifyOTP,
  generateExpiryTime,
  OTPConfig,
} from "../utils/password-reset.utils";
import { sendOTPEmail } from "../utils/nodemailer";
import { IAuthResponse, IJWTPayload, IUserResponse } from "../types/auth.types";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
} from "../middleware/error.middleware";

export const AuthService = {

  login: async (identifier: string, password: string): Promise<IAuthResponse> => {
    let user: any = null;

    // Check if identifier is email (contains '@') - Admin only
    if (identifier.includes("@")) {
      // Admin login with email only
      const emailUser = await UserRepository.findByEmail(identifier);
      if (emailUser && emailUser.role === "admin") {
        user = emailUser;
      }
    } else {
      // Non-email identifier: Try student login with NIM first
      const student = await UserRepository.findStudentByNIM(identifier);
      if (student) {
        user = {
          ...student.user,
          student: student,
        };
      } else {
        // Try lecturer login with NIK (lecturerCode)
        const lecturer = await UserRepository.findLecturerByCode(identifier);
        if (lecturer) {
          user = {
            ...lecturer.user,
            lecturer: lecturer,
          };
        }
      }
    }

    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (user.status !== "active") {
      throw new ForbiddenError("Account is not active");
    }

    const isPasswordValid = await PasswordUtils.comparePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const payload: IJWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      profileId: user.admin?.id || user.lecturer?.id || user.student?.id || 0,
    };

    const token = JwtUtils.generateToken(payload);

    let profile;
    if (user.admin) {
      profile = {
        id: user.admin.id,
        name: user.admin.name,
      };
    } else if (user.lecturer) {
      profile = {
        id: user.lecturer.id,
        name: user.lecturer.name,
        lecturerCode: user.lecturer.lecturerCode,
      };
    } else if (user.student) {
      profile = {
        id: user.student.id,
        name: user.student.name,
        nim: user.student.nim,
      };
    } else {
      throw new UnauthorizedError("Invalid credentials");
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile,
      },
      token,
    };
  },

  // Get user by ID
  getUserById: async (userId: number): Promise<IUserResponse> => {
    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    let profile;
    if (user.admin) {
      profile = {
        id: user.admin.id,
        name: user.admin.name,
      };
    } else if (user.lecturer) {
      profile = {
        id: user.lecturer.id,
        name: user.lecturer.name,
        lecturerCode: user.lecturer.lecturerCode,
      };
    } else if (user.student) {
      profile = {
        id: user.student.id,
        name: user.student.name,
        nim: user.student.nim,
      };
    } else {
      throw new UnauthorizedError("Invalid user profile");
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      profile,
    };
  },

  // Change password
  changePassword: async (
    userId: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> => {
    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isOldPasswordValid = await PasswordUtils.comparePassword(
      oldPassword,
      user.password,
    );

    if (!isOldPasswordValid) {
      throw new UnauthorizedError("Invalid old password");
    }

    const hashedNewPassword = await PasswordUtils.hashPassword(newPassword);

    await UserRepository.updatePassword(userId, hashedNewPassword);
  },

  getUserName: (user: any): string => {
    if (user.admin) return user.admin.name;
    if (user.lecturer) return user.lecturer.name;
    if (user.student) return user.student.name;
    return "Pengguna";
  },

  // Request OTP for password reset
  requestOTP: async (email: string): Promise<void> => {
    const user = await UserRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundError("Email not registered");
    }

    if (user.status !== "active") {
      throw new ForbiddenError("Account is not active");
    }

    await PasswordResetRepository.deleteExpiredByEmail(email);

    const otp = generateOTP();
    const tokenHash = await hashOTP(otp);
    const expiresAt = generateExpiryTime();

    await PasswordResetRepository.deleteByEmail(email);

    await PasswordResetRepository.create({
      userId: user.id,
      tokenHash,
      email,
      expiresAt,
    });

    const name = AuthService.getUserName(user);

    await sendOTPEmail({
      to: email,
      name,
      otp,
      expiryMinutes: OTPConfig.expiryMinutes,
    });
  },

  verifyOTP: async (email: string, otp: string): Promise<{ resetToken: string }> => {
    const user = await UserRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundError("Email not registered");
    }

    await PasswordResetRepository.deleteExpiredByEmail(email);

    const tokenRecord = await PasswordResetRepository.findByEmail(email);

    if (!tokenRecord) {
      throw new BadRequestError(
        "OTP code not found or expired. Please request a new OTP.",
      );
    }

    if (tokenRecord.usedAt) {
      throw new BadRequestError("OTP code already used. Please request a new OTP.");
    }

    if (tokenRecord.attempts >= OTPConfig.maxAttempts) {
      await PasswordResetRepository.deleteByEmail(email);
      throw new BadRequestError(
        "Too many attempts. Please request a new OTP.",
      );
    }

    if (tokenRecord.expiresAt < new Date()) {
      await PasswordResetRepository.deleteByEmail(email);
      throw new BadRequestError("OTP code expired. Please request a new OTP.");
    }

    const isValid = await verifyOTP(tokenRecord.tokenHash, otp);

    if (!isValid) {
      await PasswordResetRepository.incrementAttempts(tokenRecord.id);
      const remainingAttempts = OTPConfig.maxAttempts - tokenRecord.attempts - 1;

      throw new BadRequestError(
        `Invalid OTP code. Remaining attempts: ${remainingAttempts}`,
      );
    }

    await PasswordResetRepository.markAsUsed(tokenRecord.id);

    const resetToken = JwtUtils.generateResetToken(email, user.id);

    return { resetToken };
  },

  resetPassword: async ( email: string, resetToken: string, newPassword: string): Promise<void> => {
    const decoded = JwtUtils.verifyResetToken(resetToken);

    if (!decoded) {
      throw new BadRequestError("Token reset is invalid or expired.");
    }

    if (decoded.email !== email) {
      throw new BadRequestError("Token reset is invalid for this email.");
    }

    const user = await UserRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundError("Email not registered");
    }

    if (user.id !== decoded.userId) {
      throw new BadRequestError("Token reset is invalid.");
    }

    const hashedNewPassword = await PasswordUtils.hashPassword(newPassword);
    await UserRepository.updatePassword(user.id, hashedNewPassword);

    await PasswordResetRepository.deleteAllByUserId(user.id);
  },
};
