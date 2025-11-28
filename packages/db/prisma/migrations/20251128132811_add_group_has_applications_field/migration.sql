-- AlterTable
ALTER TABLE "group" ADD COLUMN     "hasApplications" BOOLEAN NOT NULL DEFAULT false;

UPDATE "group" SET "hasApplications" = true WHERE "slug" IN (
    'velkom',
    'trikom',
    'appkom',
    'backlog',
    'arrkom',
    'ekskom',
    'bedkom',
    'fagkom',
    'feminit',
    'online-il',
    'prokom',
    'dotkom',
    'karrieredagene'
);