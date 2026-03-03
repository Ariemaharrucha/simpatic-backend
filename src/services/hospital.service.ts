import {
  ICreateHospitalDTO,
  IUpdateHospitalDTO,
  IHospitalResponse,
  IHospitalListQuery,
  IPaginationResponse,
} from "../types/hospital.types";
import { HospitalRepository } from "../repositories/hospital.repository";
import { ValidationError, NotFoundError, BadRequestError } from "../middleware/error.middleware";
import { Prisma } from "../generated/prisma/client";

const mapToHospitalResponse = (hospital: {
  id: number;
  name: string;
  latitude: Prisma.Decimal;
  longitude: Prisma.Decimal;
  radius: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}): IHospitalResponse => {
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

export const HospitalService = {
  create: async (data: ICreateHospitalDTO): Promise<IHospitalResponse> => {
    const existingHospital = await HospitalRepository.findByName(data.name);
    if (existingHospital) {
      throw new ValidationError("Hospital with this name already exists");
    }

    const hospital = await HospitalRepository.create(data);
    return mapToHospitalResponse(hospital);
  },

  getById: async (id: number, includeDeleted: boolean = false): Promise<IHospitalResponse | null> => {
    const hospital = await HospitalRepository.findById(id, includeDeleted);
    if (!hospital) {
      return null;
    }
    return mapToHospitalResponse(hospital);
  },

  getAll: async (query: IHospitalListQuery): Promise<{
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

  update: async (id: number, data: IUpdateHospitalDTO): Promise<IHospitalResponse> => {
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

  delete: async (id: number): Promise<void> => {
    const hospital = await HospitalRepository.findById(id);
    if (!hospital) {
      throw new NotFoundError("Hospital not found");
    }

    if (hospital.deletedAt) {
      throw new BadRequestError("Hospital is already deleted");
    }

    await HospitalRepository.softDelete(id);
  },

  restore: async (id: number): Promise<IHospitalResponse> => {
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

  validateExists: async (id: number): Promise<{
    id: number;
    name: string;
    latitude: Prisma.Decimal;
    longitude: Prisma.Decimal;
    radius: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }> => {
    const hospital = await HospitalRepository.findById(id);
    if (!hospital) {
      throw new NotFoundError("Hospital not found");
    }
    return hospital;
  },
};
