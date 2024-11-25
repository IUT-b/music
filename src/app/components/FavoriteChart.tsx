import React, { useEffect, useRef, useState } from 'react';

const FavoriteChart = ({ graphData }: { graphData: any }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(window.innerWidth * 0.8);

  useEffect(() => {
    // リサイズイベントでキャンバス幅を更新
    const handleResize = () => {
      setCanvasWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // トラック数に基づいてキャンバスの高さを調整
    const trackCount = new Set(graphData.map(({ trackName }) => trackName)).size;
    const canvasHeight = trackCount * 100; // 各トラックの高さを 100px として、トラック数に基づいて高さを決定
    canvas.height = canvasHeight;

    // キャンバス幅を画面幅に合わせる
    canvas.width = canvasWidth;

    // 日付範囲を表示するためのデータ準備
    const labels = Array.from(
      new Set(
        graphData
          .flatMap(({ startDate, endDate }) => {
            // endDate が null の場合、現在の日付を使う
            const endDateOrNow = endDate ? new Date(endDate) : new Date();
            return [startDate, endDateOrNow.toISOString()];
          })
          .filter(Boolean)
          .sort()
      )
    );

    // 日付スケールを計算
    const scale = canvasWidth / (new Date(labels[labels.length - 1]).getTime() - new Date(labels[0]).getTime());

    // 背景をクリア
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // トラック名をユニークな値として抽出
    const trackNames = Array.from(new Set(graphData.map(({ trackName }) => trackName)));

    // 固定の幅を設定（曲名表示領域）
    const trackNameWidth = 120; // 曲名表示領域の幅を 120px に固定
    const textPadding = 10; // 曲名と塗りつぶし矩形の間のスペース

    // トラックごとに描画
    trackNames.forEach((trackName, index) => {
      const trackData = graphData.filter((item) => item.trackName === trackName);

      // 各トラックのデータに対して塗りつぶしを描画
      trackData.forEach(({ startDate, endDate }) => {
        // endDate が null の場合、現在の日付を使用
        const endDateOrNow = endDate ? new Date(endDate) : new Date();

        // startDate と endDate を時間に変換してX座標を計算
        const startX = (new Date(startDate).getTime() - new Date(labels[0]).getTime()) * scale;
        const endX = (endDateOrNow.getTime() - new Date(labels[0]).getTime()) * scale;

        // トラックごとのY座標を設定
        const y = 50 + index * 100; // 各トラックの間隔を100pxに設定

        // 塗りつぶし（矩形）を描画
        ctx.fillStyle = 'rgba(75, 192, 192, 0.5)';
        ctx.fillRect(startX, y, endX - startX, 40);

        // 曲名を塗りつぶしの左側に表示（背景色を透明）
        ctx.fillStyle = 'black';
        ctx.font = '14px Arial';

        // 曲名が長すぎる場合、省略する
        const truncatedTrackName = trackName.length > 10 ? trackName.slice(0, 10) + '...' : trackName;

        // 曲名の表示位置を調整
        ctx.fillText(truncatedTrackName, startX - trackNameWidth - textPadding, y + 25); // 曲名を矩形の左側に表示
      });
    });

    // 日付目盛りを描画
    labels.forEach((label) => {
      const x = (new Date(label).getTime() - new Date(labels[0]).getTime()) * scale;
      ctx.fillStyle = 'black';
      ctx.fillText(label, x, canvasHeight - 10); // 日付目盛りの描画

      // 目盛りの位置に線を引く
      ctx.beginPath();
      ctx.moveTo(x, canvasHeight - 20);
      ctx.lineTo(x, canvasHeight - 5);
      ctx.strokeStyle = 'black';
      ctx.stroke();
    });
  }, [graphData, canvasWidth]); // canvasWidth が変わったときにも再描画するように依存関係に追加

  return <canvas ref={canvasRef} />;
};

export default FavoriteChart;






// import React, { useEffect, useRef } from 'react';
// import {
//   Chart,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   LineController,
// } from 'chart.js';

// // 必要なモジュールを登録
// Chart.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   LineController
// );

// const FavoriteChart = ({ graphData }: { graphData: any }) => {
//   graphData = [
//     { "trackName": "Track A", "startDate": "2024-01-01", "endDate": "2024-02-01" },
//     { "trackName": "Track B", "startDate": "2024-01-15", "endDate": null },
//     { "trackName": "Track C", "startDate": "2024-02-01", "endDate": "2024-03-01" }
//   ];


//   const chartRef = useRef<HTMLCanvasElement>(null);
//   const chartInstanceRef = useRef<Chart | null>(null);

//   useEffect(() => {
//     if (!chartRef.current) return;

//     // 古いチャートを破棄
//     if (chartInstanceRef.current) {
//       chartInstanceRef.current.destroy();
//     }

//     const ctx = chartRef.current.getContext('2d');
//     if (!ctx) return;

//     // 日付ラベルの作成
//     const labels = Array.from(
//       new Set(
//         graphData
//           .flatMap(({ startDate, endDate }) =>
//             endDate ? [startDate, endDate] : [startDate]
//           )
//           .sort()
//       )
//     );

//     // トラック名の取得
//     const trackNames = [...new Set(graphData.map((item) => item.trackName))];

//     // データセットの作成
//     const datasets = trackNames.map((trackName) => {
//       const trackData = graphData.filter((item) => item.trackName === trackName);
//       const data = labels.map((label, index) => {
//         const trackEntry = trackData.find(
//           ({ startDate, endDate }) =>
//             label >= startDate && (endDate === null || label <= endDate)
//         );
//         return trackEntry ? { x: index, y: trackNames.indexOf(trackName) } : null;
//       }).filter((point) => point !== null); // nullデータを除外

//       return {
//         label: trackName,
//         data: data as { x: number; y: number }[], // 型を明示
//         borderColor: 'rgba(75, 192, 192, 1)', // 線の色
//         borderWidth: 2, // 線を太く
//         backgroundColor: 'rgba(75, 192, 192, 0.2)',
//         fill: false, // 塗りつぶし無効化
//         tension: 0.1, // 曲線を適用
//       };
//     });

//     // チャートを描画
//     chartInstanceRef.current = new Chart(ctx, {
//       type: 'line',
//       data: {
//         labels: labels,
//         datasets: datasets,
//       },
//       options: {
//         responsive: true,
//         spanGaps: true, // ギャップを埋める
//         plugins: {
//           legend: {
//             display: true, // 凡例を表示
//           },
//           title: {
//             display: true,
//             text: 'Favorite Tracks Timeline', // タイトル
//           },
//         },
//         scales: {
//           x: {
//             type: 'linear', // X軸を連続値に設定
//             ticks: {
//               callback: (value) => labels[value as number], // ラベルを表示
//             },
//             title: {
//               display: true,
//               text: 'Date', // X軸タイトル
//             },
//           },
//           y: {
//             type: 'category', // Y軸はカテゴリ型
//             labels: trackNames,
//             title: {
//               display: true,
//               text: 'Track Name', // Y軸タイトル
//             },
//           },
//         },
//       },
//     });

//     // クリーンアップ処理
//     return () => {
//       if (chartInstanceRef.current) {
//         chartInstanceRef.current.destroy();
//       }
//     };
//   }, [graphData]);

//   return <canvas ref={chartRef} />;
// };

// export default FavoriteChart;
