import { Request, Response } from "express";
import { ResponseUtils } from "../../utils/response.utils";
import { ClassRepository } from "../../repositories/class.repository";
import { StudentRepository } from "../../repositories/student.repository";
import { PraKlinikCalculationService } from "../../services/pra-klinik-calculation.service";

export interface IStudentPraKlinikStatus {
  id: number;
  nim: string;
  name: string;
  preClinicalPassed: boolean | null;
  quizScore: number | null;
  pcesScore: number | null;
  totalScore: number | null;
  quizCount: number;
  pcesCount: number;
}

export interface IClassPraKlinikStatusResponse {
  classId: number;
  className: string;
  academicYear: string;
  students: IStudentPraKlinikStatus[];
  summary: {
    totalStudents: number;
    passed: number;
    notPassed: number;
    noAssessment: number;
  };
}

export const PraKlinikController = {
  handleGetClassPraKlinikStatus: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string);

      const classId = id;
      if (isNaN(classId)) {
        return ResponseUtils.error(res, "Invalid class ID", 400);
      }

      const classInfo = await ClassRepository.findById(classId);
      if (!classInfo) {
        return ResponseUtils.notFound(res, "Class not found");
      }

      const classStudents = await ClassRepository.getStudents(classId);

      if (classStudents.length === 0) {
        return ResponseUtils.success(res, {
          classId: classInfo.id,
          className: classInfo.name,
          academicYear: classInfo.academicYear,
          students: [],
          summary: {
            totalStudents: 0,
            passed: 0,
            notPassed: 0,
            noAssessment: 0,
          },
        } as IClassPraKlinikStatusResponse);
      }

      const processStudent = async (cs: {
        studentId: number;
        nim: string;
        name: string;
      }): Promise<IStudentPraKlinikStatus> => {
        try {
          const result = await PraKlinikCalculationService.checkPraKlinikPassStatus(cs.studentId);
          return {
            id: cs.studentId,
            nim: cs.nim,
            name: cs.name,
            preClinicalPassed: result.isPassed,
            quizScore: result.quizScore > 0 ? Number(result.quizScore.toFixed(2)) : null,
            pcesScore: result.pcesScore > 0 ? Number(result.pcesScore.toFixed(2)) : null,
            totalScore: result.totalScore > 0 ? Number(result.totalScore.toFixed(2)) : null,
            quizCount: result.quizCount,
            pcesCount: result.pcesCount,
          };
        } catch (error) {
          console.error(`Error processing student ${cs.studentId}:`, error);
          return {
            id: cs.studentId,
            nim: cs.nim,
            name: cs.name,
            preClinicalPassed: null,
            quizScore: null,
            pcesScore: null,
            totalScore: null,
            quizCount: 0,
            pcesCount: 0,
          };
        }
      };

      const studentResults = await Promise.allSettled(
        classStudents.map((cs) => processStudent(cs))
      );

      const studentsWithStatus: IStudentPraKlinikStatus[] = studentResults
        .filter((result): result is PromiseFulfilledResult<IStudentPraKlinikStatus> => result.status === "fulfilled")
        .map((result) => result.value);

      const errors = studentResults.filter((r) => r.status === "rejected");
      if (errors.length > 0) {
        console.warn(`Warning: ${errors.length} students failed to process`);
      }

      const summary = {
        totalStudents: studentsWithStatus.length,
        passed: studentsWithStatus.filter((s) => s.preClinicalPassed === true).length,
        notPassed: studentsWithStatus.filter(
          (s) => s.preClinicalPassed === false && (s.quizCount > 0 || s.pcesCount > 0)
        ).length,
        noAssessment: studentsWithStatus.filter(
          (s) => s.quizCount === 0 && s.pcesCount === 0
        ).length,
      };

      const response: IClassPraKlinikStatusResponse = {
        classId: classInfo.id,
        className: classInfo.name,
        academicYear: classInfo.academicYear,
        students: studentsWithStatus,
        summary,
      };

      return ResponseUtils.success(res, response);
    } catch (error) {
      console.error("Error getting class Pra Klinik status:", error);
      return ResponseUtils.internalError(res, "Failed to get class Pra Klinik status");
    }
  },

  handleGetStudentPraKlinikStatus: async (req: Request, res: Response) => {
    try {
      const studentId = parseInt(req.params.studentId as string);

      const id = studentId;
      if (isNaN(id)) {
        return ResponseUtils.error(res, "Invalid student ID", 400);
      }

      const student = await StudentRepository.findById(id);
      if (!student) {
        return ResponseUtils.notFound(res, "Student not found");
      }

      try {
        await PraKlinikCalculationService.checkPraKlinikPassStatus(id);
      } catch (calcError) {
        console.error(`Error calculating Pra Klinik status for student ${id}:`, calcError);
      }

      const result = await PraKlinikCalculationService.getPraKlinikReport(id);
      const updatedStudent = await StudentRepository.findById(id);

      return ResponseUtils.success(res, {
        student: {
          id: student.id,
          nim: student.nim,
          name: student.name,
          preClinicalPassed: updatedStudent?.preClinicalPassed ?? null,
        },
        quiz: result.quiz,
        pces: result.pces,
        summary: result.summary,
      });
    } catch (error) {
      console.error("Error getting student Pra Klinik status:", error);
      return ResponseUtils.internalError(res, "Failed to get student Pra Klinik status");
    }
  },
};
