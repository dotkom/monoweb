/*
  Warnings:

  - You are about to drop the `birthday_party_guess` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "birthday_party_guess" DROP CONSTRAINT "birthday_party_guess_user_id_fkey";

-- DropTable
DROP TABLE "birthday_party_guess";
