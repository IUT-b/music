import { prisma } from "@/lib/prisma";

/**
 * Spotifyのアクセストークンを取得する関数
 * @param userSpotifyId - スケジュールのユーザーのSpotify ID
 * @returns アクセストークン
 */
export async function getAccessToken(spotifyId: string): Promise<string | null> {
  try {
    // Prismaを使用してユーザーのrefreshTokenを取得
    const user = await prisma.user.findUnique({
      where: { spotifyId: spotifyId },
      select: { refreshToken: true },
    });

    if (!user || !user.refreshToken) {
      console.error("User or refreshToken not found");
      return null;
    }

    const refreshToken = user.refreshToken;

    // Spotify API トークンエンドポイント
    const tokenUrl = "https://accounts.spotify.com/api/token";

    // Spotify APIのクライアントIDとシークレット
    const clientId = process.env.SPOTIFY_CLIENT_ID!;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    // fetchを使用してアクセストークンをリクエスト
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }).toString(),
    });

    // レスポンスが成功しているかチェック
    if (!response.ok) {
      console.error("Failed to fetch access token:", await response.text());
      return null;
    }

    const data = await response.json();

    // アクセストークンを返す
    return data.access_token;
  } catch (error) {
    console.error("Error fetching Spotify access token:", error);
    return null;
  }
}
