-- AlterTable
ALTER TABLE "event" ADD COLUMN     "contest_id" TEXT;

-- CreateTable
CREATE TABLE "fadderuke" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "event_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fadderuke_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fadderuke_year_key" ON "fadderuke"("year");

-- CreateIndex
CREATE UNIQUE INDEX "fadderuke_event_id_key" ON "fadderuke"("event_id");

-- CreateIndex
CREATE INDEX "event_contest_id_idx" ON "event"("contest_id");

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fadderuke" ADD CONSTRAINT "fadderuke_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
