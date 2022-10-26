-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateTable
CREATE TABLE "Committee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Committee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "image_url" TEXT,
    "location" TEXT,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "public" BOOLEAN NOT NULL,
    "status" "EventStatus" NOT NULL,
    "organizer_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "deregister_deadline" TIMESTAMP(3) NOT NULL,
    "limit" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendee" (
    "id" TEXT NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CompanyEvents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Attendee_attendanceId_event_id_key" ON "Attendee"("attendanceId", "event_id");

-- CreateIndex
CREATE UNIQUE INDEX "_CompanyEvents_AB_unique" ON "_CompanyEvents"("A", "B");

-- CreateIndex
CREATE INDEX "_CompanyEvents_B_index" ON "_CompanyEvents"("B");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "Committee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendee" ADD CONSTRAINT "Attendee_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyEvents" ADD CONSTRAINT "_CompanyEvents_A_fkey" FOREIGN KEY ("A") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyEvents" ADD CONSTRAINT "_CompanyEvents_B_fkey" FOREIGN KEY ("B") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
