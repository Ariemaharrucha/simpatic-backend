/*
  Warnings:

  - Added the required column `course_id` to the `pces_test_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `class_id` to the `pces_tests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `course_id` to the `pces_tests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pces_test_templates" ADD COLUMN     "course_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "pces_tests" ADD COLUMN     "class_id" INTEGER NOT NULL,
ADD COLUMN     "course_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "pces_test_templates" ADD CONSTRAINT "pces_test_templates_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pces_tests" ADD CONSTRAINT "pces_tests_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pces_tests" ADD CONSTRAINT "pces_tests_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
