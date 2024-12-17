import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            name?: string | null;
            email?: string | null;
            image?: string | null;
            spotifyId?: string; // 追加したプロパティ
        };
    }
}
