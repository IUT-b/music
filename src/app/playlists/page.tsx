'use client';

import { useState, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from "recoil";
import { savedTracksState, playlistsState, selectedPlaylistState, createPlaylistModeState } from "../state/state";
import { createPlaylist } from '@/lib/spotify';
import { Track, Playlist } from '@/types/spotify';
import SharedLayout from "../components/SharedLayout";
import Sidebar from "./Sidebar";
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import TrackTable from '../components/TrackTable';

export default function PlaylistsPage() {
  const [spotifyData, setSpotifyData] = useState(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [cacheExpiries, setCacheExpiries] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);        // For success message

  const [savedTracks, setSavedTracks] = useRecoilState(savedTracksState);
  const [playlists, setPlaylists] = useRecoilState(playlistsState);
  const selectedPlaylist = useRecoilValue(selectedPlaylistState);
  const createPlaylistMode = useRecoilValue(createPlaylistModeState);

  useEffect(() => {
    // セッションを取得
    const data = sessionStorage.getItem('spotifyData');

    if (data) {
      setSpotifyData(JSON.parse(data));
    }
    else {
      // セッションがない場合は作成
      console.log('Start session')
      const fetchSpotifyData = async () => {
        try {
          const response = await fetch('/api/spotify');
          if (!response.ok) {
            throw new Error('Failed to fetch top tracks');
          }

          const data = await response.json();
          sessionStorage.setItem('spotifyData', JSON.stringify(data));
          setSpotifyData(data);
        } catch (error) {
          if (error instanceof Error) {
            setError(error.message);
          } else {
            setError('An unknown error occurred');
          }
        }
      };
      fetchSpotifyData();

      // キャッシュの有効期限を更新
      fetch('/api/spotify/cacheExpiry', {
        method: 'POST',
        body: JSON.stringify({
          types: ['user', 'topTracks', 'playlists', 'devices', 'savedTracks'],
        }),
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // キャッシュの有効期限を取得
    const fetchCacheExpiries = async () => {
      try {
        const response = await fetch('/api/spotify/cacheExpiry');
        if (response.ok) {
          const data = await response.json();
          setCacheExpiries(data);
        } else {
          throw new Error('Failed to fetch cache expiries');
        }
      } catch (error) {
        console.error('Error fetching cache expiries:', error);
      }
    };
    fetchCacheExpiries();

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
  }, []);

  useEffect(() => {
    if (!spotifyData || !cacheExpiries) return;

    // お気に入りを取得
    const savedTracksCacheExpiry = cacheExpiries.find((item: { type: string }) => item.type === 'savedTracks');
    const isSavedTracksCacheValid = new Date(savedTracksCacheExpiry?.expiresAt).getTime() > new Date().getTime();

    // キャッシュが有効な場合
    if (isSavedTracksCacheValid) {
      // NOTE: 取得済の場合はアプリ上でデータが変わっている場合があるのでアプリ上のデータを使用する
      if (savedTracks.length === 0) setSavedTracks(spotifyData.savedTracks);
    }
    // 有効期限切れのとき
    else {
      console.log('Cache expired');
      // データ取得
      const fetchSavedTracks = async () => {
        try {
          const response = await fetch('/api/spotify?data=savedTracks');

          if (response.ok) {
            const data = await response.json();
            setSavedTracks(data.savedTracks);

            // セッションに保存
            const currentSessionData = sessionStorage.getItem('spotifyData');
            let updatedSessionData = {};
            if (currentSessionData) updatedSessionData = JSON.parse(currentSessionData);
            updatedSessionData.savedTracks = data.savedTracks;
            sessionStorage.setItem('spotifyData', JSON.stringify(updatedSessionData));

            // キャッシュを更新
            await fetch('/api/spotify/cacheExpiry', {
              method: 'POST',
              body: JSON.stringify({
                types: ['savedTracks'],
              }),
              headers: { 'Content-Type': 'application/json' },
            });
          } else {
            throw new Error('Failed to fetch favorites');
          }
        } catch (error) {
          console.error('Error fetching favorites:', error);
        }
      };
      fetchSavedTracks();
    }

    // プレイリストを取得
    const playlistsCacheExpiry = cacheExpiries.find((item: { type: string }) => item.type === 'playlists');
    const isPlaylistsCacheValid = new Date(playlistsCacheExpiry?.expiresAt).getTime() > new Date().getTime();

    // キャッシュが有効な場合かつ未取得の場合
    if (isPlaylistsCacheValid) {
      if (playlists.length === 0) setPlaylists(spotifyData.playlists);
    }
    // 有効期限切れのとき
    else {
      console.log('Cache expired');
      // データ取得
      const fetchPlaylists = async () => {
        try {
          const response = await fetch('/api/spotify?data=playlists');

          if (response.ok) {
            const data = await response.json();
            setPlaylists(data.playlists);

            // セッションに保存
            const currentSessionData = sessionStorage.getItem('spotifyData');
            let updatedSessionData = {};
            if (currentSessionData) updatedSessionData = JSON.parse(currentSessionData);
            updatedSessionData.playlists = data.playlists;
            sessionStorage.setItem('spotifyData', JSON.stringify(updatedSessionData));

            // キャッシュを更新
            await fetch('/api/spotify/cacheExpiry', {
              method: 'POST',
              body: JSON.stringify({
                types: ['playlists'],
              }),
              headers: { 'Content-Type': 'application/json' },
            });
          } else {
            throw new Error('Failed to fetch playlists');
          }
        } catch (error) {
          console.error('Error fetching playlists:', error);
        }
      };
      fetchPlaylists();
    }
  }, [spotifyData, cacheExpiries]);

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
    <section id="about" className="top section">
      <div className="container">
        <h2 className="row justify-content-center py-8 text-gray-500">プレイリスト</h2>
        <div className="row gy-4">
          <div className="col-lg-3">
            <Sidebar />
          </div>
          <div className="col-lg-9 content">
            {createPlaylistMode ? (
              // プレイリスト作成画面
              <div>
                <h1>プレイリスト作成</h1>
                <form onSubmit={handleSubmit} className="max-w-lg p-6 rounded-lg">
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-bold mb-2">プレイリスト名</label>
                    <Input
                      type="text"
                      id="name"
                      value={name}
                      onChange={setName}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-bold mb-2">プレイリストの説明</label>
                    <Input
                      type="text"
                      id="description"
                      value={description}
                      onChange={setDescription}
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="isPublice" className="block text-sm font-bold mb-2">公開設定</label>
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
            ) : (
              // プレイリスト画面
              <div>
                {selectedPlaylist ? (
                  <div>
                    <div className="flex items-center justify-center">
                      <img src={selectedPlaylist.imageUrl || "/9025653_music_notes_icon.png"} alt={selectedPlaylist.name} width={200} height={200} />
                      <span className="px-2 text-5xl font-bold">{selectedPlaylist.name}</span>
                    </div>
                    <TrackTable
                      accessToken={accessToken}
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
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
