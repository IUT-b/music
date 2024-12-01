'use client';

import React from "react";

export default function SharedLayout({
  children,
  SidebarComponent,
}: {
  children: React.ReactNode;
  SidebarComponent: React.ElementType;
}) {
  return (
    <div className="flex h-[calc(100vh-120px)] overflow-hidden page-layout">
      <aside className="w-1/5 overflow-y-auto side">
        <SidebarComponent />
      </aside>
      <main className="w-4/5 overflow-y-auto main">{children}</main>
    </div>
  );
}
