-- CreateEnum
CREATE TYPE "deregister_reason_type" AS ENUM ('SCHOOL', 'WORK', 'ECONOMY', 'TIME', 'SICK', 'NO_FAMILIAR_FACES', 'OTHER');

-- CreateTable
CREATE TABLE "deregister_reason" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registeredAt" TIMESTAMPTZ(3) NOT NULL,
    "type" "deregister_reason_type" NOT NULL,
    "details" TEXT,
    "userGrade" INTEGER,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "deregister_reason_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "deregister_reason" ADD CONSTRAINT "deregister_reason_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ow_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deregister_reason" ADD CONSTRAINT "deregister_reason_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
