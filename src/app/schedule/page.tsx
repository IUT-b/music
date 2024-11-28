'use client';

import { useEffect, useState } from 'react';
import Select from '../components/Select';
import Input from '../components/Input';
import Button from '../components/Button';
import { formatDate } from '@/lib/date';

type Playlist = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
};

type Device = {
  id: string;
  name: string;
};

export default function SchedulePage() {
  const [devices, setDevices] = useState<Device[]>([]);                       // 登録済の全デバイス
  const [scheduledDevice, setScheduledDevice] = useState('');                 // スケジュール再生するデバイス
  // const [scheduledDevice, setScheduledDevice] = useState<{ id: string; name: string } | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);                 // 登録済の全プレイリスト
  const [scheduledPlaylist, setScheduledPlaylist] = useState('');             // スケジュール再生するプレイリスト
  // const [scheduledPlaylist, setScheduledPlaylist] = useState<{ id: string; name: string } | null>(null);
  const [time, setTime] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);        // For success message
  const [schedules, setSchedules] = useState<any[]>([]);              // State for fetching schedules

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


  // const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const selectedId = e.target.value;
  //   const selectedDevice = devices.find((device) => device.id === selectedId);
  //   setScheduledDevice(selectedDevice || null);
  // };


  // スケジュールをデータベースへ保存
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!scheduledDevice || !scheduledPlaylist || !time) {
      setError('All fields are required');
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
          deviceId: scheduledDevice,
          playlistId: scheduledPlaylist,
          time: new Date(time).toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create schedule');
      }

      const newSchedule = await response.json();
      setSchedules((prev) => [...prev, newSchedule]);

      // Reset the form
      setScheduledDevice('');
      setScheduledPlaylist('');
      setTime('');

      // NOTE: 実行した時点で他のユーザー含めて全てのスケジュールを取得し、それに従って再生する。個別のユーザーのスケジュールのみでもよいか
      // この後登録したスケジュールを再生するには再度実行する必要がある
      // スケジュール保存と同期しているか要確認(スケジュール保存前に実行されていないか)
      initializeSchedules();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex justify-between">
      <div className="w-2/3 pr-6">
        <h2>Your Scheduled Playlists</h2>
        <table className="min-w-full table-auto text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 font-medium text-gray-900 dark:text-white">Date</th>
              <th scope="col" className="px-6 py-3 font-medium text-gray-900 dark:text-white">Playlist</th>
              <th scope="col" className="px-6 py-3 font-medium text-gray-900 dark:text-white">Device</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800">
            {schedules.map((schedule, index) => (
              <tr className="border-b border-gray-200 dark:border-gray-600" key={index}>
                <td className="px-6 py-4">{formatDate(schedule.time)}</td>
                <td className="px-6 py-4">{schedule.playlistId}</td>
                <td className="px-6 py-4">{schedule.deviceId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 入力フォームを右側に配置 */}
      <div className="w-1/3">
        <h1>Schedule Playlist</h1>
        <form onSubmit={handleSubmit} className="max-w-lg p-6 rounded-lg">
          {/* デバイス選択 */}
          <div className="mb-4">
            <label htmlFor="device" className="block text-gray-700 text-sm font-bold mb-2">Device</label>
            <Select
              id="device"
              options={[
                { value: '', label: 'Select a device' },
                ...devices.map((device) => ({
                  value: device.id,
                  label: device.name,
                })),
              ]}
              value={scheduledDevice}
              onChange={setScheduledDevice}
            />
          </div>

          {/* プレイリスト選択 */}
          <div className="mb-4">
            <label htmlFor="playlist" className="block text-gray-700 text-sm font-bold mb-2">Playlist</label>
            <Select
              id="playlist"
              options={[
                { value: '', label: 'Select a playlist' },
                ...playlists.map((playlist) => ({
                  value: playlist.id,
                  label: playlist.name,
                })),
              ]}
              value={scheduledPlaylist}
              onChange={setScheduledPlaylist}
            />
          </div>

          {/* 時間選択 */}
          <div className="mb-4">
            <label htmlFor="time" className="block text-gray-700 text-sm font-bold mb-2">Time</label>
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

          <Button type="submit" label="スケジュール保存" />
        </form>
      </div>
    </div>
  );
};
