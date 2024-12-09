// TODO: データをキャッシュして表示しているので最新を取得するためのリフレッシュボタンを設置する
'use client';

import { SessionProvider } from "next-auth/react";
import { RecoilRoot } from "recoil";
import "./globals.css";
import Header from './components/Header';
import Footer from './components/Footer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <RecoilRoot>
      <SessionProvider>
        <html lang="en">
          <head>
            <meta charSet="utf-8" />
            <meta content="width=device-width, initial-scale=1.0" name="viewport" />
            <title>Index - Knight Bootstrap Template</title>
            <meta name="description" content="" />
            <meta name="keywords" content="" />

            {/* <!-- Favicons --> */}
            <link href="\1298766_spotify_music_sound_icon.png" rel="icon" />
            <link href="assets/img/apple-touch-icon.png" rel="apple-touch-icon" />

            {/* <!-- Fonts --> */}
            <link href="https://fonts.googleapis.com" rel="preconnect" />
            <link href="https://fonts.gstatic.com" rel="preconnect" crossorigin />
            <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet" />

            {/* <!-- Vendor CSS Files --> */}
            <link href="assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
            <link href="assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet" />
            <link href="assets/vendor/aos/aos.css" rel="stylesheet" />
            <link href="assets/vendor/swiper/swiper-bundle.min.css" rel="stylesheet" />
            <link href="assets/vendor/glightbox/css/glightbox.min.css" rel="stylesheet" />

            {/* <!-- Main CSS File --> */}
            <link href="assets/css/main.css" rel="stylesheet" />
          </head>

          <body className="index-page">
            <Header />
            <main className="main">{children}</main>
            <Footer />


            {/* <!-- Scroll Top --> */}
            <a href="#" id="scroll-top" className="scroll-top d-flex align-items-center justify-content-center"><i className="bi bi-arrow-up-short"></i></a>

            {/* <!-- Preloader --> */}
            {/* <div id="preloader"></div> */}

            {/* <!-- Vendor JS Files --> */}
            {/* <script src="assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
            <script src="assets/vendor/php-email-form/validate.js"></script>
            <script src="assets/vendor/aos/aos.js"></script>
            <script src="assets/vendor/swiper/swiper-bundle.min.js"></script>
            <script src="assets/vendor/glightbox/js/glightbox.min.js"></script>
            <script src="assets/vendor/imagesloaded/imagesloaded.pkgd.min.js"></script>
            <script src="assets/vendor/isotope-layout/isotope.pkgd.min.js"></script> */}

            {/* <!-- Main JS File --> */}
            {/* <script src="assets/js/main.js"></script> */}
            <script src="assets/js/main.js" />

          </body>

        </html>
      </SessionProvider >
    </RecoilRoot >
  );
}