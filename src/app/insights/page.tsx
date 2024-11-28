'use client';

import { useEffect, useState } from 'react';
import TrackTable from '../components/TrackTable';
import TimelineChart from "../components/TimelineChart";

type Track = {
  id: string;
  name: string;
  artist: string;
  album: string;
  imageUrl: string;
  popularity: number;
  trackUrl: string;
};

export default function InsightsPage() {
  const [spotifyId, setSpotifyId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [savedTracks, setSavedTracks] = useState<Track[]>([]);
  const [tracksIn4Weeks, setTracksIn4Weeks] = useState<Track[]>([]);
  const [tracksIn6Months, setTracksIn6Months] = useState<Track[]>([]);
  const [tracksInAllTime, setTracksInAllTime] = useState<Track[]>([]);
  const [favorites, setFavorites] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    const spotifyData = sessionStorage.getItem('spotifyData');
    // NOTE: spotifyDataがないことがある
    if (spotifyData) {
      setSpotifyId(JSON.parse(spotifyData).user.id);
    }

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

    // トップトラックを取得
    const fetchTopTracks = async () => {
      try {
        const response = await fetch('/api/spotify?data=topTracks');

        if (response.ok) {
          const data = await response.json();
          setTracksIn4Weeks(data.topTracksIn4Weeks);
          setTracksIn6Months(data.topTracksIn6Months);
          setTracksInAllTime(data.topTracksInAllTime);
        } else {
          throw new Error('Failed to fetch top tracks');
        }
      } catch (error) {
        console.error('Error fetching top tracks:', error);
      }
    };

    fetchTopTracks();

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

    // お気に入り(期間含む)を取得
    const fetchFavorites = async () => {
      try {
        const response = await fetch('/api/favorite');
        if (response.ok) {
          const data = await response.json();
          setFavorites(data);
        } else {
          throw new Error('Failed to fetch favorites');
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };

    fetchFavorites();

    // Spotifyとデータベースのお気に入りを同期
    const syncFavoritesWithSpotify = async () => {
      try {
        const response = await fetch('/api/favorite/syncFavorites');

        if (response.ok) {
          // await response.json();
        } else {
          throw new Error('Failed to sync favorites');
        }
      } catch (error) {
        console.error('Error syncing favorites:', error);
      }
    };

    syncFavoritesWithSpotify();
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

  // お気に入りを追加・削除する関数
  const handleSaveTrack = (track: Track) => {
    setSavedTracks((prevTracks) => {
      // 既に保存されているトラックなら削除
      if (prevTracks.some((savedTrack) => savedTrack.id === track.id)) {
        return prevTracks.filter((savedTrack) => savedTrack.id !== track.id);
      }
      // 保存されていない場合は追加
      return [...prevTracks, track];
    });
  };

  if (tracksIn4Weeks.length === 0 || tracksIn6Months.length === 0 || tracksInAllTime.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Spotify Top Tracks</h1>
      <TrackTable
        accessToken={accessToken}
        title='Top Tracks in 4 Weeks'
        tracks={tracksIn4Weeks}
        savedTracks={savedTracks}
        playlists={playlists}
        isShowingPlaylist={false}
        setSavedTracks={setSavedTracks}  // setSavedTracks を渡す
      />
      <TrackTable
        accessToken={accessToken}
        title='Top Tracks in 6 Months'
        tracks={tracksIn6Months}
        savedTracks={savedTracks}
        playlists={playlists}
        isShowingPlaylist={false}
        setSavedTracks={setSavedTracks}  // setSavedTracks を渡す
      />
      <TrackTable
        accessToken={accessToken}
        title='Top Tracks of All Time'
        tracks={tracksInAllTime}
        savedTracks={savedTracks}
        playlists={playlists}
        isShowingPlaylist={false}
        setSavedTracks={setSavedTracks}  // setSavedTracks を渡す
      />
      <TrackTable
        accessToken={accessToken}
        title='お気に入り'
        tracks={savedTracks}
        savedTracks={savedTracks}
        playlists={playlists}
        isShowingPlaylist={false}
        setSavedTracks={setSavedTracks}  // setSavedTracks を渡す
      />
      <TimelineChart favorites={favorites} />
    </div>
  );
};
