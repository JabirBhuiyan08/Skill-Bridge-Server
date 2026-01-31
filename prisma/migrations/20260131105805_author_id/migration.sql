/*
  Warnings:

  - Added the required column `authorId` to the `Avaiability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Avaiability" ADD COLUMN     "authorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "authorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "authorId" TEXT NOT NULL;
