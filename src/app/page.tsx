'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from 'react';

export default function Home() {
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      // Spotifyのデータ(ユーザ情報、音楽データ等)を取得し、sessionに保存
      // TODO: ここでsessionにspotifyDataを保存しないと他でエラーになる
      const fetchSpotifyData = async () => {
        try {
          const response = await fetch('/api/spotify');
          if (!response.ok) {
            throw new Error('Failed to fetch top tracks');
          }

          // Spotifyのデータをsessionに保存
          const data = await response.json();
          sessionStorage.setItem('spotifyData', JSON.stringify(data));
        } catch (error) {
          setError(error.message);
        }
      };

      fetchSpotifyData();

    }
  }, [session]);

  if (!session) {
    return (
      <div>
        <h1>You are not signed in</h1>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
    </div>
  );
}
