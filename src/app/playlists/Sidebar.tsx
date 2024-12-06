'use client';

import { useState, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from "recoil";
import { playlistsState, selectedPlaylistState, createPlaylistModeState } from "../state/state";
import { Track, Playlist } from '@/types/spotify';

export default function Sidebar() {
  const [playlists, setPlaylists] = useRecoilState(playlistsState);
  const [selectedPlaylist, setSelectedPlaylist] = useRecoilState(selectedPlaylistState);
  const [createPlaylistMode, setCreatePlaylistMode] = useRecoilState(createPlaylistModeState);

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
