-- CreateEnum
CREATE TYPE "GroupRecruitmentMethod" AS ENUM ('NONE', 'SPRING_APPLICATION', 'AUTUMN_APPLICATION', 'GENERAL_ASSEMBLY', 'NOMINATION', 'OTHER');

-- AlterTable
ALTER TABLE "group" ADD COLUMN     "recruitmentMethod" "GroupRecruitmentMethod" NOT NULL DEFAULT 'NONE';


UPDATE "group" SET "recruitmentMethod" = 'AUTUMN_APPLICATION' WHERE "slug" IN (
    'trikom',
    'appkom',
    'karrieredagene', -- who knows which slug
    'dotdagene', --      they actually have
    'arrkom',
    'fond',
    'output',
    'bedkom',
    'fagkom',
    'feminit',
    'online-il',
    'prokom',
    'dotkom'
);

UPDATE "group" SET "recruitmentMethod" = 'SPRING_APPLICATION' WHERE "slug" IN (
    'backlog',
    'ekskom',
    'velkom'
);

UPDATE "group" SET "recruitmentMethod" = 'GENERAL_ASSEMBLY' WHERE "slug" = 'hs';
UPDATE "group" SET "recruitmentMethod" = 'NOMINATION' WHERE "slug" = 'debug';
UPDATE "group" SET "recruitmentMethod" = 'OTHER' WHERE "slug" = 'bankom';
