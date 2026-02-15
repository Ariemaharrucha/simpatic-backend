import { UserRepository } from "../repositories/user.repository";
import { PasswordUtils } from "../utils/password.utils";
import { sendAccountCredentialsEmail } from "../utils/nodemailer";
import { UserRole } from "../types/user.types";
import { ValidationError, NotFoundError } from "../middleware/error.middleware";

export const AdminService = {
  // Generate random password
  generateRandomPassword: (): string => {
    const length = 10;
    const charset =
"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  },

  // Register new student
  registerStudent: async (data: { nim: string; name: string; email: string; }) => {
    const emailExists = await UserRepository.isEmailExists(data.email);
    if (emailExists) {
      throw new ValidationError("Email already registered");
    }

    const nimExists = await UserRepository.isNIMExists(data.nim);
    if (nimExists) {
      throw new ValidationError("NIM already registered");
    }

    const plainPassword = AdminService.generateRandomPassword();
    const hashedPassword = await PasswordUtils.hashPassword(plainPassword);

    // Create student with user
    const { user, student } = await UserRepository.createStudent({
      email: data.email,
      password: hashedPassword,
      nim: data.nim,
      name: data.name,
    });

    // Send email with credentials
    let emailSent = true;
    let emailError: string | null = null;
    try {
      await sendAccountCredentialsEmail({
        to: data.email,
        name: data.name,
        email: data.email,
        password: plainPassword,
        role: "Mahasiswa",
        identifier: data.nim,
      });
    } catch (error) {
      emailSent = false;
      emailError = error instanceof Error ? error.message : "Unknown email error";
      console.error("Failed to send email to student:", error);
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      student: {
        id: student.id,
        nim: student.nim,
        name: student.name,
      },
      credentials: {
        email: data.email,
        password: emailSent ? undefined : plainPassword,
        emailSent,
        emailError,
        message: emailSent
          ? "User created and credentials sent to email."
          : "User created but email failed. Password shown above - deliver manually.",
      },
    };
  },

  // Register new lecturer
  registerLecturer: async (data: {lecturerCode: string; name: string; email: string; }) => {
    const emailExists = await UserRepository.isEmailExists(data.email);
    if (emailExists) {
      throw new ValidationError("Email already registered");
    }

    const codeExists = await UserRepository.isLecturerCodeExists(
      data.lecturerCode,
    );
    if (codeExists) {
      throw new ValidationError("Lecturer code already registered");
    }

    const plainPassword = AdminService.generateRandomPassword();
    const hashedPassword = await PasswordUtils.hashPassword(plainPassword);

    // Create lecturer with user
    const { user, lecturer } = await UserRepository.createLecturer({
      email: data.email,
      password: hashedPassword,
      lecturerCode: data.lecturerCode,
      name: data.name,
    });

    // Send email with credentials
    let emailSent = true;
    let emailError: string | null = null;
    try {
      await sendAccountCredentialsEmail({
        to: data.email,
        name: data.name,
        email: data.email,
        password: plainPassword,
        role: "Dosen",
        identifier: data.lecturerCode,
      });
    } catch (error) {
      emailSent = false;
      emailError = error instanceof Error ? error.message : "Unknown email error";
      console.error("Failed to send email to lecturer:", error);
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      lecturer: {
        id: lecturer.id,
        lecturerCode: lecturer.lecturerCode,
        name: lecturer.name,
      },
      credentials: {
        email: data.email,
        password: emailSent ? undefined : plainPassword,
        emailSent,
        emailError,
        message: emailSent
          ? "User created and credentials sent to email."
          : "User created but email failed. Password shown above - deliver manually.",
      },
    };
  },

  // Register new admin
  registerAdmin: async (data: { name: string; email: string }) => {
    const emailExists = await UserRepository.isEmailExists(data.email);
    if (emailExists) {
      throw new ValidationError("Email already registered");
    }

    const plainPassword = AdminService.generateRandomPassword();
    const hashedPassword = await PasswordUtils.hashPassword(plainPassword);

    // Create admin with user
    const { user, admin } = await UserRepository.createAdmin({
      email: data.email,
      password: hashedPassword,
      name: data.name,
    });

    // Send email with credentials
    let emailSent = true;
    let emailError: string | null = null;
    try {
      await sendAccountCredentialsEmail({
        to: data.email,
        name: data.name,
        email: data.email,
        password: plainPassword,
        role: "Admin",
      });
    } catch (error) {
      emailSent = false;
      emailError = error instanceof Error ? error.message : "Unknown email error";
      console.error("Failed to send email to admin:", error);
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      admin: {
        id: admin.id,
        name: admin.name,
      },
      credentials: {
        email: data.email,
        password: emailSent ? undefined : plainPassword,
        emailSent,
        emailError,
        message: emailSent
          ? "User created and credentials sent to email."
          : "User created but email failed. Password shown above - deliver manually.",
      },
    };
  },

  // Get all students
  getAllStudents: async (page: number = 1, limit: number = 10) => {
    return await UserRepository.findAllStudents(page, limit);
  },

  // Get all lecturers
  getAllLecturers: async (page: number = 1, limit: number = 10) => {
    return await UserRepository.findAllLecturers(page, limit);
  },

  // Get all admins
  getAllAdmins: async (page: number = 1, limit: number = 10) => {
    return await UserRepository.findAllAdmins(page, limit);
  },

  // Resend credentials to user (generate new password)
  resendCredentials: async (userId: number) => {
    // Find user by ID with profile info
    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Get profile info based on role
    let name: string;
    let identifier: string | undefined;
    let roleName: string;

    if (user.student) {
      name = user.student.name;
      identifier = user.student.nim;
      roleName = "Mahasiswa";
    } else if (user.lecturer) {
      name = user.lecturer.name;
      identifier = user.lecturer.lecturerCode;
      roleName = "Dosen";
    } else if (user.admin) {
      name = user.admin.name;
      roleName = "Admin";
    } else {
      throw new NotFoundError("User profile not found");
    }

    // Generate new password
    const plainPassword = AdminService.generateRandomPassword();
    const hashedPassword = await PasswordUtils.hashPassword(plainPassword);

    // Update password in database
    await UserRepository.updatePassword(userId, hashedPassword);

    // Send email with new credentials
    let emailSent = true;
    let emailError: string | null = null;
    try {
      await sendAccountCredentialsEmail({
        to: user.email,
        name,
        email: user.email,
        password: plainPassword,
        role: roleName,
        identifier,
      });
    } catch (error) {
      emailSent = false;
      emailError = error instanceof Error ? error.message : "Unknown email error";
      console.error("Failed to resend email:", error);
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      credentials: {
        email: user.email,
        password: emailSent ? undefined : plainPassword,
        emailSent,
        emailError,
        message: emailSent
          ? "New credentials sent to email successfully."
          : "Email failed. New password shown above - deliver manually.",
      },
    };
  },
};
