/*
  Warnings:

  - You are about to drop the column `userSpotifyId` on the `Schedule` table. All the data in the column will be lost.
  - Added the required column `deviceName` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `playlistName` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spotifyId` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_userSpotifyId_fkey";

-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "userSpotifyId",
ADD COLUMN     "deviceName" TEXT NOT NULL,
ADD COLUMN     "playlistName" TEXT NOT NULL,
ADD COLUMN     "spotifyId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_spotifyId_fkey" FOREIGN KEY ("spotifyId") REFERENCES "User"("spotifyId") ON DELETE RESTRICT ON UPDATE CASCADE;
