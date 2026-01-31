/*
  Warnings:

  - You are about to drop the column `subjectId` on the `Review` table. All the data in the column will be lost.
  - Changed the type of `rating` on the `Review` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "Review_tutorId_idx";

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "subjectId",
DROP COLUMN "rating",
ADD COLUMN     "rating" INTEGER NOT NULL,
ALTER COLUMN "comment" DROP NOT NULL,
ALTER COLUMN "isApproved" SET DEFAULT false;
