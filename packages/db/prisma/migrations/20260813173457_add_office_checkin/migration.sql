-- CreateTable
CREATE TABLE "OfficeCheckin" (
    "id" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_rfid" TEXT NOT NULL,

    CONSTRAINT "OfficeCheckin_pkey" PRIMARY KEY ("id")
);
