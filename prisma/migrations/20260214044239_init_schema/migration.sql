-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'lecturer', 'student');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive', 'suspended');

-- CreateEnum
CREATE TYPE "assessment_component" AS ENUM ('logbook', 'portfolio_seminar', 'dop_exam', 'oslar_responsi', 'case_report');

-- CreateEnum
CREATE TYPE "stase_status" AS ENUM ('scheduled', 'active', 'completed');

-- CreateEnum
CREATE TYPE "question_type" AS ENUM ('multiple_choice', 'essay');

-- CreateEnum
CREATE TYPE "attendance_status" AS ENUM ('present', 'absent', 'late', 'excused');

-- CreateEnum
CREATE TYPE "document_type" AS ENUM ('logbook', 'portfolio_seminar', 'case_report');

-- CreateEnum
CREATE TYPE "attitude_category" AS ENUM ('A', 'B', 'C');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lecturers" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "lecturer_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lecturers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "nim" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pre_clinical_passed" BOOLEAN NOT NULL DEFAULT false,
    "pre_clinical_score" DECIMAL(5,2),
    "clinical_score" DECIMAL(5,2),
    "final_score" DECIMAL(5,2),
    "final_score_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospitals" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_stase" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "default_hospital_id" INTEGER,
    "template_folder" TEXT NOT NULL DEFAULT 'stase-default',
    "has_logbook" BOOLEAN NOT NULL DEFAULT true,
    "has_portfolio" BOOLEAN NOT NULL DEFAULT true,
    "has_dop_exam" BOOLEAN NOT NULL DEFAULT true,
    "has_oslar" BOOLEAN NOT NULL DEFAULT true,
    "has_case_report" BOOLEAN NOT NULL DEFAULT true,
    "has_attitude" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_stase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lecturer_courses" (
    "id" SERIAL NOT NULL,
    "lecturer_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lecturer_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_students" (
    "id" SERIAL NOT NULL,
    "class_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_stase_schedules" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "stase_id" INTEGER NOT NULL,
    "hospital_id" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "stase_status" NOT NULL DEFAULT 'scheduled',
    "total_score" DECIMAL(5,2),
    "is_graded" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_stase_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "class_id" INTEGER NOT NULL,
    "lecturer_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" SERIAL NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "question_type" "question_type" NOT NULL,
    "question_text" TEXT NOT NULL,
    "option_a" TEXT,
    "option_b" TEXT,
    "option_c" TEXT,
    "option_d" TEXT,
    "correct_answer" TEXT,
    "points" DECIMAL(5,2) NOT NULL DEFAULT 1,
    "order_number" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_submissions" (
    "id" SERIAL NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" DECIMAL(5,2),
    "is_graded" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "quiz_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_answers" (
    "id" SERIAL NOT NULL,
    "submission_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "answer_text" TEXT,
    "is_correct" BOOLEAN,
    "points_earned" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pces_test_templates" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pces_test_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pces_sop_items" (
    "id" SERIAL NOT NULL,
    "template_id" INTEGER NOT NULL,
    "sop_description" TEXT NOT NULL,
    "order_number" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pces_sop_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pces_tests" (
    "id" SERIAL NOT NULL,
    "template_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "lecturer_id" INTEGER NOT NULL,
    "test_date" DATE NOT NULL,
    "total_score" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pces_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pces_scores" (
    "id" SERIAL NOT NULL,
    "test_id" INTEGER NOT NULL,
    "sop_item_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pces_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "stase_schedule_id" INTEGER NOT NULL,
    "attendance_date" DATE NOT NULL,
    "attendance_time" TIME NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "status" "attendance_status" NOT NULL DEFAULT 'present',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_documents" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "stase_schedule_id" INTEGER NOT NULL,
    "document_type" "document_type" NOT NULL,
    "week_number" INTEGER,
    "drive_link" TEXT NOT NULL,
    "upload_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logbook_scores" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "stase_schedule_id" INTEGER NOT NULL,
    "week_number" INTEGER NOT NULL,
    "graded_by" INTEGER NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "feedback" TEXT,
    "pdf_url" TEXT,
    "graded_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logbook_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "component_scores" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "stase_schedule_id" INTEGER NOT NULL,
    "component" "assessment_component" NOT NULL,
    "graded_by" INTEGER NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "feedback" TEXT,
    "pdf_url" TEXT,
    "graded_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "component_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attitude_scores" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "stase_schedule_id" INTEGER NOT NULL,
    "graded_by" INTEGER NOT NULL,
    "sikap_category" "attitude_category" NOT NULL,
    "sikap_score" DECIMAL(5,2) NOT NULL,
    "attitude_notes" TEXT,
    "graded_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attitude_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "table_name" TEXT NOT NULL,
    "record_id" INTEGER NOT NULL,
    "old_data" JSONB,
    "new_data" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_user_id_key" ON "admins"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "lecturers_user_id_key" ON "lecturers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "lecturers_lecturer_code_key" ON "lecturers"("lecturer_code");

-- CreateIndex
CREATE UNIQUE INDEX "students_user_id_key" ON "students"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_nim_key" ON "students"("nim");

-- CreateIndex
CREATE UNIQUE INDEX "courses_code_key" ON "courses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "lecturer_courses_lecturer_id_course_id_key" ON "lecturer_courses"("lecturer_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "class_students_class_id_student_id_key" ON "class_students"("class_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_submissions_quiz_id_student_id_key" ON "quiz_submissions"("quiz_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_student_id_stase_schedule_id_attendance_date_key" ON "attendances"("student_id", "stase_schedule_id", "attendance_date");

-- CreateIndex
CREATE UNIQUE INDEX "logbook_scores_stase_schedule_id_week_number_key" ON "logbook_scores"("stase_schedule_id", "week_number");

-- CreateIndex
CREATE UNIQUE INDEX "component_scores_stase_schedule_id_component_key" ON "component_scores"("stase_schedule_id", "component");

-- CreateIndex
CREATE UNIQUE INDEX "attitude_scores_stase_schedule_id_key" ON "attitude_scores"("stase_schedule_id");

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturers" ADD CONSTRAINT "lecturers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_stase" ADD CONSTRAINT "master_stase_default_hospital_id_fkey" FOREIGN KEY ("default_hospital_id") REFERENCES "hospitals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturer_courses" ADD CONSTRAINT "lecturer_courses_lecturer_id_fkey" FOREIGN KEY ("lecturer_id") REFERENCES "lecturers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturer_courses" ADD CONSTRAINT "lecturer_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_students" ADD CONSTRAINT "class_students_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_students" ADD CONSTRAINT "class_students_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_stase_schedules" ADD CONSTRAINT "student_stase_schedules_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_stase_schedules" ADD CONSTRAINT "student_stase_schedules_stase_id_fkey" FOREIGN KEY ("stase_id") REFERENCES "master_stase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_stase_schedules" ADD CONSTRAINT "student_stase_schedules_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_lecturer_id_fkey" FOREIGN KEY ("lecturer_id") REFERENCES "lecturers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_submissions" ADD CONSTRAINT "quiz_submissions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_submissions" ADD CONSTRAINT "quiz_submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "quiz_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pces_sop_items" ADD CONSTRAINT "pces_sop_items_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "pces_test_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pces_tests" ADD CONSTRAINT "pces_tests_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "pces_test_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pces_tests" ADD CONSTRAINT "pces_tests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pces_tests" ADD CONSTRAINT "pces_tests_lecturer_id_fkey" FOREIGN KEY ("lecturer_id") REFERENCES "lecturers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pces_scores" ADD CONSTRAINT "pces_scores_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "pces_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pces_scores" ADD CONSTRAINT "pces_scores_sop_item_id_fkey" FOREIGN KEY ("sop_item_id") REFERENCES "pces_sop_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_stase_schedule_id_fkey" FOREIGN KEY ("stase_schedule_id") REFERENCES "student_stase_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_documents" ADD CONSTRAINT "student_documents_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_documents" ADD CONSTRAINT "student_documents_stase_schedule_id_fkey" FOREIGN KEY ("stase_schedule_id") REFERENCES "student_stase_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logbook_scores" ADD CONSTRAINT "logbook_scores_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logbook_scores" ADD CONSTRAINT "logbook_scores_stase_schedule_id_fkey" FOREIGN KEY ("stase_schedule_id") REFERENCES "student_stase_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logbook_scores" ADD CONSTRAINT "logbook_scores_graded_by_fkey" FOREIGN KEY ("graded_by") REFERENCES "lecturers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "component_scores" ADD CONSTRAINT "component_scores_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "component_scores" ADD CONSTRAINT "component_scores_stase_schedule_id_fkey" FOREIGN KEY ("stase_schedule_id") REFERENCES "student_stase_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "component_scores" ADD CONSTRAINT "component_scores_graded_by_fkey" FOREIGN KEY ("graded_by") REFERENCES "lecturers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attitude_scores" ADD CONSTRAINT "attitude_scores_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attitude_scores" ADD CONSTRAINT "attitude_scores_stase_schedule_id_fkey" FOREIGN KEY ("stase_schedule_id") REFERENCES "student_stase_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attitude_scores" ADD CONSTRAINT "attitude_scores_graded_by_fkey" FOREIGN KEY ("graded_by") REFERENCES "lecturers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
