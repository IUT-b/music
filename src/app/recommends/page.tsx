'use client';

import { useEffect, useState } from 'react';
import TrackTable from '../components/TrackTable';

type Track = {
  id: string;
  name: string;
  artist: string;
  album: string;
  imageUrl: string;
  owner: string;
  popularity: number;
};

type Playlist = {
  name: string;
  description: string;
  imageUrl: string;
  tracks: Track[];
};

export default function InsightsPage() {
  const [savedTracks, setSavedTracks] = useState<Track[]>([]);
  const [spotifyId, setSpotifyId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    const spotifyData = sessionStorage.getItem('spotifyData');
    // NOTE: spotifyDataがないことがある
    if (spotifyData) {
      setSpotifyId(JSON.parse(spotifyData).user.id);
    }

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
  }, []);


  useEffect(() => {
    // プレイリストを取得
    const fetchPlaylists = async () => {
      try {
        const response = await fetch('/api/spotify?data=playlists');

        if (response.ok) {
          const data = await response.json();
          setPlaylists(data.playlists);

          // プレイリストをオーナーIDでフィルタリング
          console.log(spotifyId);
          const filteredPlaylists = data.playlists.filter(
            (playlist: { owner: string }) => playlist.owner === spotifyId
          );

          setPlaylists(filteredPlaylists);
        } else {
          throw new Error('Failed to fetch top tracks');
        }
      } catch (error) {
        console.error('Error fetching top tracks:', error);
      }
    };

    fetchPlaylists();
  }, [spotifyId]); // NOTE: spotifyIdを取得後に実施

  // お気に入りの登録・解除
  // const handleCheckboxChange = async (trackId: string, checked: boolean) => {
  //   console.log(`Track ID: ${trackId}, Checked: ${checked}`);

  //   if (!spotifyId) {
  //     console.error("Spotify ID not available.");
  //     return;
  //   }

  //   try {
  //     // TODO: sessionからaccessToken取るように変更
  //     // TODO: アクセストークン切れのときがある？
  //     // const accessToken = await getAccessToken(spotifyId);
  //     // const accessToken = session.accessToken;
  //     if (!accessToken) {
  //       console.error("Access token not found for user:", spotifyId);
  //       return;
  //     }

  //     if (checked) {
  //       // お気に入りに追加
  //       const track = savedTracks.find((t) => t.id === trackId);
  //       if (track) {
  //         await addTrackToSavedTracks(accessToken, [trackId]);
  //         setSavedTracks((prevFavorites) => [...prevFavorites, track]);
  //         console.log(`Added track ${trackId} to favorites.`);
  //       }
  //     } else {
  //       // お気に入りから削除
  //       await removeTrackFromSavedTracks(accessToken, [trackId]);
  //       setSavedTracks((prevFavorites) => prevFavorites.filter((t) => t.id !== trackId));
  //       console.log(`Removed track ${trackId} from favorites.`);
  //     }

  //     // Spotifyとデータベースのお気に入りを同期
  //     const syncFavoritesWithSpotify = async () => {
  //       try {
  //         const response = await fetch('/api/favorite/syncFavorites');

  //         if (response.ok) {
  //           // await response.json();
  //         } else {
  //           throw new Error('Failed to sync favorites');
  //         }
  //       } catch (error) {
  //         console.error('Error syncing favorites:', error);
  //       }
  //     };

  //     syncFavoritesWithSpotify();
  //   } catch (error) {
  //     console.error('Error updating favorites:', error);
  //   }
  // };

  if (savedTracks.length === 0 || playlists.length === 0) {
    return <div>Loading...</div>;
  }

  console.log(playlists);
  return (
    <div>
      <h1>Spotify Top Tracks</h1>
      <TrackTable
        accessToken={accessToken}
        title='Favorites'
        tracks={savedTracks}
        savedTracks={savedTracks}
        // onCheckboxChange={handleCheckboxChange}
        playlists={playlists}
        isShowingPlaylist={false}
      />
    </div>
  );
};
