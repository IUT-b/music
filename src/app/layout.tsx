// TODO: データをキャッシュして表示しているので最新を取得するためのリフレッシュボタンを設置する
'use client';

import { SessionProvider } from "next-auth/react";
import { RecoilRoot } from "recoil";
import "./globals.css";
import Header from './components/Header';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <RecoilRoot>
      <SessionProvider>
        <html lang="en">
          <body>
            <Header />
            <main className="main-content">{children}</main>
          </body>
        </html>
      </SessionProvider>
    </RecoilRoot >
  );
}