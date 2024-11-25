'use client';

import { useEffect, useState } from 'react';
import TimelineChart from "../components/TimelineChart";

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

  return (
    <div>

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






