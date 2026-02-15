import { ClassRepository } from "../repositories/class.repository";
import { 
  IClass, 
  ICreateClassRequest, 
  IUpdateClassRequest, 
  IClassWithStudents,
  IAssignStudentRequest,
  IAvailableStudent 
} from "../types/class.types";
import { ValidationError, NotFoundError } from "../middleware/error.middleware";

export const ClassService = {
  // Create new class
  createClass: async (data: ICreateClassRequest): Promise<IClass> => {
    // Validate academic year format (2025/2026)
    const academicYearPattern = /^\d{4}\/\d{4}$/;
    if (!academicYearPattern.test(data.academicYear)) {
      throw new ValidationError("Academic year must be in format YYYY/YYYY (e.g., 2025/2026)");
    }

    // Validate name
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError("Class name is required");
    }

    // Check for duplicate (Approach A: Strict Unique - regardless of status)
    const existingClass = await ClassRepository.findByNameAndAcademicYear(
      data.name.trim(),
      data.academicYear.trim()
    );

    if (existingClass) {
      throw new ValidationError(
        `Class "${data.name}" for academic year ${data.academicYear} already exists`
      );
    }

    return await ClassRepository.create(data);
  },

  // Get all classes
  getAllClasses: async (
    page: number = 1, 
    limit: number = 10,
    academicYear?: string,
    includeInactive: boolean = false
  ): Promise<{ classes: IClass[]; total: number; page: number; limit: number }> => {
    return await ClassRepository.findAll(page, limit, academicYear, includeInactive);
  },

  // Get class by ID
  getClassById: async (id: number): Promise<IClassWithStudents> => {
    const classData = await ClassRepository.findByIdWithStudents(id);
    
    if (!classData) {
      throw new NotFoundError("Class not found");
    }

    return classData;
  },

  // Update class
  updateClass: async (id: number, data: IUpdateClassRequest): Promise<IClass> => {
    // Check if class exists
    const exists = await ClassRepository.exists(id);
    if (!exists) {
      throw new NotFoundError("Class not found");
    }

    // Validate academic year format if provided
    if (data.academicYear) {
      const academicYearPattern = /^\d{4}\/\d{4}$/;
      if (!academicYearPattern.test(data.academicYear)) {
        throw new ValidationError("Academic year must be in format YYYY/YYYY (e.g., 2025/2026)");
      }
    }

    // Validate name if provided
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new ValidationError("Class name cannot be empty");
    }

    return await ClassRepository.update(id, data);
  },

  // Soft delete class
  deleteClass: async (id: number): Promise<IClass> => {
    // Check if class exists
    const exists = await ClassRepository.exists(id);
    if (!exists) {
      throw new NotFoundError("Class not found");
    }

    return await ClassRepository.softDelete(id);
  },

  // Restore soft deleted class
  restoreClass: async (id: number): Promise<IClass> => {
    // Check if class exists
    const exists = await ClassRepository.exists(id);
    if (!exists) {
      throw new NotFoundError("Class not found");
    }

    return await ClassRepository.restore(id);
  },

  // Assign student to class
  assignStudent: async (classId: number, data: IAssignStudentRequest): Promise<any> => {
    const { studentId } = data;

    // Check if class exists and is active
    const classData = await ClassRepository.findById(classId);
    if (!classData) {
      throw new NotFoundError("Class not found");
    }

    if (classData.status !== "active" || classData.deletedAt) {
      throw new ValidationError("Cannot assign student to inactive or deleted class");
    }

    // Check if student already in this class
    const isAlreadyInClass = await ClassRepository.isStudentInClass(classId, studentId);
    if (isAlreadyInClass) {
      throw new ValidationError("Student is already assigned to this class");
    }

    // Check if student already assigned to any class in this academic year
    const academicYear = classData.academicYear;
    const existingClass = await ClassRepository.findStudentClassByAcademicYear(
      studentId,
      academicYear
    );

    if (existingClass) {
      throw new ValidationError(
        `Student is already assigned to class "${existingClass.class.name}" in academic year ${academicYear}`
      );
    }

    // Assign student
    return await ClassRepository.assignStudent(classId, studentId);
  },

  // Remove student from class
  removeStudent: async (classId: number, studentId: number): Promise<void> => {
    // Check if class exists
    const exists = await ClassRepository.exists(classId);
    if (!exists) {
      throw new NotFoundError("Class not found");
    }

    // Check if student is in class
    const isInClass = await ClassRepository.isStudentInClass(classId, studentId);
    if (!isInClass) {
      throw new ValidationError("Student is not assigned to this class");
    }

    await ClassRepository.removeStudent(classId, studentId);
  },

  // Get students in class
  getStudents: async (classId: number): Promise<any[]> => {
    // Check if class exists
    const exists = await ClassRepository.exists(classId);
    if (!exists) {
      throw new NotFoundError("Class not found");
    }

    return await ClassRepository.getStudents(classId);
  },

  // Get available students (not assigned to any class in academic year)
  getAvailableStudents: async (
    academicYear: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ students: IAvailableStudent[]; total: number; page: number; limit: number }> => {
    // Validate academic year format
    const academicYearPattern = /^\d{4}\/\d{4}$/;
    if (!academicYearPattern.test(academicYear)) {
      throw new ValidationError("Academic year must be in format YYYY/YYYY (e.g., 2025/2026)");
    }

    return await ClassRepository.getAvailableStudents(academicYear, page, limit);
  },
};
