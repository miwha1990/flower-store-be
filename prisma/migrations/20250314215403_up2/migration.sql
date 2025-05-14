/*
  Warnings:

  - Made the column `imageSrc` on table `Flower` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Flower" ALTER COLUMN "imageSrc" SET NOT NULL;
