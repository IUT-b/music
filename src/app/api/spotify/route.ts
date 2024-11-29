// NOTE: 更新したものだけを取得できるようにした方がよい
import { NextResponse } from 'next/server';
import { getUserData, getTopTracks, getPlaylists, getPlaylistTracks, getDevices, getSavedTracks } from '../../../lib/spotify';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getAccessToken } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const dataType = url.searchParams.get('data'); // 取得したいデータのタイプ ('tracks' や 'playlists' など)
  const limit = 50;
  const offset = parseInt(url.searchParams.get('offset') || '0', 0);

  try {
    // アクセストークンを更新
    const accessToken = await getAccessToken(session.user.spotifyId);

    // dataType によって返すデータを制御
    const responseData: any = {};

    if (!dataType || dataType === 'user') {
      const user = await getUserData(accessToken); // Note: NextAuthの認証後にsession.userにも同様のデータが格納されている

      responseData.user = user;
    }
    if (!dataType || dataType === 'topTracks') {
      const topTracksIn4Weeks = await getTopTracks(accessToken, 'short_term', limit);
      const topTracksIn6Months = await getTopTracks(accessToken, 'medium_term', limit);
      const topTracksInAllTime = await getTopTracks(accessToken, 'long_term', limit);

      responseData.topTracksIn4Weeks = topTracksIn4Weeks;
      responseData.topTracksIn6Months = topTracksIn6Months;
      responseData.topTracksInAllTime = topTracksInAllTime;
    }
    if (!dataType || dataType === 'playlists') {
      const playlists = await getPlaylists(accessToken, limit, offset);

      // プレイリスト内の曲を取得
      const playlistsWithTracks = await Promise.all(playlists.map(async (playlist) => {
        const tracks = await getPlaylistTracks(accessToken, playlist.id, limit);
        return { ...playlist, tracks };
      }));

      responseData.playlists = playlistsWithTracks;
    }
    if (!dataType || dataType === 'devices') {
      const devices = await getDevices(accessToken);

      responseData.devices = devices;
    }
    if (!dataType || dataType === 'savedTracks') {
      const savedTracks = await getSavedTracks(accessToken);

      responseData.savedTracks = savedTracks;
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Failed to fetch Spotify data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
