import cron from "node-cron";
import { prisma } from "@/lib/prisma";
import { playPlaylist } from "@/lib/spotify";
import { getAccessToken } from "@/lib/auth";

const tasks: Map<number, cron.ScheduledTask> = new Map();

export async function initializeScheduler() {
  const schedules = await prisma.schedule.findMany();

  schedules.forEach((schedule) => {
    scheduleTask(schedule);
  });
}

export function scheduleTask(schedule: { id: number; userSpotifyId: string; deviceId: string; playlistId: string; time: Date }) {
  const timeString = `${schedule.time.getMinutes()} ${schedule.time.getHours()} * * *`;

  // 既存のタスクを削除（重複防止）
  if (tasks.has(schedule.id)) {
    tasks.get(schedule.id)?.stop();
    tasks.delete(schedule.id);
  }

  // 新しいタスクを作成
  const task = cron.schedule(timeString, async () => {
    try {
      const accessToken = await getAccessToken(schedule.userSpotifyId);
      if (!accessToken) {
        console.error("Access token not found for user:", schedule.userSpotifyId);
        return;
      }

      await playPlaylist(accessToken, schedule.deviceId, schedule.playlistId);
      console.log(`Playlist ${schedule.playlistId} played for user ${schedule.userSpotifyId}`);
    } catch (error) {
      console.error("Error during scheduled playback:", error);
    }
  });

  tasks.set(schedule.id, task);
}

export async function refreshSchedule() {
  const schedules = await prisma.schedule.findMany();

  // 全スケジュールをリセット
  tasks.forEach((task) => task.stop());
  tasks.clear();

  // スケジュールを再登録
  schedules.forEach((schedule) => {
    scheduleTask(schedule);
  });
}
