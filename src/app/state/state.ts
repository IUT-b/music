import { atom } from "recoil";
import { Playlist } from "@/types/spotify"

export const selectedViewState = atom<"Chart" | "Top Tracks in 4 Weeks" | "Top Tracks in 6 Months" | "Top Tracks of All Time" | "Favorites">({
    key: "selectedViewState",
    default: "Chart",
});

export const selectedPlaylistState = atom<Playlist | null>({
    key: "selectedPlaylistState",
    default: null,
});

export const createPlaylistModeState = atom<boolean>({
    key: "createPlaylistModeState",
    default: false,
});