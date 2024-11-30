'use client';

import { useState, useEffect } from 'react';
import { useRecoilValue } from "recoil";
import { selectedPlaylistState } from "../state/state";
import { createPlaylist } from '@/lib/spotify';
import { Track, Playlist } from '@/types/spotify';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import TrackTable from '../components/TrackTable';

export default function PlaylistsPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [savedTracks, setSavedTracks] = useState<Track[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);        // For success message

  const selectedPlaylist = useRecoilValue(selectedPlaylistState);

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

  // プレイリストを作成
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const newPlaylist = await createPlaylist(accessToken, name, description, isPublic);

      // プレイリストをローカルに追加してUIを即時更新
      setPlaylists((prev) => [
        {
          name: newPlaylist.name,
          description: newPlaylist.description,
          imageUrl: newPlaylist.images[0]?.url || null,
          // imageUrl: newPlaylist.images[0]?.url || '/default-playlist-image.png',
          tracks: [], // 初期では曲なし
        },
        ...prev, // 既存のプレイリストを追加
      ]);
    } catch (error) {
      //   setError(error.message);
    }
  };

  if (playlists.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex">
        {/* 右側に選択されたプレイリストの曲を表示 */}
        <div className="w-3/4 p-4">
          {selectedPlaylist ? (
            // {activeItem ? (
            <div>
              <div className="flex items-center justify-center">
                <img src={selectedPlaylist.imageUrl} alt={selectedPlaylist.name} width={200} height={200} />
                <span className="px-2 text-5xl font-bold">{selectedPlaylist.name}</span>
              </div>
              <TrackTable
                accessToken={accessToken}
                title={selectedPlaylist.name}
                tracks={selectedPlaylist.tracks}
                savedTracks={savedTracks}
                playlists={playlists}
                isShowingPlaylist={true}
                showingPlaylist={selectedPlaylist}
                setSavedTracks={setSavedTracks}
              />
            </div>
          ) : (
            <p>プレイリストを選択してください。</p>
          )}
        </div>

        {/* プレイリスト作成フォーム */}
        <div className="w-1/3">
          <h1>プレイリスト作成</h1>
          <form onSubmit={handleSubmit} className="max-w-lg p-6 rounded-lg">
            {/* プレイリスト名 */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">プレイリスト名</label>
              <Input
                type="text"
                id="name"
                value={name}
                onChange={setName}
                required
              />
            </div>

            {/* プレイリストの説明 */}
            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">プレイリストの説明</label>
              <Input
                type="text"
                id="description"
                value={description}
                onChange={setDescription}
              />
            </div>

            {/* 公開設定 */}
            <div className="mb-4">
              <label htmlFor="isPublice" className="block text-gray-700 text-sm font-bold mb-2">公開設定</label>
              <Select
                id="isPublice"
                options={[
                  { value: false, label: '' },
                  { value: true, label: '公開' },
                  { value: false, label: '非公開' },
                ]}
                value={isPublic}
                onChange={setIsPublic}
              />
            </div>

            {/* エラーメッセージと成功メッセージ */}
            <div className="mb-4">
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {message && <p className="text-green-500 text-sm">{message}</p>}
            </div>

            <Button type="submit" label="プレイリスト作成" />
          </form>
        </div>
      </div>
      <style jsx>{`
        .playlist {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .album-art {
          width: 50px;
          height: 50px;
          border-radius: 5px;
          margin-right: 10px;
        }

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
