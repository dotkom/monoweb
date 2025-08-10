-- AlterTable
ALTER TABLE "attendee" ADD COLUMN     "paymentRefundedById" TEXT;

-- AddForeignKey
ALTER TABLE "attendee" ADD CONSTRAINT "attendee_paymentRefundedById_fkey" FOREIGN KEY ("paymentRefundedById") REFERENCES "ow_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
