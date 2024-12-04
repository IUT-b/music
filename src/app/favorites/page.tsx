'use client';

import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { Track } from '@/types/spotify';
import TrackTable from '../components/TrackTable';

export default function InsightsPage() {
  const [spotifyId, setSpotifyId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [savedTracks, setSavedTracks] = useState<Track[]>([]);
  const [favorites, setFavorites] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<any[]>([]);

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
    console.log(favorites);

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

    console.log(chartData);

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
