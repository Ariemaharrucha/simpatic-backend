import { UserRepository } from "../repositories/user.repository";
import { PasswordUtils } from "../utils/password.utils";
import { sendAccountCredentialsEmail } from "../utils/nodemailer";
import { UserRole } from "../types/user.types";

export const AdminService = {
  // Generate random password
  generateRandomPassword: (): string => {
    const length = 10;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  },

  // Register new student
  registerStudent: async (data: {
    nim: string;
    name: string;
    email: string;
  }) => {

    const emailExists = await UserRepository.isEmailExists(data.email);
    if (emailExists) {
      throw new Error("Email already registered");
    }

    const nimExists = await UserRepository.isNIMExists(data.nim);
    if (nimExists) {
      throw new Error("NIM already registered");
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
    await sendAccountCredentialsEmail({
      to: data.email,
      name: data.name,
      identifier: data.nim,
      password: plainPassword,
      role: "Mahasiswa",
    });

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
    };
  },

  // Register new lecturer
  registerLecturer: async (data: {
    lecturerCode: string;
    name: string;
    email: string;
  }) => {

    const emailExists = await UserRepository.isEmailExists(data.email);
    if (emailExists) {
      throw new Error("Email already registered");
    }

    const codeExists = await UserRepository.isLecturerCodeExists(data.lecturerCode);
    if (codeExists) {
      throw new Error("Lecturer code already registered");
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
    await sendAccountCredentialsEmail({
      to: data.email,
      name: data.name,
      identifier: data.lecturerCode,
      password: plainPassword,
      role: "Dosen",
    });

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
    };
  },

  // Register new admin
  registerAdmin: async (data: {
    name: string;
    email: string;
  }) => {
    const emailExists = await UserRepository.isEmailExists(data.email);
    if (emailExists) {
      throw new Error("Email already registered");
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
    await sendAccountCredentialsEmail({
      to: data.email,
      name: data.name,
      identifier: data.email,
      password: plainPassword,
      role: "Admin",
    });

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
};
