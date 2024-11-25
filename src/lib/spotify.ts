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
    return playlists.body.items.map((playlist) => ({
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

// Spotifyのplaylistを取得
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

// Spotifyのお気に入りを取得
export async function getSavedTracks(token: string) {
  spotifyApi.setAccessToken(token);

  try {
    const savedTracks = await spotifyApi.getMySavedTracks();
    return savedTracks.body.items.map((item) => ({
      id: item.track.id,
      name: item.track.name,
      artist: item.track.artists.map((artist) => artist.name).join(", "),
      album: item.track.album.name,
      imageUrl: item.track.album.images[0]?.url,
      popularity: item.track.popularity,
    }));
  } catch (error) {
    console.error("Error fetching saved tracks:", error);
    throw new Error("Failed to fetch saved tracks from Spotify.");
  }
}
