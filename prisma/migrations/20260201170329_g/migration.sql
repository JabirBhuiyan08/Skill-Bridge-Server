/*
  Warnings:

  - You are about to drop the column `studentId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `subjectId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `tutorId` on the `Booking` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_tutorId_fkey";

-- DropIndex
DROP INDEX "Booking_tutorId_idx";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "studentId",
DROP COLUMN "subjectId",
DROP COLUMN "tutorId";
