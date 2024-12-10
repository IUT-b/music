'use client'

import Link from "next/link";
import { signIn } from "next-auth/react";

export default function Footer() {
  return (
    <footer id="footer" className="footer dark-background">
      <div className="container footer-top">
        <div className="row gy-4">
          <div className="col-lg-6 col-md-6 footer-about">
            <a href="index.html" className="d-flex align-items-center">
              tunetrek
            </a>
            <div className="footer-contact pt-3">
              <p className="mt-3">
                Discover the journey of your music tastes with tunetrek. Explore top tracks, favorites, and create playlists based on your history.
              </p>
            </div>
          </div>

          <div className="col-lg-2 col-md-3 footer-links">
            <h4>Useful Links</h4>
            <ul>
              <li>
                <i className="bi bi-chevron-right" />
                <Link href="https://open.spotify.com/">Spotify</Link>
              </li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 footer-links">
            <h4>Our Services</h4>
            <ul>
              <li>
                <i className="bi bi-chevron-right" />
                <Link href="/top-tracks">Top tracks</Link>
              </li>
              <li>
                <i className="bi bi-chevron-right"></i>
                <Link href="/favorites">Favorites</Link>
              </li>
              <li>
                <i className="bi bi-chevron-right"></i>
                <Link href="/playlists">Playlists</Link>
              </li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-12 footer-links">
            <h4>Get Started</h4>
            <ul>
              <li>
                <i className="bi bi-chevron-right" />
                <Link href="/">Home</Link>
              </li>
              <li>
                <i className="bi bi-chevron-right" />
                <Link href="/" onClick={() => signIn("spotify")}>Sign in</Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      <div className="container copyright text-center mt-4">
        <p>© <span>Copyright</span> <strong className="px-1 sitename">tunetrek</strong> <span>All Rights Reserved</span></p>
      </div>
    </footer>
  )
}
