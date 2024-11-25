'use client';

import { useEffect, useState } from 'react';
import TrackTable from '../components/TrackTable';

type Track = {
    id: string;
    name: string;
    artist: string;
    album: string;
    imageUrl: string;
    popularity: number;
};

export default function InsightsPage() {
    const [tracksIn4Weeks, setTracksIn4Weeks] = useState<Track[]>([]);
    const [tracksIn6Months, setTracksIn6Months] = useState<Track[]>([]);
    const [tracksInAllTime, setTracksInAllTime] = useState<Track[]>([]);
    const [favorites, setFavorites] = useState<Track[]>([]);

    useEffect(() => {
        const spotifyData = sessionStorage.getItem('spotifyData');
        if (spotifyData) {
            setTracksIn4Weeks(JSON.parse(spotifyData).topTracksIn4Weeks);
            setTracksIn6Months(JSON.parse(spotifyData).topTracksIn6Months);
            setTracksInAllTime(JSON.parse(spotifyData).topTracksInAllTime);
            setFavorites(JSON.parse(spotifyData).favorites);
        }
    }, []);

    if (!tracksIn4Weeks) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Spotify Top Tracks</h1>
            <TrackTable title="Top Tracks in 4 Weeks" tracks={tracksIn4Weeks} />
            <TrackTable title="Top Tracks in 6 Months" tracks={tracksIn6Months} />
            <TrackTable title="Top Tracks of All Time" tracks={tracksInAllTime} />
            <TrackTable title="Favorite Tracks" tracks={favorites} />
        </div>
    );
};
