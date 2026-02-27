import prisma from "../utils/prisma";

export const PasswordResetRepository = {
  create: async (data: {
    userId: number;
    tokenHash: string;
    email: string;
    expiresAt: Date;
  }) => {
    return await prisma.passwordResetToken.create({
      data,
    });
  },

  findByEmail: async (email: string) => {
    return await prisma.passwordResetToken.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });
  },

  findById: async (id: number) => {
    return await prisma.passwordResetToken.findUnique({
      where: { id },
    });
  },

  incrementAttempts: async (id: number) => {
    return await prisma.passwordResetToken.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    });
  },

  markAsUsed: async (id: number) => {
    return await prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  },

  deleteByEmail: async (email: string) => {
    return await prisma.passwordResetToken.deleteMany({
      where: { email },
    });
  },

  deleteExpiredByEmail: async (email: string) => {
    return await prisma.passwordResetToken.deleteMany({
      where: {
        email,
        expiresAt: { lt: new Date() },
      },
    });
  },

  deleteExpiredByUserId: async (userId: number) => {
    return await prisma.passwordResetToken.deleteMany({
      where: {
        userId,
        expiresAt: { lt: new Date() },
      },
    });
  },

  deleteAllByUserId: async (userId: number) => {
    return await prisma.passwordResetToken.deleteMany({
      where: { userId },
    });
  },
};
