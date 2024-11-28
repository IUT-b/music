// クライアントサイドからアクセストークンを取得するapi
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getAccessToken } from '@/lib/auth';  // 既存のアクセストークン取得関数をインポート

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.spotifyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const accessToken = await getAccessToken(session.user.spotifyId);
    if (!accessToken) {
      return NextResponse.json({ error: "Failed to get access token" }, { status: 500 });
    }

    // アクセストークンをクライアントに返す
    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error("Error fetching access token:", error);
    return NextResponse.json({ error: "Failed to fetch access token" }, { status: 500 });
  }
}
