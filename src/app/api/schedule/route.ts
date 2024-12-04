import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from '../auth/[...nextauth]/route';

// スケジュールの登録
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  console.log("session", session);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { playlistId, playlistName, deviceId, deviceName, time } = await req.json();

  const schedule = await prisma.schedule.create({
    data: {
      spotifyId: session.user.spotifyId,
      deviceId,
      deviceName,
      playlistId,
      playlistName,
      time: new Date(time),
    },
  });

  return NextResponse.json(schedule);
}

// スケジュールの取得
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const schedules = await prisma.schedule.findMany({
    where: { userSpotifyId: session.user.spotifyId },
    orderBy: { time: "asc" },
  });

  return NextResponse.json(schedules);
}
