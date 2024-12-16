import { atom } from "recoil";
import { Track, Playlist, Favorite } from "@/types/spotify"

export const savedTracksState = atom<Track[]>({
    key: "savedTracksState",
    default: [],
});

export const favoritesState = atom<Favorite[]>({
    key: "favoritesState",
    default: [],
});

export const tracksIn4WeeksState = atom<Track[]>({
    key: "tracksIn4WeeksState",
    default: [],
});

export const tracksIn6MonthsState = atom<Track[]>({
    key: "tracksIn6MonthsState",
    default: [],
});

export const tracksInAllTimeState = atom<Track[]>({
    key: "tracksInAllTimeState",
    default: [],
});

export const playlistsState = atom<Playlist[]>({
    key: "playlistsState",
    default: [],
});

export const accessTokenState = atom<string | null>({
    key: "accessTokenState",
    default: null,
});

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