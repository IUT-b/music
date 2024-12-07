'use client';

import { useRecoilState, useRecoilValue } from "recoil";
import { selectedViewState } from "../state/state";

export default function Sidebar() {
  const [selectedView, setselectedView] = useRecoilState(selectedViewState);

  return (
    <div>
      <div className="flex">
        <div className="p-4">
          <div className="cursor-pointer" onClick={() => setselectedView("Favorites")}>お気に入り</div>
        </div>
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
