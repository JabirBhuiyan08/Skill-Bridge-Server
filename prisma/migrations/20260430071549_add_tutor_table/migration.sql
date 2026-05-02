/*
  Warnings:

  - You are about to drop the column `authorId` on the `Availability` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `tutorId` on the `Subject` table. All the data in the column will be lost.
  - Added the required column `studentId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tutorId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Made the column `bookingId` on table `Review` required. This step will fail if there are existing NULL values in that column.
  - Made the column `studentId` on table `Review` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tutorId` on table `Review` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rating` on table `Review` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `subjectId` to the `TutorSubject` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Subject" DROP CONSTRAINT "Subject_tutorId_fkey";

-- AlterTable
ALTER TABLE "Availability" DROP COLUMN "authorId";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "authorId",
ADD COLUMN     "studentId" TEXT NOT NULL,
ADD COLUMN     "tutorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "authorId",
ALTER COLUMN "bookingId" SET NOT NULL,
ALTER COLUMN "studentId" SET NOT NULL,
ALTER COLUMN "tutorId" SET NOT NULL,
ALTER COLUMN "rating" SET NOT NULL;

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "tutorId";

-- AlterTable
ALTER TABLE "TutorSubject" ADD COLUMN     "subjectId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Tutor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tutor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tutor_userId_key" ON "Tutor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tutor_email_key" ON "Tutor"("email");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorSubject" ADD CONSTRAINT "TutorSubject_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorSubject" ADD CONSTRAINT "TutorSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tutor" ADD CONSTRAINT "Tutor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
