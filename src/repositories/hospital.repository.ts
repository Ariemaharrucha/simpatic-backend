import prisma from "../utils/prisma";
import { IHospitalListQuery, ICreateHospitalDTO, IUpdateHospitalDTO } from "../types/hospital.types";

export const HospitalRepository = {
  create: async (data: ICreateHospitalDTO) => {
    return await prisma.hospital.create({
      data: {
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        radius: data.radius || 150,
      },
    });
  },

  findById: async (id: number, includeDeleted: boolean = false) => {
    return await prisma.hospital.findUnique({
      where: includeDeleted ? { id } : { id, deletedAt: null },
    });
  },

  findAll: async (query: IHospitalListQuery) => {
    const { page = 1, limit = 10, search = "", includeDeleted = false } = query;
    const skip = (page - 1) * limit;

    const where = includeDeleted
      ? {
          OR: [{ deletedAt: null }, { deletedAt: { not: null } }],
          ...(search && {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          }),
        }
      : {
          deletedAt: null,
          ...(search && {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          }),
        };

    const [hospitals, total] = await Promise.all([
      prisma.hospital.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.hospital.count({ where }),
    ]);

    return { hospitals, total };
  },

  update: async (id: number, data: IUpdateHospitalDTO) => {
    return await prisma.hospital.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.latitude !== undefined && { latitude: data.latitude }),
        ...(data.longitude !== undefined && { longitude: data.longitude }),
        ...(data.radius !== undefined && { radius: data.radius }),
      },
    });
  },

  softDelete: async (id: number) => {
    return await prisma.hospital.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  restore: async (id: number) => {
    return await prisma.hospital.update({
      where: { id },
      data: { deletedAt: null },
    });
  },

  count: async (search?: string) => {
    return await prisma.hospital.count({
      where: {
        deletedAt: null,
        ...(search && {
          name: {
            contains: search,
            mode: "insensitive" as const,
          },
        }),
      },
    });
  },

  findByName: async (name: string, excludeId?: number) => {
    return await prisma.hospital.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive" as const,
        },
        ...(excludeId && { id: { not: excludeId } }),
        deletedAt: null,
      },
    });
  },
};
