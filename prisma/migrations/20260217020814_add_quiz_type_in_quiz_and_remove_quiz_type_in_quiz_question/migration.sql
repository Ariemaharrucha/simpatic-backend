/*
  Warnings:

  - You are about to drop the column `question_type` on the `quiz_questions` table. All the data in the column will be lost.
  - Added the required column `quiz_type` to the `quizzes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "quiz_questions" DROP COLUMN "question_type";

-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "quiz_type" "question_type" NOT NULL;
