/*
  Warnings:

  - Made the column `public_id` on table `Avatar` required. This step will fail if there are existing NULL values in that column.
  - Made the column `url` on table `Avatar` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Avatar` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Avatar" DROP CONSTRAINT "Avatar_userId_fkey";

-- AlterTable
ALTER TABLE "Avatar" ALTER COLUMN "public_id" SET NOT NULL,
ALTER COLUMN "url" SET NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Avatar" ADD CONSTRAINT "Avatar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
