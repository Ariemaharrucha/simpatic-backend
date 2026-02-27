import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import argon2 from "argon2";

dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const ADMIN_EMAIL = "Admin@gmail.com";
const ADMIN_PASSWORD = "Admin123!";
const ADMIN_NAME = "Administrator";

async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

async function main() {
  console.log("Starting seed...");
  console.log("Checking if admin already exists...");

  const existingUser = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existingUser) {
    console.log("Admin already exists, skipping seed.");
    console.log(`Email: ${ADMIN_EMAIL}`);
    return;
  }

  console.log("Creating admin account...");

  const hashedPassword = await hashPassword(ADMIN_PASSWORD);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
        status: "active",
      },
    });

    const admin = await tx.admin.create({
      data: {
        userId: user.id,
        name: ADMIN_NAME,
      },
    });

    return { user, admin };
  });

  console.log("\n========================================");
  console.log("Admin created successfully!");
  console.log("========================================");
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  console.log(`Name: ${ADMIN_NAME}`);
  console.log("========================================");
  console.log("Please change the password after first login!");
  console.log("========================================\n");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
