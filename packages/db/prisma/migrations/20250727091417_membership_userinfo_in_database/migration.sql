-- CreateEnum
CREATE TYPE "membership_type" AS ENUM ('BACHELOR_STUDENT', 'MASTER_STUDENT', 'PHD_STUDENT', 'KNIGHT', 'SOCIAL_MEMBER');

-- AlterTable
ALTER TABLE "ow_user" ADD COLUMN     "biography" TEXT,
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dietaryRestrictions" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "flags" TEXT[],
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "ntnuUsername" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "membership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "membership_type" NOT NULL,
    "start" TIMESTAMPTZ(3) NOT NULL,
    "end" TIMESTAMPTZ(3),

    CONSTRAINT "membership_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "membership" ADD CONSTRAINT "membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ow_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
