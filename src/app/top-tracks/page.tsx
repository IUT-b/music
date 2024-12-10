'use client';

import { useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue } from "recoil";
import { savedTracksState, favoritesState, tracksIn4WeeksState, tracksIn6MonthsState, tracksInAllTimeState, playlistsState } from "../state/state";
import * as echarts from 'echarts';
import TrackTable from '../components/TrackTable';

export default function TopTracksPage() {
  const [spotifyData, setSpotifyData] = useState(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [cacheExpiries, setCacheExpiries] = useState(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [savedTracks, setSavedTracks] = useRecoilState(savedTracksState);
  const [favorites, setFavorites] = useRecoilState(favoritesState);
  const [tracksIn4Weeks, setTracksIn4Weeks] = useRecoilState(tracksIn4WeeksState);
  const [tracksIn6Months, setTracksIn6Months] = useRecoilState(tracksIn6MonthsState);
  const [tracksInAllTime, setTracksInAllTime] = useRecoilState(tracksInAllTimeState);
  const [playlists, setPlaylists] = useRecoilState(playlistsState);

  useEffect(() => {
    // セッションを取得
    const data = sessionStorage.getItem('spotifyData');

    if (data) {
      setSpotifyData(JSON.parse(data));
    }
    else {
      // セッションがない場合は作成
      console.log('Start session')
      const fetchSpotifyData = async () => {
        try {
          const response = await fetch('/api/spotify');
          if (!response.ok) {
            throw new Error('Failed to fetch top tracks');
          }

          const data = await response.json();
          sessionStorage.setItem('spotifyData', JSON.stringify(data));
          setSpotifyData(data);
        } catch (error) {
          if (error instanceof Error) {
            setError(error.message);
          } else {
            setError('An unknown error occurred');
          }
        }
      };
      fetchSpotifyData();

      // キャッシュの有効期限を更新
      fetch('/api/spotify/cacheExpiry', {
        method: 'POST',
        body: JSON.stringify({
          types: ['user', 'topTracks', 'playlists', 'devices', 'savedTracks'],
        }),
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // キャッシュの有効期限を取得
    const fetchCacheExpiries = async () => {
      try {
        const response = await fetch('/api/spotify/cacheExpiry');
        if (response.ok) {
          const data = await response.json();
          setCacheExpiries(data);
        } else {
          throw new Error('Failed to fetch cache expiries');
        }
      } catch (error) {
        console.error('Error fetching cache expiries:', error);
      }
    };
    fetchCacheExpiries();

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
    if (!spotifyData || !cacheExpiries) return;

    // トップトラックを取得
    const topTracksCacheExpiry = cacheExpiries.find((item: { type: string }) => item.type === 'topTracks');
    const isTopTracksCacheValid = new Date(topTracksCacheExpiry?.expiresAt).getTime() > new Date().getTime();

    // キャッシュが有効な場合
    if (isTopTracksCacheValid) {
      // NOTE: 取得済の場合はアプリ上でデータが変わっている場合があるのでアプリ上のデータを使用する
      if (tracksIn4Weeks.length === 0) setTracksIn4Weeks(spotifyData.topTracksIn4Weeks);
      if (tracksIn6Months.length === 0) setTracksIn6Months(spotifyData.topTracksIn6Months);
      if (tracksInAllTime.length === 0) setTracksInAllTime(spotifyData.topTracksInAllTime);
    }
    // 有効期限切れのとき
    else {
      console.log('Cache expired');
      // データ取得
      const fetchTopTracks = async () => {
        try {
          const response = await fetch('/api/spotify?data=topTracks');

          if (response.ok) {
            const data = await response.json();
            setTracksIn4Weeks(data.topTracksIn4Weeks);
            setTracksIn6Months(data.topTracksIn6Months);
            setTracksInAllTime(data.topTracksInAllTime);

            // セッションに保存
            const currentSessionData = sessionStorage.getItem('spotifyData');
            let updatedSessionData = {};
            if (currentSessionData) updatedSessionData = JSON.parse(currentSessionData);
            updatedSessionData.topTracksIn4Weeks = data.topTracksIn4Weeks;
            updatedSessionData.topTracksIn6Months = data.topTracksIn6Months;
            updatedSessionData.topTracksInAllTime = data.topTracksInAllTime;
            sessionStorage.setItem('spotifyData', JSON.stringify(updatedSessionData));

            // キャッシュを更新
            await fetch('/api/spotify/cacheExpiry', {
              method: 'POST',
              body: JSON.stringify({
                types: ['topTracks'],
              }),
              headers: { 'Content-Type': 'application/json' },
            });
          } else {
            throw new Error('Failed to fetch top tracks');
          }
        } catch (error) {
          console.error('Error fetching top tracks:', error);
        }
      };
      fetchTopTracks();
    }

    // お気に入りを取得
    const savedTracksCacheExpiry = cacheExpiries.find((item: { type: string }) => item.type === 'savedTracks');
    const isSavedTracksCacheValid = new Date(savedTracksCacheExpiry?.expiresAt).getTime() > new Date().getTime();

    // キャッシュが有効な場合
    if (isSavedTracksCacheValid) {
      // NOTE: 取得済の場合はアプリ上でデータが変わっている場合があるのでアプリ上のデータを使用する
      if (savedTracks.length === 0) setSavedTracks(spotifyData.savedTracks);
    }
    // 有効期限切れのとき
    else {
      console.log('Cache expired');
      // データ取得
      const fetchSavedTracks = async () => {
        try {
          const response = await fetch('/api/spotify?data=savedTracks');

          if (response.ok) {
            const data = await response.json();
            setSavedTracks(data.savedTracks);

            // セッションに保存
            const currentSessionData = sessionStorage.getItem('spotifyData');
            let updatedSessionData = {};
            if (currentSessionData) updatedSessionData = JSON.parse(currentSessionData);
            updatedSessionData.savedTracks = data.savedTracks;
            sessionStorage.setItem('spotifyData', JSON.stringify(updatedSessionData));

            // キャッシュを更新
            await fetch('/api/spotify/cacheExpiry', {
              method: 'POST',
              body: JSON.stringify({
                types: ['savedTracks'],
              }),
              headers: { 'Content-Type': 'application/json' },
            });
          } else {
            throw new Error('Failed to fetch favorites');
          }
        } catch (error) {
          console.error('Error fetching favorites:', error);
        }
      };
      fetchSavedTracks();
    }

    // プレイリストを取得
    const playlistsCacheExpiry = cacheExpiries.find((item: { type: string }) => item.type === 'playlists');
    const isPlaylistsCacheValid = new Date(playlistsCacheExpiry?.expiresAt).getTime() > new Date().getTime();

    // キャッシュが有効な場合かつ未取得の場合
    if (isPlaylistsCacheValid) {
      if (playlists.length === 0) setPlaylists(spotifyData.playlists);
    }
    // 有効期限切れのとき
    else {
      console.log('Cache expired');
      // データ取得
      const fetchPlaylists = async () => {
        try {
          const response = await fetch('/api/spotify?data=playlists');

          if (response.ok) {
            const data = await response.json();
            setPlaylists(data.playlists);

            // セッションに保存
            const currentSessionData = sessionStorage.getItem('spotifyData');
            let updatedSessionData = {};
            if (currentSessionData) updatedSessionData = JSON.parse(currentSessionData);
            updatedSessionData.playlists = data.playlists;
            sessionStorage.setItem('spotifyData', JSON.stringify(updatedSessionData));

            // キャッシュを更新
            await fetch('/api/spotify/cacheExpiry', {
              method: 'POST',
              body: JSON.stringify({
                types: ['playlists'],
              }),
              headers: { 'Content-Type': 'application/json' },
            });
          } else {
            throw new Error('Failed to fetch playlists');
          }
        } catch (error) {
          console.error('Error fetching playlists:', error);
        }
      };
      fetchPlaylists();
    }

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
  }, [spotifyData, cacheExpiries]);

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
            const imageUrl = tracks.find((track) => track[1] === trackName)?.[3] || ""; // TODO: 画像がない場合の画像を用意
            filledTracks.push([51, trackName, period, imageUrl]);
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
        track.imageUrl,
      ]),
      ...tracksIn6Months.map((track, index) => [
        index + 1,
        track.name,
        "6 Months",
        track.imageUrl,
      ]),
      ...tracksIn4Weeks.map((track, index) => [
        index + 1,
        track.name,
        "4 Weeks",
        track.imageUrl,
      ]),
    ];

    // 補完したデータを設定
    const completeTracks = fillMissingData(allTracks, periods);

    setData([["Rank", "Track", "Period", "Image"], ...completeTracks]);
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
              const imageUrl = params.value[3];
              const truncatedText =
                text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

              // return `{img|} {text|${truncatedText}}`;
              return `{text|${truncatedText}}`;
            },
            rich: {
              img: {
                backgroundColor: {
                  // image: "1298766_spotify_music_sound_icon.png", // 実際の画像URLに置き換えてください
                  // image: (params) => params.value[3], // ここで動的に画像URLを取得
                  // image: '{imageUrl}', // 動的に取得した画像URLを適用
                  // image: (imageUrl) => imageUrl, // ここで画像URLを参照
                  // image: (params: any) => `url(${params.value[3]})`, // 動的に画像URLを設定
                  // image: (params: any) => {
                  //   // const imageUrl = params.value[3] || '1298766_spotify_music_sound_icon.png'; // 画像URLがない場合にデフォルト画像を指定
                  //   const imageUrl = '1298766_spotify_music_sound_icon.png'; // 画像URLがない場合にデフォルト画像を指定
                  //   return `url(${imageUrl})`;
                  // },
                },
                height: 20,
                width: 20,
                borderRadius: 10,
                align: "center",
              },
              text: {
                color: "white",
                fontSize: 14,
                fontWeight: 100,
              },
            },
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
    return (
      <section id="top" className="top section">
        <div className="container text-center">
          <div className="row justify-content-center">
            <div className="col-lg-12">
              Loading...
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="top" className="top section">
      <div className="container text-center">
        <div className="row justify-content-center">
          <div className="col-lg-12">
            <h2 className="pt-8 menu-title">ランキングチャート</h2>
            <div ref={chartRef} style={{ width: '100%', height: '1200px' }} />
            <h2 className="pt-8 menu-title">Top Tracks in 4 weeks</h2>
            <TrackTable
              accessToken={accessToken || ""}
              tracks={tracksIn4Weeks}
              savedTracks={savedTracks}
              playlists={playlists}
              isShowingPlaylist={false}
              showingPlaylist={{}}
              setSavedTracks={setSavedTracks}
            />
            <h2 className="pt-8 menu-title">Top Tracks in 6 Months</h2>
            <TrackTable
              accessToken={accessToken || ""}
              tracks={tracksIn6Months}
              savedTracks={savedTracks}
              playlists={playlists}
              isShowingPlaylist={false}
              showingPlaylist={{}}
              setSavedTracks={setSavedTracks}
            />
            <h2 className="pt-8 menu-title">Top Tracks of All Time</h2>
            <TrackTable
              accessToken={accessToken || ""}
              tracks={tracksInAllTime}
              savedTracks={savedTracks}
              playlists={playlists}
              isShowingPlaylist={false}
              showingPlaylist={{}}
              setSavedTracks={setSavedTracks}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
