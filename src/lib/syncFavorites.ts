import { prisma } from "@/lib/prisma";
import { getSavedTracks } from "@/lib/spotify";

export async function syncFavoritesWithSpotify(token: string, userSpotifyId: string) {
  const savedTracks = await getSavedTracks(token);

  // Spotifyのお気に入りに存在する曲をデータベースで確認
  for (const track of savedTracks) {
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userSpotifyId_spotifyTrackId: {
          userSpotifyId: userSpotifyId,
          spotifyTrackId: track.id,
        },
      },
      include: { periods: true },
    });

    // 新しい曲はデータベースに追加
    // NOTE: シンプルさのためapi/favoriteを使わない
    if (!existingFavorite) {
      console.log(track.id, track.name);
      await prisma.favorite.create({
        data: {
          userSpotifyId,
          spotifyTrackId: track.id,
          spotifyTrackName: track.name,
          periods: {
            create: { startDate: new Date() },
          },
        },
      });
    } else {
      // 既に登録されている曲がSpotifyに残っている場合、解除日を設定しない
      const activePeriod = existingFavorite.periods.find((p) => !p.endDate);
      if (!activePeriod) {
        // 過去に解除されている場合、新たに登録日を追加
        await prisma.favoritePeriod.create({
          data: { favoriteId: existingFavorite.id, startDate: new Date() },
        });
      }
    }
  }

  // アプリ内のデータベースに存在しているが、Spotifyに存在しないお気に入り（解除された曲）
  const allFavorites = await prisma.favorite.findMany({
    where: { userSpotifyId },
    include: { periods: true },
  });

  for (const favorite of allFavorites) {
    const trackExistsInSpotify = savedTracks.some(
      (track) => track.id === favorite.spotifyTrackId
    );

    if (!trackExistsInSpotify) {
      // Spotifyに存在しない曲は解除扱いにする
      const activePeriod = favorite.periods.find((p) => !p.endDate);
      if (activePeriod) {
        await prisma.favoritePeriod.update({
          where: { id: activePeriod.id },
          data: { endDate: new Date() },
        });
      }
    }
  }
}
