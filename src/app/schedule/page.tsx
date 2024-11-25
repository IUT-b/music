'use client';

import { useEffect, useState } from 'react';

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
  const [devices, setDevices] = useState<Device[]>([]);               // 登録済の全デバイス
  const [scheduledDevice, setScheduledDevice] = useState('');         // スケジュール再生するデバイス
  const [playlists, setPlaylists] = useState<Playlist[]>([]);         // 登録済の全プレイリスト
  const [scheduledPlaylist, setScheduledPlaylist] = useState('');     // スケジュール再生するプレイリスト
  const [time, setTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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


  // スケジュールをデータベースへ保存
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!scheduledDevice || !scheduledPlaylist || !time) {
      setError('All fields are required');
      return;
    }

    setIsLoading(true);
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
      setMessage('Schedule saved successfully!');

      // NOTE: 実行した時点で他のユーザー含めて全てのスケジュールを取得し、それに従って再生する。個別のユーザーのスケジュールのみでもよいか
      // この後登録したスケジュールを再生するには再度実行する必要がある
      // スケジュール保存と同期しているか要確認(スケジュール保存前に実行されていないか)
      initializeSchedules();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Schedule Playlist</h1>
      <div>creating initialize button api/schedule/initialize</div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="device">デバイス</label>
          <select
            id="device"
            name="device"
            value={scheduledDevice}
            onChange={(e) => setScheduledDevice(e.target.value)}
            required
          >
            <option>Select a device</option>
            {devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="playlist">プレイリスト</label>
          <select
            id="playlist"
            name="playlist"
            value={scheduledPlaylist}
            onChange={(e) => setScheduledPlaylist(e.target.value)}
            required
          >
            <option>Select a playlist</option>
            {playlists.map((playlist) => (
              <option key={playlist.id} value={playlist.id}>
                {playlist.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="time">時間</label>
          <input
            type="datetime-local"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {message && <p style={{ color: 'green' }}>{message}</p>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'スケジュール保存'}
        </button>
      </form>

      <h2>Your Scheduled Playlists</h2>
      <ul>
        {schedules.map((schedule) => (
          <li key={schedule.id}>
            Playlist: {schedule.playlistId}, Device: {schedule.deviceId}, Time:{' '}
            {new Date(schedule.time).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};
