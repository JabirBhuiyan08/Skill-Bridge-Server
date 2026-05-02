/*
  Warnings:

  - Added the required column `tutorId` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "tutorId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
