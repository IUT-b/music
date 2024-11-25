import { NextResponse } from 'next/server';
import { getUserData, getTopTracks, getPlaylists, getDevices, getSavedTracks } from '../../../lib/spotify';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { syncFavoritesWithSpotify } from "@/lib/syncFavorites";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = 50;
  const offset = parseInt(url.searchParams.get('offset') || '0', 0);

  try {
    const user = await getUserData(session.accessToken); // Note: NextAuthの認証後にsession.userにも同様のデータが格納されている
    const topTracksIn4Weeks = await getTopTracks(session.accessToken, 'short_term', limit);
    const topTracksIn6Months = await getTopTracks(session.accessToken, 'medium_term', limit);
    const topTracksInAllTime = await getTopTracks(session.accessToken, 'long_term', limit);
    const playlists = await getPlaylists(session.accessToken, limit, offset);
    const devices = await getDevices(session.accessToken);
    const favorites = await getSavedTracks(session.accessToken);

    await syncFavoritesWithSpotify(session.accessToken, session.user.spotifyId); // NOTE: サーバーサイドで実行する

    return NextResponse.json({
      user,
      topTracksIn4Weeks,
      topTracksIn6Months,
      topTracksInAllTime,
      playlists,
      devices,
      favorites,
    });
  } catch (error) {
    console.error("Failed to fetch Spotify data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
