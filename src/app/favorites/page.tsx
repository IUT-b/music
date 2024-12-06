// insightsでお気に入り登録したのがすぐに反映されない
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue } from "recoil";
import { savedTracksState, favoritesState, playlistsState } from "../state/state";
import * as echarts from 'echarts';
import { Track, Playlist } from '@/types/spotify';
import TrackTable from '../components/TrackTable';

export default function InsightsPage() {
  const [spotifyData, setSpotifyData] = useState(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [cacheExpiries, setCacheExpiries] = useState(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const [savedTracks, setSavedTracks] = useRecoilState(savedTracksState);
  const [favorites, setFavorites] = useRecoilState(favoritesState);
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
    // TODO: お気に入り未取得の場合を想定しているが、お気に入りがない場合は別途対応が必要になる
    if (favorites.length === 0) return;

    // トラックデータと期間データを変換する関数
    const formatToChartData = (favorites: Array<{ spotifyTrackName: string, periods: Array<{ startDate: string, endDate: string }> }>) => {
      const trackData: string[][] = [];
      const periodData: (number | number[])[][] = [];

      const trackMap = new Map<string, number>(); // トラック名 -> トラックインデックスのマップ
      let trackIndex = 0;

      favorites.forEach((favorite) => {
        // トラック名をtrackDataに追加
        if (!trackMap.has(favorite.spotifyTrackName)) {
          trackMap.set(favorite.spotifyTrackName, trackIndex);
          trackData.push([favorite.spotifyTrackName]); // トラック名だけ
          trackIndex++;  // インクリメントをここに移動
        }

        favorite.periods.forEach((period) => {
          const startDate = parseDate(period.startDate);
          const endDate = parseDate(period.endDate) || new Date(); // 終了日時がnullなら現在時刻に設定

          if (startDate) {
            const trackIndex = trackMap.get(favorite.spotifyTrackName)!;
            periodData.push([trackIndex, startDate.getTime(), endDate.getTime()]);
          }
        });
      });

      // 最終的にtrackとperiodを一つのオブジェクトにまとめる
      return {
        track: {
          dimensions: ["Name"],
          data: trackData
        },
        period: {
          dimensions: ["Track Index", "Start Date", "End Date"],
          data: periodData
        }
      };
    };

    // 日付文字列を Date オブジェクトに変換するヘルパー関数
    const parseDate = (date: string | null): Date | null => {
      return date ? new Date(date) : null;
    };

    // データを整形
    const chartData = formatToChartData(favorites);

    if (!chartRef.current) return;
    const myChart = echarts.init(chartRef.current);
    let option;

    var DIM_CATEGORY_INDEX = 0;
    var DIM_TIME_ARRIVAL = 1;
    var DIM_TIME_DEPARTURE = 2;

    run(chartData);

    // チャートの描画
    function run(_rawData: any) {
      option = {
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            const trackIndex = params.data[0]; // トラックインデックスを取得
            const startDate = new Date(params.data[1]).toISOString().split('T')[0]; // 開始日 (YYYY-MM-DD形式)
            const endDate = new Date(params.data[2]).toISOString().split('T')[0];   // 終了日 (YYYY-MM-DD形式)
            const trackName = _rawData.track.data[trackIndex][0];
            return `${trackName}<br> ${startDate} - ${endDate}`; // 表示内容をカスタマイズ
          }
        },
        animation: false,
        title: {
          text: 'お気に入りのタイムライン',
          left: 'center'
        },
        // dataZoom: [
        //   {
        //     type: 'slider',
        //     xAxisIndex: 0,
        //     filterMode: 'weakFilter',
        //     height: 20,
        //     bottom: 0,
        //     start: 0,
        //     end: 26,
        //     handleIcon:
        //       'path://M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        //     handleSize: '80%',
        //     showDetail: false
        //   },
        //   {
        //     type: 'inside',
        //     id: 'insideX',
        //     xAxisIndex: 0,
        //     filterMode: 'weakFilter',
        //     start: 0,
        //     end: 26,
        //     zoomOnMouseWheel: false,
        //     moveOnMouseMove: true
        //   },
        //   {
        //     type: 'slider',
        //     yAxisIndex: 0,
        //     zoomLock: true,
        //     width: 10,
        //     right: 10,
        //     top: 70,
        //     bottom: 20,
        //     start: 95,
        //     end: 100,
        //     handleSize: 0,
        //     showDetail: false
        //   },
        //   {
        //     type: 'inside',
        //     id: 'insideY',
        //     yAxisIndex: 0,
        //     start: 95,
        //     end: 100,
        //     zoomOnMouseWheel: false,
        //     moveOnMouseMove: true,
        //     moveOnMouseWheel: true
        //   }
        // ],
        grid: {
          show: true,
          top: 70,
          bottom: 20,
          left: 100,
          right: 20,
          borderWidth: 0
        },
        xAxis: {
          type: 'time',
          position: 'top',
          splitLine: {
            lineStyle: {
              color: ['#E9EDFF']
            }
          },
          axisLine: {
            show: false
          },
          axisTick: {
            lineStyle: {
              color: '#929ABA'
            }
          },
          axisLabel: {
            color: '#929ABA',
            inside: false,
            align: 'center',
            formatter: function (value) {
              const date = new Date(value);
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              return `${year}-${month}-${day}`;
            }
          },
        },
        yAxis: {
          axisTick: { show: false },
          splitLine: { show: false },
          axisLine: { show: false },
          axisLabel: { show: false },
          min: 0,
          max: _rawData.track.data.length
        },
        series: [
          {
            id: 'flightData',
            type: 'custom',
            renderItem: renderGanttItem,
            dimensions: _rawData.period.dimensions,
            encode: {
              x: [DIM_TIME_ARRIVAL, DIM_TIME_DEPARTURE],
              y: DIM_CATEGORY_INDEX,
              tooltip: [DIM_CATEGORY_INDEX, DIM_TIME_ARRIVAL, DIM_TIME_DEPARTURE]
            },
            data: _rawData.period.data
          },
          {
            type: 'custom',
            renderItem: renderAxisLabelItem,
            dimensions: _rawData.track.dimensions,
            encode: {
              x: -1,
              y: 0
            },
            data: _rawData.track.data.map(function (item, index) {
              return [index].concat(item);
            })
          }
        ]
      };

      function renderGanttItem(params, api) {
        var categoryIndex = api.value(DIM_CATEGORY_INDEX);
        var timeArrival = api.coord([api.value(DIM_TIME_ARRIVAL), categoryIndex]);
        var timeDeparture = api.coord([api.value(DIM_TIME_DEPARTURE), categoryIndex]);
        var barLength = timeDeparture[0] - timeArrival[0];
        // Get the heigth corresponds to length 1 on y axis.
        var barHeight = api.size([0, 1])[1] * 0.6;
        var x = timeArrival[0];
        var y = timeArrival[1] - barHeight;
        var rectNormal = clipRectByRect(params, {
          x: x,
          y: y,
          width: barLength,
          height: barHeight
        });
        return {
          type: 'group',
          children: [
            {
              type: 'rect',
              ignore: !rectNormal,
              shape: rectNormal,
              style: {
                ...api.style(),
                fill: '#4ade80'  // バーの色を設定
              }
            }
          ]
        };
      }
      function renderAxisLabelItem(params, api) {
        var y = api.coord([0, api.value(0)])[1];
        if (y < params.coordSys.y + 5) {
          return;
        }
        return {
          type: 'group',
          position: [10, y],
          children: [
            // {
            //   type: 'image',
            //   style: {
            //     x: 50,
            //     y: -20,
            //     image: '1298766_spotify_music_sound_icon.png',
            //     width: 30,
            //     height: 30
            //   }
            // },
            {
              type: 'text',
              style: {
                x: 24,
                y: -3,
                text: api.value(1),
                textVerticalAlign: 'bottom',
                textFill: '#fff',
                fontWeight: 'bold'
              }
            }
          ]
        };
      }
      function clipRectByRect(params, rect) {
        return echarts.graphic.clipRectByRect(rect, {
          x: params.coordSys.x,
          y: params.coordSys.y,
          width: params.coordSys.width,
          height: params.coordSys.height
        });
      }

      myChart.setOption(option);
    }

    option && myChart.setOption(option);

    // クリーンアップ
    return () => {
      myChart.dispose();
    };
  }, [favorites]);


  return (
    <div className="px-12">
      <TrackTable
        accessToken={accessToken}
        title=""
        tracks={savedTracks}
        savedTracks={savedTracks}
        playlists={playlists}
        isShowingPlaylist={false}
        showingPlaylist={{}}
        setSavedTracks={setSavedTracks}
      />
      <div ref={chartRef} style={{ width: '100%', height: '1600px' }} />
    </div>
  );
};
