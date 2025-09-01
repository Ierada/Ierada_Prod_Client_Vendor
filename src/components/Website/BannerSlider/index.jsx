import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import config from '../../../config/config';

export default function BannerSlider({ bannerData }) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? bannerData.length - 1 : prevIndex - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === bannerData.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleNavigation = (banner) => {
    if (banner.Category && banner.Category.slug) {
      navigate(`${config.VITE_BASE_WEBSITE_URL}/collection/category/${banner.Category.slug}`);
    } else if (banner.link) {
      window.location.href = banner.link;
    }
  };

  return (
    <div className="relative w-full h-[500px] overflow-hidden">
      {bannerData?.map((banner, index) => (
        <div
        key={index}
        className={`absolute inset-0 transition-opacity duration-700 ${
          index === currentIndex ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <img
          src={banner.image}
          alt={banner.title || `Slide ${index + 1}`}
          className="w-full h-full "
        />
        <div className="absolute inset-0 flex flex-col justify-end pb-10 items-center text-center bg-[black] bg-opacity-30 text-white">
          <h2 className="text-3xl font-normal font-italiana mb-4">
            {banner.title}
          </h2>
          {banner.link && (
            <button
              onClick={() => handleNavigation(banner)}
              className="px-10 py-2 bg-white text-[#000000] font-poppins font-normal text-[14px]"
            >
              Shop Now
            </button>
          )}
        </div>
      </div>
      ))}

      {/* Left Arrow Button */}
      <button 
        onClick={prevSlide}
        className="
          absolute top-1/2 left-4 transform -translate-y-1/2 
          bg-white/50 rounded-full p-2 
          hover:bg-white/70 transition-all
        "
      >
        <ChevronLeft />
      </button>

      {/* Right Arrow Button */}
      <button 
        onClick={nextSlide}
        className="
          absolute top-1/2 right-4 transform -translate-y-1/2 
          bg-white/50 rounded-full p-2 
          hover:bg-white/70 transition-all
        "
      >
        <ChevronRight />
      </button>
    </div>
  );
}