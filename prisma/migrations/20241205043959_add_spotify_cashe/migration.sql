-- CreateTable
CREATE TABLE "SpotifyCache" (
    "id" SERIAL NOT NULL,
    "spotifyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpotifyCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyCache_spotifyId_type_key" ON "SpotifyCache"("spotifyId", "type");
