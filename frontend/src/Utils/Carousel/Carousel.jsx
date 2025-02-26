import React, { useRef } from 'react';
import styles from './Carousel.module.scss';

const Carousel = ({ children, length }) => {
  const carouselRef = useRef(null);
  const slidesToShow = length;

  const nextSlide = () => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth / slidesToShow;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const prevSlide = () => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth / slidesToShow;
      carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.carouselContainer}>
      <button onClick={prevSlide} className={`${styles.carouselButton} ${styles.carouselButtonLeft}`}>&lt;</button>
      <button onClick={nextSlide} className={`${styles.carouselButton} ${styles.carouselButtonRight}`}>&gt;</button>
      <div className={styles.carousel} ref={carouselRef}>
        {children}
      </div>
    </div>
  );
};

export default Carousel;