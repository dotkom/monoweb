-- CreateEnum
CREATE TYPE "gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNKNOWN');

-- AlterTable
ALTER TABLE "ow_user"
ALTER COLUMN "gender" DROP DEFAULT,
ALTER COLUMN "gender" TYPE "gender"
USING (
  CASE
    WHEN "gender" IS NULL THEN 'UNKNOWN'::"gender"
    WHEN "gender" = 'Mann' THEN 'MALE'::"gender"
    WHEN "gender" = 'Kvinne' THEN 'FEMALE'::"gender"
    WHEN "gender" = 'Annet' THEN 'OTHER'::"gender"
    WHEN "gender" = 'Ikke oppgitt' THEN 'UNKNOWN'::"gender"
    ELSE 'UNKNOWN'::"gender"
  END
),
ALTER COLUMN "gender" SET NOT NULL,
ALTER COLUMN "gender" SET DEFAULT 'UNKNOWN'::"gender";
