'use client';

import { useState, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from "recoil";
import { selectedPlaylistState, createPlaylistModeState } from "../state/state";
import { Track, Playlist } from '@/types/spotify';

export default function Sidebar() {
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

  return (
    <div>
      <div className="flex">
        <div className="p-4">
          <div>Top Tracks in 4 Weeks</div>
          <div>Top Tracks in 6 Months</div>
          <div>Top Tracks of All Time</div>
          <div>お気に入り</div>
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
