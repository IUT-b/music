'use client';

import { useEffect, useState } from 'react';
import { useRecoilValue } from "recoil";
import { selectedViewState, createViewState } from "../state/state";
import { Track, Playlist } from '@/types/spotify';
import SharedLayout from "../components/SharedLayout";
import Sidebar from "./Sidebar";
import TrackTable from '../components/TrackTable';
import TimelineChart from "../components/TimelineChart";

export default function InsightsPage() {
  const [spotifyId, setSpotifyId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [savedTracks, setSavedTracks] = useState<Track[]>([]);
  const [tracksIn4Weeks, setTracksIn4Weeks] = useState<Track[]>([]);
  const [tracksIn6Months, setTracksIn6Months] = useState<Track[]>([]);
  const [tracksInAllTime, setTracksInAllTime] = useState<Track[]>([]);
  const [favorites, setFavorites] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const selectedView = useRecoilValue(selectedViewState);

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

  // spotifyId取得後に実施
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
  }, [spotifyId]);

  if (tracksIn4Weeks.length === 0 || tracksIn6Months.length === 0 || tracksInAllTime.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <SharedLayout SidebarComponent={Sidebar}>
      <div>
        {selectedView === "Top Tracks in 4 Weeks" && (
          <TrackTable
            accessToken={accessToken}
            title='Top Tracks in 4 Weeks'
            tracks={tracksIn4Weeks}
            savedTracks={savedTracks}
            playlists={playlists}
            isShowingPlaylist={false}
            showingPlaylist={{}}
            setSavedTracks={setSavedTracks}  // setSavedTracks を渡す
          />)}
        {selectedView === "Top Tracks in 6 Months" && (
          <TrackTable
            accessToken={accessToken}
            title='Top Tracks in 6 Months'
            tracks={tracksIn6Months}
            savedTracks={savedTracks}
            playlists={playlists}
            isShowingPlaylist={false}
            showingPlaylist={{}}
            setSavedTracks={setSavedTracks}  // setSavedTracks を渡す
          />)}
        {selectedView === "Top Tracks of All Time" && (
          <TrackTable
            accessToken={accessToken}
            title='Top Tracks of All Time'
            tracks={tracksInAllTime}
            savedTracks={savedTracks}
            playlists={playlists}
            isShowingPlaylist={false}
            showingPlaylist={{}}
            setSavedTracks={setSavedTracks}  // setSavedTracks を渡す
          />)}
        {selectedView === "Favorites" && (
          <div>
            <TrackTable
              accessToken={accessToken}
              title='お気に入り'
              tracks={savedTracks}
              savedTracks={savedTracks}
              playlists={playlists}
              isShowingPlaylist={false}
              showingPlaylist={{}}
              setSavedTracks={setSavedTracks}  // setSavedTracks を渡す
            />
            <TimelineChart favorites={favorites} />
          </div>)}
      </div>
    </SharedLayout>
  );
};
