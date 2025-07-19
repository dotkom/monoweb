/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `group` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "group_id_key" ON "group"("id");

UPDATE "group" SET id = 'appkom' WHERE name = 'Appkom';
UPDATE "group" SET id = 'arrkom' WHERE name = 'Arrkom';
UPDATE "group" SET id = 'backlog' WHERE name = 'Backlog';
UPDATE "group" SET ID = 'bankom' WHERE name = 'Bankom';
UPDATE "group" SET ID = 'bedkom' WHERE name = 'Bedkom';
UPDATE "group" SET ID = 'debug' WHERE name = 'Debug';
UPDATE "group" SET ID = 'dotkom' WHERE name = 'Dotkom';
UPDATE "group" SET ID = 'fagkom' WHERE name = 'Fagkom';
UPDATE "group" SET ID = 'feminit' WHERE name = 'FeminIT';
UPDATE "group" SET ID = 'hs' WHERE name = 'HS';
UPDATE "group" SET ID = 'komiteledere' WHERE name = 'Komiteledere';
UPDATE "group" SET ID = 'onlineil' WHERE name = 'Online-IL';
UPDATE "group" SET ID = 'fond' WHERE name = 'Fond';
UPDATE "group" SET ID = 'prokom' WHERE name = 'Prokom';
UPDATE "group" SET ID = 'ekskom' WHERE name = 'Ekskom';
UPDATE "group" SET ID = 'itex' WHERE name = 'ITEX';
UPDATE "group" SET ID = 'jubkom' WHERE name = 'Jubkom';
