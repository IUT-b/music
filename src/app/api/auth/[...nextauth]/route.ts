import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { PrismaClient } from "@prisma/client";
import { refreshAccessToken } from "@/lib/spotify";

const prisma = new PrismaClient();

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
    // NOTE: jwtの後に実行される
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
    // NOTE: jwtが最初に実行される
    // userはspotify側で自動で設定される(user.idはSpotifyのIDが設定される)
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

      // TODO: 作動しているか要確認、認証切れが発生した
      // トークンが期限切れの場合にリフレッシュ
      if (Date.now() > token.accessTokenExpires) {
        const refreshedToken = await refreshAccessToken(token.refreshToken);
        token.accessToken = refreshedToken.access_token;
        token.accessTokenExpires = Date.now() + refreshedToken.expires_in * 1000;
        token.refreshToken = refreshedToken.refresh_token ?? token.refreshToken;
      }

      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};

// NextAuthのインスタンスをエクスポート
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
