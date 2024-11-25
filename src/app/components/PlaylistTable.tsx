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

const PlaylistTable = ({ title, tracks }: TrackTableProps) => (
  <div className="mt-6">
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
    <div className="overflow-x-auto mt-2">
      <table className="min-w-full table-auto text-left text-sm text-gray-500 dark:text-gray-400">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3 font-medium text-gray-900 dark:text-white">No.</th>
            <th scope="col" className="px-6 py-3 font-medium text-gray-900 dark:text-white">Image</th>
            <th scope="col" className="px-6 py-3 font-medium text-gray-900 dark:text-white">Track</th>
            <th scope="col" className="px-6 py-3 font-medium text-gray-900 dark:text-white">Album</th>
            <th scope="col" className="px-6 py-3 font-medium text-gray-900 dark:text-white">Popularity</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800">
          {tracks.map((track, index) => (
            <tr className="border-b border-gray-200 dark:border-gray-600" key={index}>
              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{index + 1}</td>
              <td className="px-6 py-4">
                <img src={track.imageUrl} alt={track.name} width={50} height={50} />
              </td>
              <td className="px-6 py-4">{track.name} by {track.artist}</td>
              <td className="px-6 py-4">{track.album}</td>
              <td className="px-6 py-4">{track.popularity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default PlaylistTable;
