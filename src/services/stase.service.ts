import {
  ICreateStaseDTO,
  IUpdateStaseDTO,
  IMasterStaseResponse,
  IStaseListQuery,
  IPaginationResponse,
} from "../types/stase.types";
import { StaseRepository } from "../repositories/stase.repository";
import { HospitalRepository } from "../repositories/hospital.repository";
import { ValidationError, NotFoundError, BadRequestError } from "../middleware/error.middleware";

const mapToStaseResponse = (stase: {
  id: number;
  name: string;
  defaultHospitalId: number | null;
  defaultHospital: { id: number; name: string } | null;
  templateFolder: string;
  hasLogbook: boolean;
  hasPortfolio: boolean;
  hasDopExam: boolean;
  hasOslar: boolean;
  hasCaseReport: boolean;
  hasAttitude: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}): IMasterStaseResponse => {
  return {
    id: stase.id,
    name: stase.name,
    defaultHospitalId: stase.defaultHospitalId,
    defaultHospital: stase.defaultHospital
      ? { id: stase.defaultHospital.id, name: stase.defaultHospital.name }
      : null,
    templateFolder: stase.templateFolder,
    hasLogbook: stase.hasLogbook,
    hasPortfolio: stase.hasPortfolio,
    hasDopExam: stase.hasDopExam,
    hasOslar: stase.hasOslar,
    hasCaseReport: stase.hasCaseReport,
    hasAttitude: stase.hasAttitude,
    createdAt: stase.createdAt,
    updatedAt: stase.updatedAt,
    deletedAt: stase.deletedAt,
  };
};

export const StaseService = {
  create: async (data: ICreateStaseDTO): Promise<IMasterStaseResponse> => {
    const existingStase = await StaseRepository.findByName(data.name);
    if (existingStase) {
      throw new ValidationError("Stase with this name already exists");
    }

    if (data.defaultHospitalId) {
      const hospital = await HospitalRepository.findById(data.defaultHospitalId);
      if (!hospital) {
        throw new ValidationError("Hospital not found");
      }
    }

    const stase = await StaseRepository.create(data);
    return mapToStaseResponse(stase);
  },

  getById: async (id: number, includeDeleted: boolean = false): Promise<IMasterStaseResponse | null> => {
    const stase = await StaseRepository.findById(id, includeDeleted);
    if (!stase) {
      return null;
    }
    return mapToStaseResponse(stase);
  },

  getAll: async (query: IStaseListQuery): Promise<{
    stases: IMasterStaseResponse[];
    pagination: IPaginationResponse;
  }> => {
    const { page = 1, limit = 10 } = query;
    const { stases, total } = await StaseRepository.findAll(query);

    return {
      stases: stases.map((s) => mapToStaseResponse(s)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  update: async (id: number, data: IUpdateStaseDTO): Promise<IMasterStaseResponse> => {
    const existingStase = await StaseRepository.findById(id);
    if (!existingStase) {
      throw new NotFoundError("Stase not found");
    }

    if (data.name && data.name !== existingStase.name) {
      const duplicate = await StaseRepository.findByName(data.name, id);
      if (duplicate) {
        throw new ValidationError("Stase with this name already exists");
      }
    }

    const stase = await StaseRepository.update(id, data);
    return mapToStaseResponse(stase);
  },

  delete: async (id: number): Promise<void> => {
    const stase = await StaseRepository.findById(id);
    if (!stase) {
      throw new NotFoundError("Stase not found");
    }

    if (stase.deletedAt) {
      throw new BadRequestError("Stase is already deleted");
    }

    await StaseRepository.softDelete(id);
  },

  restore: async (id: number): Promise<IMasterStaseResponse> => {
    const stase = await StaseRepository.findById(id, true);
    if (!stase) {
      throw new NotFoundError("Stase not found");
    }

    if (!stase.deletedAt) {
      throw new BadRequestError("Stase is not deleted, cannot restore");
    }

    const restored = await StaseRepository.restore(id);
    return mapToStaseResponse(restored);
  },

  validateExists: async (id: number): Promise<{
    id: number;
    name: string;
    defaultHospitalId: number | null;
    templateFolder: string;
    hasLogbook: boolean;
    hasPortfolio: boolean;
    hasDopExam: boolean;
    hasOslar: boolean;
    hasCaseReport: boolean;
    hasAttitude: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }> => {
    const stase = await StaseRepository.findById(id);
    if (!stase) {
      throw new NotFoundError("Stase not found");
    }
    return stase;
  },
};
