-- CreateTable
CREATE TABLE "Offline" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "published" TIMESTAMP(3) NOT NULL,
    "fileUrl" TEXT,
    "imageUrl" TEXT,

    CONSTRAINT "Offline_pkey" PRIMARY KEY ("id")
);
