'use client';

import { useEffect, useState } from 'react';
import FavoriteChart from '../components/FavoriteChart';
import { formatDate } from '@/lib/date';

export default function FavoriteTimeline() {
  // const FavoriteTimeline = async () => {
  // const allDbFavorites = await prisma.favorite.findMany({
  //   where: { userSpotifyId },
  //   include: { periods: true },
  // });
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    // 登録済のお気に入り登録期間を取得
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


  }, []);

  // TODO: 複数periodsがある場合に対応できるよう修正
  const graphData = favorites.map((favorite) => {
    return favorite.periods.map((period) => ({
      trackName: favorite.spotifyTrackName,
      startDate: formatDate(period.startDate),  // ISO形式から 'YYYY-MM-DD'に変換
      endDate: period.endDate ? formatDate(period.endDate) : null,  // 解除日があれば変換
    }));
  }).flat();


  console.log(favorites);
  console.log(graphData);

  return (
    <div>
      <FavoriteChart graphData={graphData} />


      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>曲名</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>登録日</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>解除日</th>
          </tr>
        </thead>
        <tbody>
          {favorites.map((favorite, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {favorite.spotifyTrackName}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {favorite.periods[0].startDate}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {favorite.periods[0].endDate}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};






