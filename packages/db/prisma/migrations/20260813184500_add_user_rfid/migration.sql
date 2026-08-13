-- AlterTable
ALTER TABLE "ow_user" ADD COLUMN "user_rfid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ow_user_user_rfid_key" ON "ow_user"("user_rfid");

-- CreateIndex
CREATE INDEX "idx_office_checkin_user_rfid" ON "OfficeCheckin"("user_rfid");
