import SpotifyProvider from "next-auth/providers/spotify";
import { prisma } from "@/lib/prisma";

// Spotify Web APIから取得する情報
const scopes = [
  "user-read-private",
  "user-read-email",
  "user-top-read",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-private",
  "playlist-modify-public",
  "user-read-playback-state",
  "user-read-currently-playing",
  "user-modify-playback-state",
  "user-library-read",
  "user-library-modify",
].join(" ");

// NextAuthの設定
export const authOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: `https://accounts.spotify.com/authorize?scope=${scopes}`,
    }),
  ],
  callbacks: {
    // NOTE: userはspotify側で自動で設定される(user.idはSpotifyのIDが設定される)
    async jwt({ token, account, user }) {
      if (account && account.provider === "spotify") {
        console.log('token:', token);
        console.log('account:', account);
        console.log('user:', user);

        token.spotifyId = account.providerAccountId;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = Date.now() + account.expires_at * 1000;

        // 新規ユーザの場合、データベースにユーザを作成
        if (user) {
          await prisma.user.upsert({
            where: { spotifyId: user.id },
            update: {},
            create: {
              name: user.name || "",
              email: user.email || "",
              spotifyId: user.id,
              refreshToken: token.refreshToken,
            },
          });
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token.spotifyId) {
        // NOTE: userにはNexAuthがデフォルトで提供するプロパティ(name, email, image等)が含まれる
        session.user.spotifyId = token.spotifyId;
      }
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }
      if (token.refreshToken) {
        session.refreshToken = token.refreshToken;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};

/**
 * Spotifyのアクセストークンを取得する関数
 * @param spotifyId - スケジュールのユーザーのSpotify ID
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

// Spotifyのaccess tokenを設定
// export function setAccessToken(accessToken: string) {
//   spotifyApi.setAccessToken(accessToken);
// }

// Spotifyのrefresh tokenを設定
// export function setRefreshToken(refreshToken: string) {
//   spotifyApi.setRefreshToken(refreshToken);
// }

// Spotifyのaccess tokenを更新
// export async function refreshAccessToken(refreshToken: string) {
//   try {
//     const data = await spotifyApi.refreshAccessToken(refreshToken);
//     const newAccessToken = data.body["access_token"];
//     spotifyApi.setAccessToken(newAccessToken);
//     return newAccessToken;
//   } catch (error) {
//     console.error("Error refreshing access token", error);
//     throw error;
//   }
// }