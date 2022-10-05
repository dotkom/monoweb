-- CreateTable
CREATE TABLE "Mark" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "given_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT NOT NULL,
    "latest_change" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" TEXT NOT NULL,
    "given_to" TEXT[],

    CONSTRAINT "Mark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalMarks" (
    "id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "active_marks" TEXT[],
    "end_date" TIMESTAMP(3) NOT NULL,
    "mark_history" TEXT[],

    CONSTRAINT "PersonalMarks_pkey" PRIMARY KEY ("id")
);
