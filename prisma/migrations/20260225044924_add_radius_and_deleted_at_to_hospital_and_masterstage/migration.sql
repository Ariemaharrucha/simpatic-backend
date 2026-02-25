-- AlterTable
ALTER TABLE "hospitals" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "radius" INTEGER NOT NULL DEFAULT 150;

-- AlterTable
ALTER TABLE "master_stase" ADD COLUMN     "deleted_at" TIMESTAMP(3);
