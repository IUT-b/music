'use client';

import { signIn } from "next-auth/react";

export default function Home() {
  return (
    <>
      <section id="hero" className="hero section dark-background">
        <video
          src="/background.mp4"
          autoPlay
          loop
          muted
          className="background-video"
        >
          お使いのブラウザは動画をサポートしていません。
        </video>
        <div className="container text-center">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="row justify-content-center">
                <div className="col-lg-8 d-flex justify-content-center">
                  <h1 className="app-title text-8xl">tunetrek</h1>
                </div>
              </div>
              <h2>Welcome to Studios</h2>
              <p>音楽の旅を可視化し、あなただけのプレイリストを作成する新しい体験をお届けします</p>
              <a href="#" className="btn-get-started" onClick={() => signIn("spotify")}>Get Started</a>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="about section">
        <div className="container section-title">
          <h2 className="text-gray-400">Top Tracks</h2>
          <p>音楽の旅を振り返り、変化してきたトップトラックを一目で確認できます</p>
        </div>
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6">
              <video
                src="/tracks.mp4"
                autoPlay
                loop
                muted
                className="img-fluid"
              >
                お使いのブラウザは動画をサポートしていません。
              </video>
            </div>
            <div className="col-lg-6 content">
              <h3 className="text-gray-400">あなたの音楽の歴史を可視化</h3>
              <p className="fst-italic">
                TuneTrekでは、過去から現在にかけてのトップトラックの推移を確認できる、ユニークな体験を提供します
              </p>
              <ul>
                <li><i className="bi bi-check2-all"></i> <span>オールタイムで最も再生した曲を確認</span></li>
                <li><i className="bi bi-check2-all"></i> <span>6ヶ月間や4週間など、期間別に人気の曲を比較</span></li>
                <li><i className="bi bi-check2-all"></i> <span>音楽の好みがどのように変化してきたかをタイムラインで一目瞭然</span></li>
              </ul>
              <p>
                トップトラックの推移を振り返ることで、過去の思い出に浸ったり、新しいインスピレーションを得たりすることができます。
                あなたの音楽の旅路をもう一度辿ってみませんか？
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="favorites" className="about section">
        <div className="container section-title">
          <h2 className="text-gray-400">Favorites History</h2>
          <p>お気に入り曲が登録された期間を表示し、変遷を振り返ることができます</p>
        </div>
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 content">
              <h3 className="text-gray-400">お気に入りの変遷を可視化</h3>
              <p className="fst-italic">
                TuneTrekでは、お気に入りの曲が登録された期間や変更のタイミングを確認でき、音楽の好みの変化を楽しめます。
              </p>
              <ul>
                <li><i className="bi bi-check2-all"></i> <span>お気に入り曲の登録日や期間を記録</span></li>
                <li><i className="bi bi-check2-all"></i> <span>新しいお気に入りや過去のお気に入りの傾向を把握</span></li>
                <li><i className="bi bi-check2-all"></i> <span>音楽の嗜好の移り変わりを直感的に理解</span></li>
              </ul>
              <p>
                お気に入りの移り変わりをタイムラインで振り返り、あなたの音楽の歩みを再発見しましょう。過去の曲との再会や、新しいお気に入りへの気づきが生まれるかもしれません。
              </p>
            </div>
            <div className="col-lg-6">
              <img src="/favorites.png" className="img-fluid" alt="" />
            </div>
          </div>
        </div>
      </section>

      <section id="clients" className="clients section">
        <div className="container">
          <div className="swiper init-swiper">
            <div className="swiper-wrapper flex justify-center items-center gap-8">
              <div className="w-16 sm:w-24 md:w-48 flex justify-center items-center">
                <img src="/app.png" className="img-fluid" alt="Client 2" />
              </div>
              <div className="w-16 sm:w-24 md:w-48 flex justify-center items-center">
                <img src="/1298766_spotify_music_sound_icon.png" className="img-fluid" alt="Client 2" />
              </div>
              <div className="w-16 sm:w-24 md:w-48 flex justify-center items-center">
                <img src="/sample.png" className="img-fluid rounded-3xl" alt="Client 2" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
