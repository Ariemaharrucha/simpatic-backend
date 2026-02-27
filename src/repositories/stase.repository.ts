import prisma from "../utils/prisma";
import { IStaseListQuery, ICreateStaseDTO, IUpdateStaseDTO } from "../types/stase.types";

export const StaseRepository = {
  create: async (data: ICreateStaseDTO) => {
    return await prisma.masterStase.create({
      data: {
        name: data.name,
        defaultHospitalId: data.defaultHospitalId || null,
        templateFolder: data.templateFolder || "stase-default",
        hasLogbook: data.hasLogbook ?? true,
        hasPortfolio: data.hasPortfolio ?? true,
        hasDopExam: data.hasDopExam ?? true,
        hasOslar: data.hasOslar ?? true,
        hasCaseReport: data.hasCaseReport ?? true,
        hasAttitude: data.hasAttitude ?? true,
      },
    });
  },

  findById: async (id: number, includeDeleted: boolean = false) => {
    return await prisma.masterStase.findUnique({
      where: includeDeleted ? { id } : { id, deletedAt: null },
    });
  },

  findAll: async (query: IStaseListQuery) => {
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

    const [stases, total] = await Promise.all([
      prisma.masterStase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          defaultHospital: true,
        },
      }),
      prisma.masterStase.count({ where }),
    ]);

    return { stases, total };
  },

  update: async (id: number, data: IUpdateStaseDTO) => {
    return await prisma.masterStase.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.defaultHospitalId !== undefined && { defaultHospitalId: data.defaultHospitalId }),
        ...(data.templateFolder !== undefined && { templateFolder: data.templateFolder }),
        ...(data.hasLogbook !== undefined && { hasLogbook: data.hasLogbook }),
        ...(data.hasPortfolio !== undefined && { hasPortfolio: data.hasPortfolio }),
        ...(data.hasDopExam !== undefined && { hasDopExam: data.hasDopExam }),
        ...(data.hasOslar !== undefined && { hasOslar: data.hasOslar }),
        ...(data.hasCaseReport !== undefined && { hasCaseReport: data.hasCaseReport }),
        ...(data.hasAttitude !== undefined && { hasAttitude: data.hasAttitude }),
      },
    });
  },

  softDelete: async (id: number) => {
    return await prisma.masterStase.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  restore: async (id: number) => {
    return await prisma.masterStase.update({
      where: { id },
      data: { deletedAt: null },
    });
  },

  count: async (search?: string) => {
    return await prisma.masterStase.count({
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
    return await prisma.masterStase.findFirst({
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

  findByTemplateFolder: async (templateFolder: string, excludeId?: number) => {
    return await prisma.masterStase.findFirst({
      where: {
        templateFolder: {
          equals: templateFolder,
          mode: "insensitive" as const,
        },
        ...(excludeId && { id: { not: excludeId } }),
        deletedAt: null,
      },
    });
  },
};
