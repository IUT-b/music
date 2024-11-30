import { atom } from "recoil";
import { Track, Playlist } from "@/types/spotify"

export const activeItemState = atom<Playlist | null>({
    key: "activeItemState",
    default: null,
});