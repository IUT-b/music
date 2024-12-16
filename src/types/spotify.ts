export type Track = {
    id: string;
    name: string;
    artist: string;
    album: string;
    popularity: number;
    imageUrl: string;
    trackUrl: string;
};

export type Playlist = {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    tracks: Track[];
};

export type Device = {
    id: string;
    name: string;
};

export type CacheExpiry = {
    id: number;
    spotifyId: string;
    type: string;
    expiresAt: string; // Prismaから返ってくる日時はISO文字列のため
    createdAt: string; // Prismaから返ってくる日時はISO文字列のため
}

export type User = {
    id: string;  // SpotifyのユーザーID
    display_name: string; // ユーザー名
    email: string; // ユーザーのメールアドレス
    images?: { url: string }[]; // プロフィール画像のURL（オプション）
};

export type SpotifyData = {
    user?: User;
    topTracksIn4Weeks?: Track[];
    topTracksIn6Months?: Track[];
    topTracksInAllTime?: Track[];
    playlists?: (Playlist & { tracks: Track[] })[];
    devices?: Device[];
    savedTracks?: Track[];
}

export type FavoritePeriod = {
    id: number;
    favoriteId: number;
    startDate: string; // Prisma の DateTime 型は ISO 文字列として返される
    endDate?: string;  // nullable な場合はオプショナル
};

export type Favorite = {
    id: number;
    userSpotifyId: string;
    spotifyTrackId: string;
    spotifyTrackName: string;
    periods: FavoritePeriod[]; // 関連する期間のリスト
};