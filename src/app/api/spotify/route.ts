// NOTE: 更新したものだけを取得できるようにした方がよい
import { NextResponse } from 'next/server';
import { getUserData, getTopTracks, getPlaylists, getPlaylistTracks, getDevices, getSavedTracks } from '../../../lib/spotify';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { syncFavoritesWithSpotify } from "@/lib/syncFavorites";

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
    // const user = await getUserData(session.accessToken); // Note: NextAuthの認証後にsession.userにも同様のデータが格納されている
    // const topTracksIn4Weeks = await getTopTracks(session.accessToken, 'short_term', limit);
    // const topTracksIn6Months = await getTopTracks(session.accessToken, 'medium_term', limit);
    // const topTracksInAllTime = await getTopTracks(session.accessToken, 'long_term', limit);
    // const playlists = await getPlaylists(session.accessToken, limit, offset);
    // const devices = await getDevices(session.accessToken);
    // const savedTracks = await getSavedTracks(session.accessToken);

    // // プレイリスト内の曲を取得
    // const playlistsWithTracks = await Promise.all(playlists.map(async (playlist) => {
    //   const tracks = await getPlaylistTracks(session.accessToken, playlist.id, limit);
    //   return { ...playlist, tracks };
    // }));

    // await syncFavoritesWithSpotify(session.accessToken, session.user.spotifyId); // NOTE: サーバーサイドで実行する

    // return NextResponse.json({
    //   user,
    //   topTracksIn4Weeks,
    //   topTracksIn6Months,
    //   topTracksInAllTime,
    //   playlists: playlistsWithTracks,
    //   devices,
    //   savedTracks,
    // });



    // dataType によって返すデータを制御
    const responseData: any = {};

    if (!dataType || dataType === 'user') {
      const user = await getUserData(session.accessToken); // Note: NextAuthの認証後にsession.userにも同様のデータが格納されている

      responseData.user = user;
    }
    if (!dataType || dataType === 'topTracks') {
      const topTracksIn4Weeks = await getTopTracks(session.accessToken, 'short_term', limit);
      const topTracksIn6Months = await getTopTracks(session.accessToken, 'medium_term', limit);
      const topTracksInAllTime = await getTopTracks(session.accessToken, 'long_term', limit);

      responseData.topTracksIn4Weeks = topTracksIn4Weeks;
      responseData.topTracksIn6Months = topTracksIn6Months;
      responseData.topTracksInAllTime = topTracksInAllTime;
    }
    if (!dataType || dataType === 'playlists') {
      console.log('aaaaaaaaaaa');
      const playlists = await getPlaylists(session.accessToken, limit, offset);

      // プレイリスト内の曲を取得
      const playlistsWithTracks = await Promise.all(playlists.map(async (playlist) => {
        const tracks = await getPlaylistTracks(session.accessToken, playlist.id, limit);
        return { ...playlist, tracks };
      }));

      responseData.playlists = playlistsWithTracks;
    }
    if (!dataType || dataType === 'devices') {
      const devices = await getDevices(session.accessToken);

      responseData.devices = devices;
    }
    if (!dataType || dataType === 'savedTracks') {
      const savedTracks = await getSavedTracks(session.accessToken);

      responseData.savedTracks = savedTracks;
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Failed to fetch Spotify data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
