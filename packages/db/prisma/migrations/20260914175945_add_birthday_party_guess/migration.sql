-- CreateTable
CREATE TABLE "birthday_party_guess" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guess" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "birthday_party_guess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "birthday_party_guess_user_id_key" ON "birthday_party_guess"("user_id");

-- AddForeignKey
ALTER TABLE "birthday_party_guess" ADD CONSTRAINT "birthday_party_guess_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ow_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
