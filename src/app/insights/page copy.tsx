'use client';

import { useEffect, useRef, useState } from 'react';
import { useRecoilValue } from "recoil";
import * as echarts from 'echarts';
import { selectedViewState } from "../state/state";
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

  const chartRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<any[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const updateFrequency = 2000;

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

  useEffect(() => {
    // バーレースチャート用にデータ整形
    const allTracks = [
      ...tracksIn4Weeks.map((track, index) => [
        50 - index,
        `${track.name} - ${track.artist}`,
        "4 Weeks",
      ]),
      ...tracksIn6Months.map((track, index) => [
        50 - index,
        `${track.name} - ${track.artist}`,
        "6 Months",
      ]),
      ...tracksInAllTime.map((track, index) => [
        50 - index,
        `${track.name} - ${track.artist}`,
        "All Time",
      ]),
    ];

    // 年ごとのフィルタリングの代わりに全データをセット
    setData([["Ranking", "Track", "Period"], ...allTracks]);
    setYears(["4 Weeks", "6 Months", "All Time"]);
  }, [tracksIn4Weeks, tracksIn6Months, tracksInAllTime]);

  useEffect(() => {
    if (!chartRef.current || data.length === 0 || years.length === 0) return;

    const myChart = echarts.init(chartRef.current);
    let startIndex = 0;
    let startYear = years[startIndex];

    const option: echarts.EChartsOption = {
      grid: {
        top: 10,
        bottom: 30,
        left: 150000000, // 棒の領域を非表示に設定
        right: 80,
      },
      xAxis: {
        axisLabel: {
          show: false,
        },
      },
      dataset: {
        source: data.slice(1).filter((d: string[]) => d[2] === startYear),
      },
      yAxis: {
        type: 'category',
        inverse: true,
        max: 10,
        axisLabel: {
          show: true,
          fontSize: 14,
          formatter: (value: any) => `${value}`,
        },
        animationDuration: 300,
        animationDurationUpdate: 300,
      },
      series: [
        {
          realtimeSort: true,
          seriesLayoutBy: 'column',
          type: 'bar',
          encode: {
            x: 0,
            y: 1,
          },
          label: {
            show: true,
            precision: 1,
            position: 'right',
            valueAnimation: true,
            fontFamily: 'monospace',
          },
          itemStyle: {
            opacity: 0,
          },
        },
      ],
      animationDuration: 0,
      animationDurationUpdate: updateFrequency,
      animationEasing: 'linear',
      animationEasingUpdate: 'linear',
      graphic: {
        elements: [
          {
            type: 'text',
            right: 160,
            bottom: 60,
            style: {
              text: startYear,
              font: 'bolder 80px monospace',
              fill: 'rgba(100, 100, 100, 0.25)',
            },
            z: 100,
          },
        ],
      },
    };

    myChart.setOption(option);

    const interval = setInterval(() => {
      startIndex++;
      if (startIndex >= years.length) {
        clearInterval(interval);
        return;
      }
      startYear = years[startIndex];
      const source = data.slice(1).filter((d: string[]) => d[2] === startYear);
      option.dataset!.source = source;
      (option.graphic as any).elements[0].style.text = startYear;
      myChart.setOption(option, true);
    }, updateFrequency);

    return () => {
      clearInterval(interval);
      myChart.dispose();
    };
  }, [data, years, updateFrequency]);

  if (tracksIn4Weeks.length === 0 || tracksIn6Months.length === 0 || tracksInAllTime.length === 0) {
    return <div>Loading...</div>;
  }

  const renderTrackTable = (title, tracks) => (
    <TrackTable
      accessToken={accessToken}
      title={title}
      tracks={tracks}
      savedTracks={savedTracks}
      playlists={playlists}
      isShowingPlaylist={false}
      showingPlaylist={{}}
      setSavedTracks={setSavedTracks}
    />
  );

  return (
    <SharedLayout SidebarComponent={Sidebar}>
      <div>
        <div ref={chartRef} style={{ width: '100%', height: '500px' }} />
        <div>
          {selectedView === "Top Tracks in 4 Weeks" && renderTrackTable("Top Tracks in 4 Weeks", tracksIn4Weeks)}
          {selectedView === "Top Tracks in 6 Months" && renderTrackTable("Top Tracks in 6 Months", tracksIn6Months)}
          {selectedView === "Top Tracks of All Time" && renderTrackTable("Top Tracks of All Time", tracksInAllTime)}
          {selectedView === "Favorites" && (
            <div>
              {renderTrackTable("お気に入り", savedTracks)}
              <div className="w-11/12">
                <TimelineChart favorites={favorites} />
              </div>
            </div>
          )}
        </div>
      </div>
    </SharedLayout>
  );
};
