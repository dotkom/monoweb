-- CreateTable
CREATE TABLE "feedback_form" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "questions" JSONB NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "feedback_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_form_answer" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "answers" JSONB NOT NULL,
    "attendeeId" TEXT NOT NULL,

    CONSTRAINT "feedback_form_answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "feedback_form_eventId_key" ON "feedback_form"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_form_answer_attendeeId_key" ON "feedback_form_answer"("attendeeId");

-- AddForeignKey
ALTER TABLE "feedback_form" ADD CONSTRAINT "feedback_form_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_form_answer" ADD CONSTRAINT "feedback_form_answer_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "attendee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
