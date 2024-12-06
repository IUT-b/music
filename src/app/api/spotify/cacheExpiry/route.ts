import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from '../../auth/[...nextauth]/route';

// キャッシュ有効期限の取得
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const spotifyCaches = await prisma.spotifyCache.findMany({
    where: { spotifyId: session.user.spotifyId },
  });

  return NextResponse.json(spotifyCaches);
}

// キャッシュ有効期限の登録
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { types } = await req.json();

  if (!Array.isArray(types)) {
    return NextResponse.json({ error: "Invalid input: 'types' must be an array." }, { status: 400 });
  }

  const updates = types.map(async (type) => {
    return prisma.spotifyCache.upsert({
      where: {
        spotifyId_type: {
          spotifyId: session.user.spotifyId,
          type,
        },
      },
      update: {
        expiresAt: new Date(Date.now() + 3600 * 1000), // 1時間後
      },
      create: {
        spotifyId: session.user.spotifyId,
        type,
        expiresAt: new Date(Date.now() + 3600 * 1000), // 1時間後
      },
    });
  });

  // 全てのupsertを並列に処理
  const result = await Promise.all(updates);

  return NextResponse.json(result);
}
