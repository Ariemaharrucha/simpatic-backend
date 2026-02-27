/*
  Warnings:

  - A unique constraint covering the columns `[template_id,student_id]` on the table `pces_tests` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "pces_tests_template_id_student_id_key" ON "pces_tests"("template_id", "student_id");
