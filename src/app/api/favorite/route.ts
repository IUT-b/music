import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// お気に入りの登録
// export async function POST(req: Request) {
//   try {
//     // 認証チェック
//     const session = await getServerSession(authOptions);
//     if (!session) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // リクエストデータの取得
//     const { spotifyTrackId, spotifyTrackName } = await req.json();

//     // 入力データのバリデーション
//     if (!spotifyTrackId || typeof spotifyTrackId !== "string") {
//       return NextResponse.json({ error: "Invalid spotifyTrackId" }, { status: 400 });
//     }
//     if (!spotifyTrackName || typeof spotifyTrackName !== "string") {
//       return NextResponse.json({ error: "Invalid spotifyTrackName" }, { status: 400 });
//     }

//     // 既存データの確認
//     const existingFavorite = await prisma.favorite.findUnique({
//       where: {
//         userSpotifyId_spotifyTrackId: {
//           userSpotifyId: session.user.spotifyId,
//           spotifyTrackId: spotifyTrackId,
//         },
//       },
//     });

//     if (existingFavorite) {
//       return NextResponse.json({ error: "Track already favorited" }, { status: 409 });
//     }

//     // お気に入りの登録
//     const favorite = await prisma.favorite.create({
//       data: {
//         userSpotifyId: session.user.spotifyId,
//         spotifyTrackId: spotifyTrackId,
//         spotifyTrackName: spotifyTrackName,
//       },
//     });

//     // 成功レスポンス
//     return NextResponse.json(favorite);
//   } catch (error) {
//     console.error("Error in POST /api/favorites:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

// お気に入りの取得
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userSpotifyId: session.user.spotifyId },
    include: {
      periods: {
        orderBy: { startDate: 'asc' },
      },
    },
  });

  return NextResponse.json(favorites);
}
