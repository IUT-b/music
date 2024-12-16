import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getAccessToken } from "@/lib/auth";
import { syncFavoritesWithSpotify } from '@/lib/syncFavorites';

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

    syncFavoritesWithSpotify(accessToken, session.user.spotifyId)

    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error("Error syncing favorites:", error);
    return NextResponse.json({ error: "Failed to sync favorites" }, { status: 500 });
  }
}
