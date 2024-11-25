'use client'

import Link from "next/link";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react"; // NextAuthのuseSessionフックとsignOutをインポート

export default function Example() {
  const { data: session } = useSession(); // セッションデータを取得
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // ドロップダウンメニューの表示状態を管理

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' }); // サインアウト後のリダイレクト先を指定
  };

  return (
    <header className="bg-white fixed-header">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1">
          <Link href="/">
            <img
              alt=""
              src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
              className="h-8 w-auto"
            /></Link>
        </div>

        <div className="hidden lg:flex lg:gap-x-12">
          <Link className="no-underline text-sm/6 font-semibold text-gray-900" href="/insights">Insights</Link>
          <Link className="no-underline text-sm/6 font-semibold text-gray-900" href="/recommends">Recommends</Link>
          <Link className="no-underline text-sm/6 font-semibold text-gray-900" href="/playlists">Playlists</Link>
          <Link className="no-underline text-sm/6 font-semibold text-gray-900" href="/schedule">Schedule</Link>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {session ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 text-sm/6 font-semibold text-gray-900"
              >
                <span>Welcome, {session.user?.spotifyId}</span>
                <span className="text-gray-500">▼</span>
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
            <Link onClick={() => signIn("spotify")} className="no-underline text-sm/6 font-semibold text-gray-900" href="/auth/signin">
              Sign in<span aria-hidden="true">&rarr;</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
