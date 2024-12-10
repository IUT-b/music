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
        <div className="p-1">
          {playlists.map((playlist, index) => (
            <div key={index} className="flex items-center mb-4 cursor-pointer" onClick={() => handlePlaylistSelect(playlist)}>
              {playlist.imageUrl ? (
                <img src={playlist.imageUrl} alt={playlist.name} className="album-art" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 mr-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
                </svg>
              )}
              <span className='px-2 truncate'>{playlist.name}</span>
            </div>
          ))}
          <div className="flex items-center mb-4 cursor-pointer" onClick={() => handleNewPlaylistClick()}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 mr-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
            </svg>
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
