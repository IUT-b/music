export type Track = {
    id: string;
    name: string;
    artist: string;
    album: string;
    popularity: number;
    albumImageUrl: string;
    trackUrl: string;
};

export type Playlist = {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    tracks: Track[];
};

export type Device = {
    id: string;
    name: string;
};