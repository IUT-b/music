type Track = {
  name: string;
  artist: string;
  album: string;
  imageUrl: string;
  popularity: number;
};

interface TrackTableProps {
  title: string;
  tracks: Track[];
}

// TODO: トラックの外部リンクを有効にする
// TODO: 順位の推移を表示する
const TopTrackTable = ({ title, tracks }: TrackTableProps) => (
  <div className="playlist">
    <h2>{title}</h2>
    <div className="track-list">
      {tracks.map((track, index) => (
        <div className="track-item" key={track.id}>
          <p className="track-rank">{index + 1}</p>
          <img src={track.imageUrl} alt={track.album} className="album-art" />
          <div className="track-info">
            <p className="track-name truncate" title={track.name}>{track.name}</p>
            <p className="artist-name truncate" title={track.artist}>{track.artist}</p>
            {/* <p className="album-name truncate" title={track.album}>{track.album}</p> */}
          </div>
          <div className="track-info">
            <p className="album-name truncate" title={track.album}>{track.album}</p>
          </div>
          <div className="track-actions">
            <button>
              {track.isFavorited ? 'Unfavorite' : 'Favorite'}
            </button>
            <p>{track.favoriteDate && `Favorited on: ${track.favoriteDate}`}</p>
            <p>{track.unfavoriteDate && `Unfavorited on: ${track.unfavoriteDate}`}</p>
          </div>
        </div>
      ))}
    </div>
    <style jsx>{`
      .playlist {
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        // background-color: #f0fdf4;
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
      }

      .track-rank {
        width: 30px;
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

      .track-actions {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }

      .truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 200px; /* 最大幅を設定（調整可） */
      }

      button {
        background-color: #1db954;
        color: white;
        border: none;
        padding: 5px 10px;
        cursor: pointer;
        border-radius: 5px;
        margin-bottom: 5px;
      }

      button:hover {
        background-color: #1ed760;
      }
    `}</style>
  </div>
);

export default TopTrackTable;
