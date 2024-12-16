import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getAccessToken } from "@/lib/auth";
import { addTracksToPlaylist } from '@/lib/spotify';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.spotifyId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // リクエストデータの取得
    const { playlistId, trackUris } = await req.json();
    console.log(trackUris);
    try {
        const accessToken = await getAccessToken(session.user.spotifyId);
        if (!accessToken) {
            return NextResponse.json({ error: "Failed to add track to playlist" }, { status: 500 });
        }

        addTracksToPlaylist(accessToken, playlistId, trackUris)

        return NextResponse.json({ accessToken });
    } catch (error) {
        console.error("Error adding track to playlist:", error);
        return NextResponse.json({ error: "Failed to add track to playlist" }, { status: 500 });
    }
}
