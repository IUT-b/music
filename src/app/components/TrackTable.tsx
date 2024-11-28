// TODO: 順位の推移を表示する
import React from "react";
import MenuButton from "./MenuButton";

type Track = {
  id: string;
  name: string;
  artist: string;
  album: string;
  imageUrl: string;
  popularity: number;
  trackUrl: string;
};

type Playlist = {
  name: string;
  description: string;
  imageUrl: string;
  tracks: Track[];
};

interface Props {
  spotifyId: string;
  accessToken: string;
  title: string;
  tracks: Track[];
  savedTracks: Track[];
  // onCheckboxChange: (trackId: string, checked: boolean) => void;
  playlists: Playlist[];
  isShowingPlaylist: boolean;
  setSavedTracks: React.Dispatch<React.SetStateAction<Track[]>>;
}

const TrackTable = ({ accessToken, title, tracks, savedTracks, playlists, isShowingPlaylist, setSavedTracks }: Props) => (
  <div className="mt-6">
    <div className="playlist">
      <h2>{title}</h2>
      <table className="min-w-full table-auto text-left text-sm text-gray-500">
        <thead>
          <tr className="border-b">
            <th scope="col" className="px-6 py-3 font-medium text-gray-900 w-4">#</th>
            <th scope="col" className="px-6 py-3 font-medium text-gray-900"></th>
            <th scope="col" className="px-6 py-3 font-medium text-gray-900">タイトル</th>
            <th scope="col" className="px-6 py-3 font-medium text-gray-900">アルバム</th>
            <th scope="col" className="px-6 py-3 font-medium text-gray-900"></th>
            <th scope="col" className="px-6 py-3 font-medium text-gray-900"></th>
            <th scope="col" className="px-6 py-3 font-medium text-gray-900"></th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {tracks.map((track, index) => {
            // トラックが保存されているかどうかを判定
            const isTrackSaved = savedTracks.some(savedTrack => savedTrack.id === track.id);

            return (
              <tr className="border-b" key={index}>
                <td className="text-center ">
                  {index + 1}
                </td>
                <td className="py-2">
                  <img src={track.imageUrl} alt={track.album} className="album-art" />
                </td>
                <td>
                  <a href={track.trackUrl} target="_blank" rel="noopener noreferrer">
                    <p className="text-gray-600 font-semibold truncate" title={track.name}>{track.name}</p>
                  </a>
                  <p className="text-gray-600 text-sm truncate" title={track.artist}>{track.artist}</p>
                </td>
                <td>
                  <p className="text-gray-600 truncate" title={track.album}>{track.album}</p>
                </td>
                <td>
                  {track.popularity && (
                    <span className="flex items-center text-gray-600 text-sm px-1" title="人気度">
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
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
    <style jsx>{`
      .playlist {
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }

      .track-list {
        display: flex;
        flex-direction: column;
      }

      .track-item {
        display: flex;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #333;
        position: relative;
      }

      .track-rank {
        width: 10px;
        margin-right: 15px;
      }

      .album-art {
        width: 50px;
        height: 50px;
        border-radius: 5px;
        margin-right: 10px;
      }

      .track-name {
        font-weight: bold;
        font-size: 1rem;
        margin-bottom: 5px;
      }

      .artist-name {
        font-weight: lighter;
        font-size: 0.9rem;
        color: #666;
      }

      .track-info {
        flex: 1;
        font-weight: lighter;
        font-size: 0.9rem;
        color: #666;
      }

      .track-info_sub {
        flex: 1;
        font-weight: lighter;
        font-size: 0.9rem;
        color: #666;
      }

      .track-actions {
        display: flex
        flex-direction: row;
        // align-items: flex-end;
        align-items: center;
        position: absolute; /* ボタンを絶対位置に変更 */
        right: 10px; /* 右端に配置 */
      }

      .truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 200px; /* 最大幅を設定（調整可） */
      }
    `}</style>
  </div>
);

export default TrackTable;
