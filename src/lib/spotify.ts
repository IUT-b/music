import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi();

// Spotifyのaccess tokenを設定
export function setAccessToken(accessToken: string) {
  spotifyApi.setAccessToken(accessToken);
}

// Spotifyのrefresh tokenを設定
export function setRefreshToken(refreshToken: string) {
  spotifyApi.setRefreshToken(refreshToken);
}

// Spotifyのaccess tokenを更新
export async function refreshAccessToken(refreshToken: string) {
  try {
    const data = await spotifyApi.refreshAccessToken(refreshToken);
    const newAccessToken = data.body["access_token"];
    spotifyApi.setAccessToken(newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error("Error refreshing access token", error);
    throw error;
  }
}

// Spotifyのuserデータを取得
export async function getUserData(token: string) {
  spotifyApi.setAccessToken(token);

  try {
    const userData = await spotifyApi.getMe();
    return userData.body;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw new Error("Failed to fetch user data from Spotify.");
  }
}

// Spotifyのtop trackを取得
export async function getTopTracks(token: string, timeRange = 'medium_term', limit = 10) {
  spotifyApi.setAccessToken(token);

  try {
    const topTracks = await spotifyApi.getMyTopTracks({ time_range: timeRange, limit });
    return topTracks.body.items.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map((artist) => artist.name).join(', '),
      album: track.album.name,
      imageUrl: track.album.images[0]?.url,
      popularity: track.popularity,
      trackUrl: track.external_urls.spotify,
    }));
  } catch (error) {
    console.error("Error fetching top tracks:", error);
    throw new Error("Failed to fetch top tracks from Spotify.");
  }
}

// Spotifyのplaylistを取得
export async function getPlaylists(token: string, limit = 10, offset = 0) {
  spotifyApi.setAccessToken(token);

  try {
    const playlists = await spotifyApi.getUserPlaylists({ limit, offset });
    return playlists.body.items
      .filter((playlist) => playlist !== null) // NOTE: 一部のプレイリスト(オーナーがSpotifyのもの?)がnullになる
      .map((playlist) => ({
        name: playlist.name,
        id: playlist.id,
        description: playlist.description,
        imageUrl: playlist.images[0]?.url,
        owner: playlist.owner.display_name,
        trackCount: playlist.tracks.total,
      }));
  } catch (error) {
    console.error("Error fetching playlists:", error);
    throw new Error("Failed to fetch playlists from Spotify.");
  }
}

// Spotifyのplaylistのtrackを取得
export async function getPlaylistTracks(token: string, playlistId: string, limit: number = 50, offset: number = 0) {
  spotifyApi.setAccessToken(token);

  try {
    const tracks = await spotifyApi.getPlaylistTracks(playlistId, { limit, offset });
    return tracks.body.items.map((track) => ({
      id: track.track.id,
      name: track.track.name,
      artist: track.track.artists.map(artist => artist.name).join(', '),
      album: track.track.album.name,
      imageUrl: track.track.album.images[0]?.url,
      trackUrl: track.track.external_urls.spotify,
    }));
  } catch (error) {
    console.error("Error fetching playlist tracks:", error);
    throw new Error("Failed to fetch playlist tracks from Spotify.");
  }
}

// Spotifyのplaylistに曲を追加
export async function addTracksToPlaylist(token: string, playlistId: string, trackUris: string[]) {
  spotifyApi.setAccessToken(token);

  try {
    const response = await spotifyApi.addTracksToPlaylist(playlistId, trackUris);
    return response.body;
  } catch (error) {
    console.error("Error adding tracks to playlist:", error);
    throw new Error("Failed to add tracks to playlist on Spotify.");
  }
}

// Spotifyのplaylistから曲を削除
export async function removeTracksFromPlaylist(token: string, playlistId: string, trackUris: string[]) {
  spotifyApi.setAccessToken(token);

  try {
    const response = await spotifyApi.removeTracksFromPlaylist(playlistId, trackUris.map(uri => ({ uri })));
    return response.body;
  } catch (error) {
    console.error("Error removing tracks from playlist:", error);
    throw new Error("Failed to remove tracks from playlist on Spotify.");
  }
}

/**
 * Spotify API: お気に入りに曲を追加
 * @param token Spotify のアクセストークン
 * @param trackIds 追加するトラックの ID の配列
 */
export async function addTrackToSavedTracks(token: string, trackIds: string[]) {
  spotifyApi.setAccessToken(token);

  try {
    const response = await spotifyApi.addToMySavedTracks(trackIds);
    return response.body;
  } catch (error) {
    console.error('Error adding track to saved tracks:', error);
    throw new Error('Failed to add track to saved tracks on Spotify.');
  }
}

/**
 * Spotify API: お気に入りから曲を削除
 * @param token Spotify のアクセストークン
 * @param trackIds 削除するトラックの ID の配列
 */
export async function removeTrackFromSavedTracks(token: string, trackIds: string[]) {
  spotifyApi.setAccessToken(token);

  try {
    const response = await spotifyApi.removeFromMySavedTracks(trackIds);
    return response.body;
  } catch (error) {
    console.error('Error removing track from saved tracks:', error);
    throw new Error('Failed to remove track from saved tracks on Spotify.');
  }
}

// Spotifyのdeviceを取得
export async function getDevices(token: string) {
  spotifyApi.setAccessToken(token);

  try {
    const devices = await spotifyApi.getMyDevices();
    return devices.body.devices;
  } catch (error) {
    console.error("Error fetching devices:", error);
    throw new Error("Failed to fetch devices from Spotify.");
  }
}

// Spotifyのplaylistを再生（プレミアムアカウントのみ）
export async function playPlaylist(token: string, deviceId: string, playlistId: string) {
  spotifyApi.setAccessToken(token);

  try {
    const response = await spotifyApi.getMyDevices();  // 現在利用可能なデバイスを取得
    const availableDevice = response.body.devices.find(device => device.id === deviceId);

    if (!availableDevice) {
      throw new Error('Device not found or not available for playback.');
    }

    await spotifyApi.play({
      device_id: deviceId,
      context_uri: `spotify:playlist:${playlistId}`,
    });
  } catch (error) {
    console.error("Error play playlist:", error);
    throw new Error("Failed to play playlist from Spotify.");
  }
}

// Spotifyのお気に入りを全曲取得
export async function getSavedTracks(token: string) {
  spotifyApi.setAccessToken(token);

  let allSavedTracks: any[] = [];
  let offset = 0;
  const limit = 50; // 最大50曲まで取得可能

  try {
    // 最初のリクエストを実行し、全曲を取得するためにページネーションを利用
    while (true) {
      const savedTracks = await spotifyApi.getMySavedTracks({ limit, offset });
      allSavedTracks = [...allSavedTracks, ...savedTracks.body.items.map((item) => ({
        id: item.track.id,
        name: item.track.name,
        artist: item.track.artists.map((artist) => artist.name).join(", "),
        album: item.track.album.name,
        imageUrl: item.track.album.images[0]?.url,
        popularity: item.track.popularity,
      }))];

      // 次のページがない場合はループを終了
      if (!savedTracks.body.next) {
        break;
      }

      // 次のページに進むためにoffsetを更新
      offset += limit;
    }

    return allSavedTracks;
  } catch (error) {
    console.error("Error fetching saved tracks:", error);
    throw new Error("Failed to fetch saved tracks from Spotify.");
  }
}

