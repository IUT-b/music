'use client';

import { useState, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from "recoil";
import { selectedPlaylistState, createPlaylistModeState } from "../state/state";
import { Track, Playlist } from '@/types/spotify';

export default function Sidebar() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [savedTracks, setSavedTracks] = useState<Track[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);        // For success message

  const [selectedPlaylist, setSelectedPlaylist] = useRecoilState(selectedPlaylistState);
  const [createPlaylistMode, setCreatePlaylistMode] = useRecoilState(createPlaylistModeState);

  useEffect(() => {
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

    // プレイリストを取得
    const fetchPlaylists = async () => {
      try {
        const response = await fetch('/api/spotify?data=playlists');

        if (response.ok) {
          const data = await response.json();
          setPlaylists(data.playlists);
        } else {
          throw new Error('Failed to fetch top tracks');
        }
      } catch (error) {
        console.error('Error fetching top tracks:', error);
      }
    };
    fetchPlaylists();

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
  }, []);

  // プレイリストを選択
  const handlePlaylistSelect = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setCreatePlaylistMode(false);
  };

  const handleNewPlaylistClick = () => {
    setCreatePlaylistMode(true);
  };


  if (playlists.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex">
        <div className="p-4">
          {playlists.map((playlist, index) => (
            <div key={index} className="flex items-center mb-4 cursor-pointer" onClick={() => handlePlaylistSelect(playlist)}>
              <img src={playlist.imageUrl || "/9025653_music_notes_icon.png"} alt={playlist.name} className="album-art" />
              <span className='px-2 truncate'>{playlist.name}</span>
            </div>
          ))}
          <div className="flex items-center mb-4 cursor-pointer" onClick={() => handleNewPlaylistClick()}>
            <img src="/9025788_music_notes_plus_icon.png" alt="新規作成" width={50} height={50} />
            <span className='px-2 truncate'>新規作成</span>
          </div>
        </div>
      </div>
      <style jsx>{`
        .truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px; /* 最大幅を設定（調整可） */
        }
    `}</style>
    </div>

  );
}
