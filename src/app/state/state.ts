import { atom } from "recoil";
import { Playlist } from "@/types/spotify"

export const selectedViewState = atom<"Top Tracks in 4 Weeks" | "Top Tracks in 6 Months" | "Top Tracks of All Time" | "Favorites">({
    key: "selectedViewState",
    default: "Top Tracks in 4 Weeks",
});

export const selectedPlaylistState = atom<Playlist | null>({
    key: "selectedPlaylistState",
    default: null,
});

export const createPlaylistModeState = atom<boolean>({
    key: "createPlaylistModeState",
    default: false,
});