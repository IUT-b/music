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
  const chartRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<any[]>([]);

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

  useEffect(() => {
    const periods = ["All Time", "6 Months", "4 Weeks"];

    // 欠損値を補完する関数
    const fillMissingData = (tracks, periods) => {
      const trackNames = Array.from(new Set(tracks.map((track) => track[1])));
      const filledTracks = [];

      trackNames.forEach((trackName) => {
        periods.forEach((period) => {
          const existingTrack = tracks.find(
            (track) => track[1] === trackName && track[2] === period
          );
          if (existingTrack) {
            filledTracks.push(existingTrack);
          } else {
            // 欠損値を補完
            filledTracks.push([51, trackName, period]);
          }
        });
      });

      return filledTracks;
    };

    // データを整形
    const allTracks = [
      ...tracksInAllTime.map((track, index) => [
        index + 1,
        track.name,
        "All Time",
      ]),
      ...tracksIn6Months.map((track, index) => [
        index + 1,
        track.name,
        "6 Months",
      ]),
      ...tracksIn4Weeks.map((track, index) => [
        index + 1,
        track.name,
        "4 Weeks",
      ]),
    ];

    // 補完したデータを設定
    const completeTracks = fillMissingData(allTracks, periods);

    setData([["Rank", "Track", "Period"], ...completeTracks]);
  }, [tracksIn4Weeks, tracksIn6Months, tracksInAllTime]);




  useEffect(() => {
    if (!chartRef.current) return;
    const myChart = echarts.init(chartRef.current);
    let option;

    // NOTE: 非同期処理の実施タイミングの関係でタイムアウトが必要
    setTimeout(() => {
      run(data);
    }, 0);

    // チャートの描画
    function run(_rawData: any) {
      // データからすべてのトラック名を一意に抽出
      const tracks = Array.from(
        new Set(_rawData.slice(1).map((row: any) => row[1]))
      );

      const datasetWithFilters: any[] = [];
      const seriesList: any[] = [];

      tracks.forEach((track) => {
        const datasetId = 'dataset_' + track;
        datasetWithFilters.push({
          id: datasetId,
          fromDatasetId: 'dataset_raw',
          transform: {
            type: 'filter',
            config: {
              and: [
                { dimension: 'Track', '=': track },
              ],
            },
          },
        });
        seriesList.push({
          type: 'line',
          datasetId: datasetId,
          showSymbol: false,
          name: track,
          endLabel: {
            show: true,
            formatter: function (params: any) {
              const maxLength = 20;
              const text = params.value[1];
              return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
            },
            color: 'white',
            fontSize: 12,
            fontWeight: 100
          },
          labelLayout: {
            moveOverlap: 'shiftY',
          },
          emphasis: {
            focus: 'series',
          },
          encode: {
            x: 'Period',
            y: 'Rank',
            label: 'Track',
            itemName: 'Track',
          },
          smooth: true,
        });
      });

      option = {
        animationDuration: 20000,
        dataset: [
          {
            id: 'dataset_raw',
            source: _rawData,
          },
          ...datasetWithFilters,
        ],
        title: {
          text: 'ランキングチャート',
        },
        xAxis: {
          type: 'category',
          nameLocation: 'middle',
          position: 'top',
        },
        yAxis: {
          name: 'Rank',
          nameLocation: 'start',
          inverse: true,
          min: 1,
          max: 50,
          axisLabel: {
            formatter: (value) => `#${value}`,
          },
        },
        grid: {
          right: 140,
        },
        series: seriesList,
      };

      myChart.setOption(option);
    }

    option && myChart.setOption(option);

    // クリーンアップ
    return () => {
      myChart.dispose();
    };
  }, [data]);

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
        <div>
          {selectedView === "Top Tracks in 4 Weeks" && renderTrackTable("Top Tracks in 4 Weeks", tracksIn4Weeks)}
          {selectedView === "Top Tracks in 6 Months" && renderTrackTable("Top Tracks in 6 Months", tracksIn6Months)}
          {selectedView === "Top Tracks of All Time" && renderTrackTable("Top Tracks of All Time", tracksInAllTime)}
          {selectedView === "Chart" && (
            <div ref={chartRef} style={{ width: '100%', height: '1200px' }} />
          )}
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
