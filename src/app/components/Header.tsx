'use client'

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { usePathname } from 'next/navigation';

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <header id="header" className="header d-flex align-items-center fixed-top">
      <div className="container-fluid position-relative d-flex align-items-center justify-content-between">
        <Link href="/" className="logo d-flex align-items-center me-auto me-xl-0">
          <h1 className="app-title">tunetrek</h1>
        </Link>

        <nav id="navmenu" className="navmenu">
          <ul>
            <Link
              className={`font-semibold text-sm/6 ${pathname === '/top-tracks' ? 'active' : ''}`}
              href="/top-tracks"
            >
              Top tracks
            </Link>
            <Link
              className={`font-semibold text-sm/6 ${pathname === '/favorites' ? 'active' : ''}`}
              href="/favorites"
            >
              Favorites
            </Link>
            <Link
              className={`font-semibold text-sm/6 ${pathname === '/playlists' ? 'active' : ''}`}
              href="/playlists"
            >
              Playlists
            </Link>
          </ul>
          <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
        </nav>

        <div className="header-social-links">
          {session ? (
            <nav id="navmenu2" className="navmenu2">
              <ul>
                <li className="dropdown"><a href="#">
                  <span>
                    Welcome, {session.user?.spotifyId}
                  </span> <i className="bi bi-chevron-down toggle-dropdown"></i></a>
                  <ul>
                    <li><a href="#" onClick={handleSignOut}>
                      Sign out
                    </a></li>
                  </ul>
                </li>
              </ul>
            </nav>
          ) : (
            <nav id="navmenu2" className="navmenu2">
              <ul>
                <li className="dropdown"><a href="#" onClick={() => signIn("spotify")}>
                  <span>
                    Sign in
                  </span><i className="bi bi-chevron-down toggle-dropdown"></i></a>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}
