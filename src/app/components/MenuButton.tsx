'use client';

import React from "react";
import { useState, useRef, useEffect } from 'react';
import { addTrackToSavedTracks, removeTrackFromSavedTracks } from '@/lib/spotify';

type Track = {
  id: string;
  name: string;
  artist: string;
  album: string;
  imageUrl: string;
  popularity: number;
  trackUrl: string;
};

type Playlist = {
  id: string;
  name: string;
};

interface Props {
  accessToken: string;
  selectedTrack: Track[];
  playlists: Playlist[];
  isShowingPlaylist: boolean;
  savedTracks: Track[];
  setSavedTracks: React.Dispatch<React.SetStateAction<Track[]>>;
}

export default function MenuButton({ accessToken, selectedTrack, playlists, isShowingPlaylist, savedTracks, setSavedTracks }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);

  // メニュー外をクリックした場合にメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // モーダルを開く
  const openModal = () => {
    setIsModalOpen(true);
  };

  // モーダルを開く
  const openModal2 = () => {
    setIsModalOpen2(true);
  };

  // モーダルを閉じる
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // モーダルを閉じる
  const closeModal2 = () => {
    setIsModalOpen2(false);
  };

  // Spotifyとデータベースのお気に入りを同期
  const syncFavoritesWithSpotify = async () => {
    try {
      const response = await fetch('/api/favorite/syncFavorites');

      if (response.ok) {
        // await response.json();
      } else {
        throw new Error('Failed to sync favorites');
      }
    } catch (error) {
      console.error('Error syncing favorites:', error);
    }
  };

  // お気に入りに追加
  const handleAddToFavorites = async () => {
    try {
      // TODO: お気に入りに登録済の場合の処理が必要
      await addTrackToSavedTracks(accessToken, [selectedTrack.id]);

      syncFavoritesWithSpotify();

      setSavedTracks([...savedTracks, selectedTrack]);

      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  // お気に入りから削除
  const handleRemoveFromFavorites = async () => {
    try {
      await removeTrackFromSavedTracks(accessToken, [selectedTrack.id]);

      syncFavoritesWithSpotify();

      setSavedTracks(savedTracks.filter((track) => track.id !== selectedTrack.id));

      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  // プレイリストに追加
  const handleAddToPlaylist = async (playlist: Playlist) => {
    try {
      const response = await fetch('/api/spotify/addTrackToPlaylist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playlistId: playlist.id,
          trackUris: [`spotify:track:${trackId}`],
        }),
      });

      setIsModalOpen(false);

      if (response.ok) {
        // console.log(`Track ${track.name} added to playlist ${playlist.name}`);
      } else {
        throw new Error('Failed to add track to playlist');
      }
    } catch (error) {
      console.error('Error adding track to playlist:', error);
    }
  };

  // プレイリストから削除
  const handleRemoveFromPlaylist = async () => {
    try {
      await removeTrackFromSavedTracks(accessToken, [trackId]);
      console.log(`Removed track ${trackId} from favorites.`);

      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="inline-flex items-center justify-center w-8 h-8 rounded-full"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="0.5"></circle>
          <circle cx="19" cy="12" r="0.5"></circle>
          <circle cx="5" cy="12" r="0.5"></circle>
        </svg>
      </button>

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-300 shadow-lg rounded-md z-50"
        >
          <ul>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={openModal}>プレイリストに追加</li>
            {isShowingPlaylist && (
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={handleRemoveFromPlaylist}>プレイリストから削除</li>
            )}
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={handleAddToFavorites}>お気に入りに追加</li>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={handleRemoveFromFavorites}>お気に入りから削除</li>
          </ul>
        </div>
      )}

      {/* プレイリストへ追加モーダル */}
      {isModalOpen2 && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeModal} // 外側をクリックで閉じる
        >
          <div
            className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // モーダル内クリックで閉じない
          >
            <h2 className="text-lg font-bold mb-4">プレイリストを選択</h2>
            <ul className="space-y-4">
              {playlists.map((playlist) => (
                <li key={playlist.id}>
                  <button
                    onClick={() => handleAddToPlaylist(playlist)}
                    className="w-full text-left py-2 px-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    {playlist.name}
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={closeModal2}
              className="mt-4 bg-red-500 text-white py-2 px-4 rounded-lg"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* プレイリストから削除モーダル */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeModal} // 外側をクリックで閉じる
        >
          <div
            className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // モーダル内クリックで閉じない
          >
            <h2 className="text-lg font-bold mb-4">プレイリストを選択</h2>
            <ul className="space-y-4">
              {playlists.map((playlist) => (
                <li key={playlist.id}>
                  <button
                    onClick={() => handleAddToPlaylist(playlist)}
                    className="w-full text-left py-2 px-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    {playlist.name}
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={closeModal}
              className="mt-4 bg-red-500 text-white py-2 px-4 rounded-lg"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
