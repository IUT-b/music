'use client';

import { useState, useEffect } from 'react';
import TrackTable from '../components/TrackTable';

type Track = {
  trackName: string;
  artistName: string;
  albumName: string;
  albumImageUrl: string;
  trackUrl: string;
};

type Playlist = {
  name: string;
  description: string;
  imageUrl: string;
  tracks: Track[];
};

export default function PlaylistsPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [savedTracks, setSavedTracks] = useState<Track[]>([]);

  useEffect(() => {
    // アクセストークンを取得
    const fetchAccessToken = async () => {
      try {
        const response = await fetch('/api/spotify/getAccessToken');
        const data = await response.json();

        if (data.accessToken) {
          setAccessToken(data.accessToken);
        } else {
          console.error("Failed to get access token");
        }
      } catch (error) {
        console.error("Error fetching access token:", error);
      }
    };

    fetchAccessToken();

    // プレイリストを取得
    const fetchPlaylists = async () => {
      try {
        const response = await fetch('/api/spotify?data=playlists');

        if (response.ok) {
          const data = await response.json();
          setPlaylists(data.playlists);
        } else {
          throw new Error('Failed to fetch top tracks');
        }
      } catch (error) {
        console.error('Error fetching top tracks:', error);
      }
    };

    fetchPlaylists();

    // 登録済のお気に入りを取得
    const fetchSavedTracks = async () => {
      try {
        const response = await fetch('/api/spotify?data=savedTracks');

        if (response.ok) {
          const data = await response.json();
          setSavedTracks(data.savedTracks);
        } else {
          throw new Error('Failed to fetch favorites');
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };

    fetchSavedTracks();
  }, []);

  if (playlists.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Spotify Playlists</h1>

      <ul>
        <h1>Spotify Top Tracks</h1>
        <TrackTable
          accessToken={accessToken}
          title='お気に入り'
          tracks={savedTracks}
          savedTracks={savedTracks}
          playlists={playlists}
          isShowingPlaylist={false}
        />
        {playlists.map((playlist, index) => (
          <li key={index}>
            <img src={playlist.imageUrl} alt={playlist.name} width={50} height={50} />
            {/* <TrackTable title={playlist.name} tracks={playlist.tracks} /> */}
            <TrackTable
              accessToken={accessToken}
              title={playlist.name}
              tracks={playlist.tracks}
              savedTracks={savedTracks}
              playlists={playlists}
              isShowingPlaylist={true}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
