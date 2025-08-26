import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../component/Header/Header";
import styles from "./Home.module.css";
import ItineraryFeature from "../Itinerary/ItineraryFeature/ItineraryFeature";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>
            Đi khắp thế giới, khám phá theo cách của bạn và lưu giữ khoảnh khắc
          </h1>
          <p>
            Tạo lịch trình, chia sẻ trải nghiệm và kết nối với những người yêu
            du lịch khắp nơi
          </p>
          <div className={styles.heroButtons}>
            <button
              onClick={() => navigate("/posts/feed")}
              className={styles.primaryBtn}
            >
              Xem bảng tin
            </button>
            <button
              onClick={() => navigate("/itineraries/new")}
              className={styles.primaryBtn}
            >
              Tạo lịch trình mới
            </button>
          </div>
        </div>
      </div>

      <section className={styles.section}>
        <h2>Lịch trình nổi bật</h2>
        <p>Những hành trình được yêu thích nhất từ cộng đồng</p>
        <div className={styles.tripGrid}>
          <ItineraryFeature />
        </div>
      </section>
      <section className={styles.section}>
        <h2>Điểm đến thịnh hành</h2>
        <p>Những địa điểm được khám phá nhiều nhất tuần này</p>
        <div className={styles.destinationGrid}></div>
      </section>
      <div className={styles.cta}>
        <h2>Bắt đầu hành trình của bạn ngay hôm nay</h2>
        <p>Tham gia cộng đồng du lịch và khám phá những điều tuyệt vời</p>
      </div>
    </div>
  );
}
