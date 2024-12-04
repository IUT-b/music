'use client';

import { useRecoilState, useRecoilValue } from "recoil";
import { selectedViewState } from "../state/state";

export default function Sidebar() {
  const [selectedView, setselectedView] = useRecoilState(selectedViewState);

  return (
    <div>
      <div className="flex">
        <div className="p-4">
          <div>トップトラック</div>
          <ul className="">
            <li
              className="cursor-pointer px-2 rounded-sm hover:bg-green-500 transition-colors duration-300"
              onClick={() => setselectedView("Top Tracks of All Time")}
            >
              オールタイム
            </li>
            <li
              className="cursor-pointer px-2 rounded-sm hover:bg-green-500 transition-colors duration-300"
              onClick={() => setselectedView("Top Tracks in 6 Months")}
            >
              6ヶ月間
            </li>
            <li
              className="cursor-pointer px-2 rounded-sm hover:bg-green-500 transition-colors duration-300"
              onClick={() => setselectedView("Top Tracks in 4 Weeks")}
            >
              4週間
            </li>
          </ul>
          {/* <div className="cursor-pointer" onClick={() => setselectedView("Chart")}>ランキングチャート</div> */}
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
