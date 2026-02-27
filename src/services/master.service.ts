import {
  ICreateHospitalDTO,
  IUpdateHospitalDTO,
  IHospitalResponse,
  IHospitalListQuery,
  IPaginationResponse,
} from "../types/hospital.types";
import {
  ICreateStaseDTO,
  IUpdateStaseDTO,
  IMasterStaseResponse,
  IStaseListQuery,
} from "../types/stase.types";
import { HospitalRepository } from "../repositories/hospital.repository";
import { StaseRepository } from "../repositories/stase.repository";
import { ValidationError, NotFoundError, BadRequestError } from "../middleware/error.middleware";

const mapToHospitalResponse = (hospital: any): IHospitalResponse => {
  return {
    id: hospital.id,
    name: hospital.name,
    latitude: Number(hospital.latitude),
    longitude: Number(hospital.longitude),
    radius: hospital.radius,
    createdAt: hospital.createdAt,
    updatedAt: hospital.updatedAt,
    deletedAt: hospital.deletedAt,
  };
};

const mapToStaseResponse = (stase: any): IMasterStaseResponse => {
  return {
    id: stase.id,
    name: stase.name,
    defaultHospitalId: stase.defaultHospitalId,
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

export const MasterService = {
  createHospital: async (data: ICreateHospitalDTO): Promise<IHospitalResponse> => {
    const existingHospital = await HospitalRepository.findByName(data.name);
    if (existingHospital) {
      throw new ValidationError("Hospital with this name already exists");
    }

    const hospital = await HospitalRepository.create(data);
    return mapToHospitalResponse(hospital);
  },

  getHospitalById: async (id: number, includeDeleted: boolean = false): Promise<IHospitalResponse | null> => {
    const hospital = await HospitalRepository.findById(id, includeDeleted);
    if (!hospital) {
      return null;
    }
    return mapToHospitalResponse(hospital);
  },

  getAllHospitals: async (query: IHospitalListQuery): Promise<{
    hospitals: IHospitalResponse[];
    pagination: IPaginationResponse;
  }> => {
    const { page = 1, limit = 10 } = query;
    const { hospitals, total } = await HospitalRepository.findAll(query);

    return {
      hospitals: hospitals.map((h) => mapToHospitalResponse(h)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  updateHospital: async (id: number, data: IUpdateHospitalDTO): Promise<IHospitalResponse> => {
    const existingHospital = await HospitalRepository.findById(id);
    if (!existingHospital) {
      throw new NotFoundError("Hospital not found");
    }

    if (data.name && data.name !== existingHospital.name) {
      const duplicate = await HospitalRepository.findByName(data.name, id);
      if (duplicate) {
        throw new ValidationError("Hospital with this name already exists");
      }
    }

    const hospital = await HospitalRepository.update(id, data);
    return mapToHospitalResponse(hospital);
  },

  deleteHospital: async (id: number): Promise<void> => {
    const hospital = await HospitalRepository.findById(id);
    if (!hospital) {
      throw new NotFoundError("Hospital not found");
    }

    if (hospital.deletedAt) {
      throw new BadRequestError("Hospital is already deleted");
    }

    await HospitalRepository.softDelete(id);
  },

  restoreHospital: async (id: number): Promise<IHospitalResponse> => {
    const hospital = await HospitalRepository.findById(id, true);
    if (!hospital) {
      throw new NotFoundError("Hospital not found");
    }

    if (!hospital.deletedAt) {
      throw new BadRequestError("Hospital is not deleted, cannot restore");
    }

    const restored = await HospitalRepository.restore(id);
    return mapToHospitalResponse(restored);
  },

  validateHospitalExists: async (id: number): Promise<any> => {
    const hospital = await HospitalRepository.findById(id);
    if (!hospital) {
      throw new NotFoundError("Hospital not found");
    }
    return hospital;
  },

  createStase: async (data: ICreateStaseDTO): Promise<IMasterStaseResponse> => {
    const existingStase = await StaseRepository.findByName(data.name);
    if (existingStase) {
      throw new ValidationError("Stase with this name already exists");
    }

    if (data.templateFolder) {
      const existingFolder = await StaseRepository.findByTemplateFolder(data.templateFolder);
      if (existingFolder) {
        throw new ValidationError("Template folder already exists");
      }
    }

    const stase = await StaseRepository.create(data);
    return mapToStaseResponse(stase);
  },

  getStaseById: async (id: number, includeDeleted: boolean = false): Promise<IMasterStaseResponse | null> => {
    const stase = await StaseRepository.findById(id, includeDeleted);
    if (!stase) {
      return null;
    }
    return mapToStaseResponse(stase);
  },

  getAllStases: async (query: IStaseListQuery): Promise<{
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

  updateStase: async (id: number, data: IUpdateStaseDTO): Promise<IMasterStaseResponse> => {
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

    if (data.templateFolder && data.templateFolder !== existingStase.templateFolder) {
      const duplicateFolder = await StaseRepository.findByTemplateFolder(data.templateFolder, id);
      if (duplicateFolder) {
        throw new ValidationError("Template folder already exists");
      }
    }

    const stase = await StaseRepository.update(id, data);
    return mapToStaseResponse(stase);
  },

  deleteStase: async (id: number): Promise<void> => {
    const stase = await StaseRepository.findById(id);
    if (!stase) {
      throw new NotFoundError("Stase not found");
    }

    if (stase.deletedAt) {
      throw new BadRequestError("Stase is already deleted");
    }

    await StaseRepository.softDelete(id);
  },

  restoreStase: async (id: number): Promise<IMasterStaseResponse> => {
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

  validateStaseExists: async (id: number): Promise<any> => {
    const stase = await StaseRepository.findById(id);
    if (!stase) {
      throw new NotFoundError("Stase not found");
    }
    return stase;
  },
};
