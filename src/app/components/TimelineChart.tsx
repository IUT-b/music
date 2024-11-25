import React from "react";
import { Chart } from "react-google-charts";

type Favorite = {
  id: number,
  // userSpotifyId: string,
  // spotifyTrackId: string;
  spotifyTrackName: string;
  periods: {
    // id: number,
    // favoriteId: number,
    startDate: string;
    endDate: string | null;
  }[];
};

type TimelineChartProps = {
  favorites: Favorite[];
};

// 日付文字列を Date オブジェクトに変換するヘルパー関数
const parseDate = (date: string | null): Date | null => {
  return date ? new Date(date) : null;
};

const formatFavoritesForTimeline = (favorites: Favorite[]) => {
  const chartData: (string | Date)[][] = [];
  favorites.forEach((favorite) => {
    favorite.periods.forEach((period) => {
      const startDate = parseDate(period.startDate);
      const endDate = parseDate(period.endDate) || new Date(); // null の場合は現在時刻
      if (startDate) {
        chartData.push([favorite.spotifyTrackName, "", startDate, endDate]);
      }
    });
  });
  return chartData;
};



const TimelineChart: React.FC<TimelineChartProps> = ({ favorites }) => {
  const data = [
    ["Track Name", "Event", "Start Date", "End Date"], // ヘッダー
    ...formatFavoritesForTimeline(favorites), // データを整形
  ];

  const options = {
    timeline: {
      showRowLabels: true,
    },
    hAxis: {
      format: "yyyy-MM-dd",
    },
    colors: ["#4285F4"], // 塗りつぶしの色を指定（青）
  };

  // 動的に高さを計算（1行あたり50px）
  const chartHeight = favorites.length * 50;

  return (
    <div>
      <Chart
        chartType="Timeline"
        data={data}
        options={options}
        width="95%"
        height={`${chartHeight}px`} // 動的に高さを設定
      />
    </div>
  );
};

export default TimelineChart;
