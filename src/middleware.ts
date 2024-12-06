import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: Request) {
    // セッション（JWTトークン）を取得
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // トークンがない場合（認証されていない場合）
    if (!token) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
}

// middlewareが適用されるURLパターンを指定
export const config = {
    matcher: ['/top-tracks', '/favorites', '/playlists', '/schedule'],
};
