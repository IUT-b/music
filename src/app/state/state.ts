// import { atom } from "recoil";
// // import { Track, Playlist } from "@/types/spotify"

// export type Track = {
//     id: string;
//     name: string;
//     artist: string;
//     album: string;
// };

// export type Playlist = {
//     id: string;
//     name: string;
//     description: string;
//     imageUrl: string;
//     tracks: Track[];
// };

// export const activeItemState = atom<Playlist | null>({
//     key: "activeItemState", // 状態を一意に識別するキー
//     default: null, // 初期値はnull
// });

import { atom } from "recoil";

export const activeItemState = atom<string>({
    key: "activeItemState", // 状態を一意に識別するキー
    default: "", // 初期値
});
