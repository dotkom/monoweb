-- CreateEnum
CREATE TYPE "feedback_question_type" AS ENUM ('TEXT', 'LONGTEXT', 'RATING', 'CHECKBOX', 'SELECT', 'MULTISELECT');

-- CreateTable
CREATE TABLE "feedback_form" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "eventId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "feedback_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_question" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "feedbackFormId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "type" "feedback_question_type" NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "feedback_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_question_option" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "feedback_question_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_question_answer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "formAnswerId" TEXT NOT NULL,
    "value" JSONB,

    CONSTRAINT "feedback_question_answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_answer_option_link" (
    "feedbackQuestionOptionId" TEXT NOT NULL,
    "feedbackQuestionAnswerId" TEXT NOT NULL,

    CONSTRAINT "feedback_answer_option_link_pkey" PRIMARY KEY ("feedbackQuestionOptionId","feedbackQuestionAnswerId")
);

-- CreateTable
CREATE TABLE "feedback_form_answer" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "feedbackFormId" TEXT NOT NULL,
    "attendeeId" TEXT NOT NULL,

    CONSTRAINT "feedback_form_answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "feedback_form_eventId_key" ON "feedback_form"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_question_option_questionId_name_key" ON "feedback_question_option"("questionId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_form_answer_attendeeId_key" ON "feedback_form_answer"("attendeeId");

-- AddForeignKey
ALTER TABLE "feedback_form" ADD CONSTRAINT "feedback_form_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_question" ADD CONSTRAINT "feedback_question_feedbackFormId_fkey" FOREIGN KEY ("feedbackFormId") REFERENCES "feedback_form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_question_option" ADD CONSTRAINT "feedback_question_option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "feedback_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_question_answer" ADD CONSTRAINT "feedback_question_answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "feedback_question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_question_answer" ADD CONSTRAINT "feedback_question_answer_formAnswerId_fkey" FOREIGN KEY ("formAnswerId") REFERENCES "feedback_form_answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_answer_option_link" ADD CONSTRAINT "feedback_answer_option_link_feedbackQuestionOptionId_fkey" FOREIGN KEY ("feedbackQuestionOptionId") REFERENCES "feedback_question_option"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_answer_option_link" ADD CONSTRAINT "feedback_answer_option_link_feedbackQuestionAnswerId_fkey" FOREIGN KEY ("feedbackQuestionAnswerId") REFERENCES "feedback_question_answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_form_answer" ADD CONSTRAINT "feedback_form_answer_feedbackFormId_fkey" FOREIGN KEY ("feedbackFormId") REFERENCES "feedback_form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_form_answer" ADD CONSTRAINT "feedback_form_answer_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "attendee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
