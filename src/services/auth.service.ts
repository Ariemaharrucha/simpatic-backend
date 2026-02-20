import { UserRepository } from "../repositories/user.repository";
import { PasswordUtils } from "../utils/password.utils";
import { JwtUtils } from "../utils/jwt.utils";
import { IAuthResponse, IJWTPayload, IUserResponse } from "../types/auth.types";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "../middleware/error.middleware";

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
};
