-- CreateTable
CREATE TABLE "credit_reduction" (
    "reduction_amount" DOUBLE PRECISION NOT NULL,
    "course_id" TEXT NOT NULL,
    "overlap_course_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_reduction_pkey" PRIMARY KEY ("course_id","overlap_course_id")
);

-- AddForeignKey
ALTER TABLE "credit_reduction" ADD CONSTRAINT "credit_reduction_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_reduction" ADD CONSTRAINT "credit_reduction_overlap_course_id_fkey" FOREIGN KEY ("overlap_course_id") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
