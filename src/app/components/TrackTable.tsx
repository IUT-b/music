'use client';

import { useState, useEffect } from 'react';
import React from "react";
import { Track, Playlist } from '@/types/spotify';
import MenuButton from "./MenuButton";

interface Props {
  accessToken: string;
  tracks: Track[];
  savedTracks: Track[];
  // onCheckboxChange: (trackId: string, checked: boolean) => void;
  playlists: Playlist[];
  isShowingPlaylist: boolean;
  showingPlaylist: Playlist | null;
  setSavedTracks: React.Dispatch<React.SetStateAction<Track[]>>;
}

export default function TrackTable({ accessToken, tracks, savedTracks, playlists, isShowingPlaylist, showingPlaylist, setSavedTracks }: Props) {
  const [isShow, setIsShow] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;

      if (screenWidth < 768) {
        setIsShow(false);
      } else {
        setIsShow(true);
      }
    };

    window.addEventListener("resize", handleResize);  // 画面のリサイズを監視

    handleResize();

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div>
      <div className="w-full mx-auto">
        <table className="min-w-full table-auto text-left text-sm text-gray-500">
          <thead>
            <tr className="border-b">
              <th scope="col" className="px-6 py-3 font-medium w-4">#</th>
              <th scope="col" className="px-6 py-3 font-medium"></th>
              <th scope="col" className="px-6 py-3 font-medium">タイトル</th>
              {isShow && (
                <th scope="col" className="px-6 py-3 font-medium">アルバム</th>
              )}
              <th scope="col" className="py-3 font-medium"></th>
              <th scope="col" className="py-3 font-medium"></th>
              <th scope="col" className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((track, index) => {
              // トラックが保存されているかどうかを判定
              const isTrackSaved = savedTracks.some(savedTrack => savedTrack.id === track.id);

              return (
                <tr className="border-b" key={index}>
                  <td className="text-center">
                    {index + 1}
                  </td>
                  <td className="py-2">
                    <img src={track.imageUrl} alt={track.album} className="album-art" />
                  </td>
                  <td>
                    <a href={track.trackUrl} target="_blank" rel="noopener noreferrer">
                      <p className="text-white font-semibold truncate mb-0" title={track.name}>{track.name}</p>
                    </a>
                    <p className="text-sm truncate mb-0" title={track.artist}>{track.artist}</p>
                  </td>
                  {isShow && (
                    <td>
                      <p className="truncate mb-0" title={track.album}>{track.album}</p>
                    </td>
                  )}
                  <td>
                    {track.popularity && (
                      <span className="flex items-center text-sm px-1" title="人気度">
                        {track.popularity}
                      </span>
                    )}
                  </td>
                  <td>
                    {/* <span className="flex items-center px-1" title="Add to favorite">
                  <Checkbox checked={true} onChange={(checked) => onCheckboxChange(track.id, checked)} />
                </span> */}
                    {isTrackSaved && (
                      <div className="inline-flex items-center" title="お気に入り">
                        <div className="flex items-center relative">
                          <div
                            className={`h-4 w-4 rounded-full bg-green-400 shadow border border-green-400 flex justify-center items-center`}
                          >
                            {true && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3.5 w-3.5 text-white"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                stroke="currentColor"
                                strokeWidth="1"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                ></path>
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td>
                    <MenuButton
                      accessToken={accessToken}
                      selectedTrack={track}
                      playlists={playlists}
                      isShowingPlaylist={isShowingPlaylist}
                      savedTracks={savedTracks}
                      setSavedTracks={setSavedTracks}
                      showingPlaylist={showingPlaylist}
                      isTrackSaved={isTrackSaved}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <style jsx>{`
      .truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 200px; /* 最大幅を設定（調整可） */
      }
    `}</style>
    </div>
  );
}
