-- CreateEnum
CREATE TYPE "ClassStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('active', 'inactive');

-- AlterTable
ALTER TABLE "classes" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "status" "ClassStatus" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "status" "CourseStatus" NOT NULL DEFAULT 'active';
