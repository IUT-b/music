'use client';

import React from "react";
import Sidebar from "./Sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-120px)] overflow-hidden page-layout">
      <aside className="w-1/5 overflow-y-auto bg-green-100 side">
        <Sidebar />
      </aside>
      <main className="w-4/5 overflow-y-auto main">{children}</main>
    </div>
  );
}
