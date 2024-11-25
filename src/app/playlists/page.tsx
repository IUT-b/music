'use client';

import { useState, useEffect } from 'react';

type Playlist = {
  name: string;
  description: string;
  imageUrl: string;
};

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  // const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const spotifyData = sessionStorage.getItem('spotifyData');
    if (spotifyData) {
      setPlaylists(JSON.parse(spotifyData).playlists);
    }
  }, []);

  // if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Spotify Playlists</h1>

      <ul>
        {playlists.map((playlist, index) => (
          <li key={index}>
            <img src={playlist.imageUrl} alt={playlist.name} width={50} height={50} />
            <p>{index + 1}. {playlist.name}</p>
            <p>Name: {playlist.name}</p>
            <p>Desctiption: {playlist.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
