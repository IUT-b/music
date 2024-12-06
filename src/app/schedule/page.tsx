'use client';

import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from "recoil";
import { playlistsState } from "../state/state";
import { Device } from '@/types/spotify';
import Select from '../components/Select';
import Input from '../components/Input';
import Button from '../components/Button';
import { formatDate } from '@/lib/date';

export default function SchedulePage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [scheduledDeviceId, setScheduledDeviceId] = useState<string | null>(null);
  const [scheduledPlaylistId, setScheduledPlaylistId] = useState<string | null>(null);
  const [time, setTime] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<any[]>([]);

  const [playlists, setPlaylists] = useRecoilState(playlistsState);

  useEffect(() => {
    const spotifyData = sessionStorage.getItem('spotifyData');
    if (spotifyData) {
      setDevices(JSON.parse(spotifyData).devices);
      setPlaylists(JSON.parse(spotifyData).playlists);
    }

    // 登録済のスケジュールを取得
    const fetchSchedules = async () => {
      try {
        const response = await fetch('/api/schedule');
        if (response.ok) {
          const data = await response.json();
          setSchedules(data);
        } else {
          throw new Error('Failed to fetch schedules');
        }
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }
    };
    fetchSchedules();
  }, []);

  // 登録済のスケジュールを実行
  const initializeSchedules = async () => {
    try {
      const response = await fetch('/api/schedule/initialize');
      if (response.ok) {
        console.log('Initialize schedules')
      } else {
        throw new Error('Failed to fetch schedules');
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  // スケジュールをデータベースへ保存
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!scheduledDeviceId || !scheduledPlaylistId || !time) {
      setError('All fields are required');
      return;
    }

    const selectedDevice = devices.find((device) => device.id === scheduledDeviceId);
    if (!selectedDevice) {
      setError('Invalid device selected');
      return;
    }

    const selectedPlaylist = playlists.find((playlist) => playlist.id === scheduledPlaylistId);
    if (!selectedPlaylist) {
      setError('Invalid playlist selected');
      return;
    }

    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId: selectedDevice.id,
          deviceName: selectedDevice.name,
          playlistId: selectedPlaylist.id,
          playlistName: selectedPlaylist.name,
          time: new Date(time).toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create schedule');
      }

      const newSchedule = await response.json();
      setSchedules((prev) => [...prev, newSchedule]);

      // Reset the form
      setScheduledDeviceId(null);
      setScheduledPlaylistId(null);
      setTime('');

      // NOTE: 実行した時点で他のユーザー含めて全てのスケジュールを取得し、それに従って再生する。個別のユーザーのスケジュールのみでもよいか
      // この後登録したスケジュールを再生するには再度実行する必要がある
      // スケジュール保存と同期しているか要確認(スケジュール保存前に実行されていないか)
      initializeSchedules();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  return (
    <div className="px-12 flex justify-between">
      <div className="w-2/3 pr-6">
        <h2>スケジュール</h2>
        <table className="min-w-full table-auto text-left text-sm text-gray-500">
          <thead>
            <tr>
              <th scope="col" className="px-6 py-3 font-medium">日付</th>
              <th scope="col" className="px-6 py-3 font-medium">プレイリスト</th>
              <th scope="col" className="px-6 py-3 font-medium">デバイス</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule, index) => (
              <tr className="border-b" key={index}>
                <td className="py-3">{formatDate(schedule.time)}</td>
                <td>{schedule.playlistName}</td>
                <td>{schedule.deviceName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="w-1/3">
        <h1>スケジュール設定</h1>
        <form onSubmit={handleSubmit} className="max-w-lg p-6 rounded-lg">
          {/* デバイス選択 */}
          <div className="mb-4">
            <label htmlFor="device" className="block text-gray-500 text-sm font-bold mb-2">デバイス</label>
            <Select
              id="device"
              options={[
                { value: '', label: 'Select a device' },
                ...devices.map((device) => ({
                  value: device.id,
                  label: device.name,
                })),
              ]}
              value={scheduledDeviceId || ""}
              onChange={setScheduledDeviceId}
            />
          </div>

          {/* プレイリスト選択 */}
          <div className="mb-4">
            <label htmlFor="playlist" className="block text-gray-500 text-sm font-bold mb-2">プレイリスト</label>
            <Select
              id="playlist"
              options={[
                { value: '', label: 'Select a playlist' },
                ...playlists.map((playlist) => ({
                  value: playlist.id,
                  label: playlist.name,
                })),
              ]}
              value={scheduledPlaylistId || ""}
              onChange={setScheduledPlaylistId}
            />
          </div>

          {/* 時間選択 */}
          <div className="mb-4">
            <label htmlFor="time" className="block text-gray-500 text-sm font-bold mb-2">日時</label>
            <Input
              type="datetime-local"
              id="time"
              value={time}
              onChange={setTime}
              required
            />
          </div>

          {/* エラーメッセージと成功メッセージ */}
          <div className="mb-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {message && <p className="text-green-500 text-sm">{message}</p>}
          </div>

          <Button type="submit" label="保存" />
        </form>
      </div>
    </div>
  );
};
