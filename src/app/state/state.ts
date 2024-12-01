import { atom } from "recoil";
import { Playlist } from "@/types/spotify"

export const selectedPlaylistState = atom<Playlist | null>({
    key: "selectedPlaylistState",
    default: null,
});

export const createPlaylistModeState = atom<boolean>({
    key: "createPlaylistModeState",
    default: false,
});