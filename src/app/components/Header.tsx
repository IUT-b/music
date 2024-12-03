'use client'

import Link from "next/link";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react"; // NextAuthのuseSessionフックとsignOutをインポート
import { usePathname } from 'next/navigation';

export default function Example() {
  const { data: session } = useSession(); // セッションデータを取得
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // ドロップダウンメニューの表示状態を管理

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' }); // サインアウト後のリダイレクト先を指定
  };

  return (
    <header className="fixed-header">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1">
          <Link href="/">
            <img
              alt=""
              src="\1298766_spotify_music_sound_icon.png"
              className="h-8 w-auto"
            /></Link>
        </div>

        <div className="hidden lg:flex lg:gap-x-12">
          <Link
            className={`font-semibold text-sm/6 ${pathname === '/insights' ? 'border-b-2' : ''}`}
            href="/insights"
          >
            Insights
          </Link>
          <Link
            className={`font-semibold text-sm/6 ${pathname === '/recommends' ? 'border-b-2' : ''}`}
            href="/recommends"
          >
            Recommends
          </Link>
          <Link
            className={`font-semibold text-sm/6 ${pathname === '/playlists' ? 'border-b-2' : ''}`}
            href="/playlists"
          >
            Playlists
          </Link>
          <Link
            className={`font-semibold text-sm/6 ${pathname === '/schedule' ? 'border-b-2' : ''}`}
            href="/schedule"
          >
            Schedule
          </Link>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {session ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 text-sm/6 font-semibold text-green-400"
              >
                <span>Welcome, {session.user?.spotifyId}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-24 bg-white border border-gray-300 z-10">
                  <button
                    onClick={handleSignOut}
                    className="block px-4 py-2 text-sm text-gray-900 w-full text-center"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link onClick={() => signIn("spotify")} className="no-underline text-sm/6 font-semibold" href="/auth/signin">
              Sign in<span aria-hidden="true">&rarr;</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
