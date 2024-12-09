'use client';

export default function Home() {
  return (
    <>
      <section id="hero" className="hero section dark-background">
        <div className="container text-center">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <img src="assets/img/hero-logo.png" alt="" className="img-fluid mb-3" />
              <h2>Welcome To tunetrek Studios</h2>
              <p>音楽の旅を可視化し、あなただけのプレイリストを作成する新しい体験をお届けします</p>
              <a href="#about" className="btn-get-started">Get Started</a>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="about section">
        <div className="container section-title">
          <h2>Top Tracks</h2>
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
              <h3>あなたの音楽の歴史を可視化</h3>
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
          <h2>Favorites History</h2>
          <p>お気に入り曲が登録された期間を表示し、変遷を振り返ることができます</p>
        </div>
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 content">
              <h3>お気に入りの変遷を可視化</h3>
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
              {/* <img src="assets/img/about.jpg" className="img-fluid" alt="" /> */}
              <img src="/favorites.png" className="img-fluid" alt="" />
            </div>
          </div>
        </div>
      </section>

      <section id="clients" className="clients section">
        <div className="container">
          <div className="swiper init-swiper">
            {/* <script type="application/json" className="swiper-config">
                {
                  "loop": true,
                "speed": 600,
                "autoplay": {
                  "delay": 5000
              },
                "slidesPerView": "auto",
                "pagination": {
                  "el": ".swiper-pagination",
                "type": "bullets",
                "clickable": true
              },
                "breakpoints": {
                  "320": {
                  "slidesPerView": 2,
                "spaceBetween": 40
                },
                "480": {
                  "slidesPerView": 3,
                "spaceBetween": 60
                },
                "640": {
                  "slidesPerView": 4,
                "spaceBetween": 80
                },
                "992": {
                  "slidesPerView": 6,
                "spaceBetween": 120
                }
              }
            }
              </script> */}
            <div className="swiper-wrapper align-items-center">
              <div className="swiper-slide"><img src="assets/img/clients/client-1.png" className="img-fluid" alt="" /></div>
              <div className="swiper-slide"><img src="assets/img/clients/client-2.png" className="img-fluid" alt="" /></div>
              <div className="swiper-slide"><img src="assets/img/clients/client-3.png" className="img-fluid" alt="" /></div>
              <div className="swiper-slide"><img src="assets/img/clients/client-4.png" className="img-fluid" alt="" /></div>
              <div className="swiper-slide"><img src="assets/img/clients/client-5.png" className="img-fluid" alt="" /></div>
              <div className="swiper-slide"><img src="assets/img/clients/client-6.png" className="img-fluid" alt="" /></div>
              <div className="swiper-slide"><img src="assets/img/clients/client-7.png" className="img-fluid" alt="" /></div>
              <div className="swiper-slide"><img src="assets/img/clients/client-8.png" className="img-fluid" alt="" /></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
