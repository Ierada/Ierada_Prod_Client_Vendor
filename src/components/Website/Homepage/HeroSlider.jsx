import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

const HeroSlider = ({ data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef(null);

  const isCurrentSlideVideo = () => {
    return data.items[currentIndex]?.file_type === "video";
  };

  useEffect(() => {
    if (!isPaused && !isCurrentSlideVideo()) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % data.items.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isPaused, data.items.length, currentIndex]);

  useEffect(() => {
    const currentVideo = videoRef.current;

    if (currentVideo) {
      if (isCurrentSlideVideo()) {
        currentVideo.currentTime = 0;
        currentVideo
          .play()
          .catch((err) => console.log("Video autoplay prevented:", err));
      } else {
        currentVideo.pause();
      }
    }
  }, [currentIndex]);

  const handleNavigation = (slide) => {
    if (slide.link) {
      window.location.href = slide.link;
    }
  };

  const goToNextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % data.items.length);
  };

  const goToPrevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? data.items.length - 1 : prev - 1));
  };

  return (
    <section
      className="relative w-full overflow-hidden aspect-[16/9] md:aspect-[16/4.6]"
      // style={{ aspectRatio: "16/4.6" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {data.items.map((slide, index) => {
        const isVideo = slide.file_type === "video";

        return (
          <div
            key={slide.id}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {isVideo ? (
              <div
                onClick={() => handleNavigation(slide)}
                className="relative h-full w-full cursor-pointer"
              >
                <video
                  ref={index === currentIndex ? videoRef : null}
                  className="absolute inset-0 w-full h-full object-cover"
                  src={slide.file_url}
                  muted
                  playsInline
                  onEnded={() => goToNextSlide()}
                />
                <div className="absolute inset-0 bg-black bg-opacity-30" />
                {/* <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 text-white max-w-2xl">
                  <h1 className="text-xl md:text-3xl font-bold mb-2 md:mb-4">
                    {slide.title}
                  </h1>
                  {slide.subtitle && (
                    <p className="text-sm md:text-lg mb-4 md:mb-8">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.btnText && (
                    <button
                      onClick={() => handleNavigation(slide)}
                      className="bg-[#6B705C] hover:bg-[#535647] transition-colors px-6 py-2 md:px-8 md:py-3 text-white font-medium w-fit"
                    >
                      {slide.btnText} →
                    </button>
                  )}
                </div> */}
              </div>
            ) : (
              <div
                onClick={() => handleNavigation(slide)}
                className="relative h-full w-full cursor-pointer"
              >
                <picture>
                  <source
                    media="(max-width: 768px)"
                    srcSet={slide.mobile_image || slide.file_url}
                  />
                  <img
                    src={slide.file_url}
                    alt={slide.title}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                </picture>
                <div className="absolute inset-0 bg-black bg-opacity-20" />
                {/* <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 text-white max-w-2xl">
                  <h1 className="text-xl md:text-3xl font-bold mb-2 md:mb-4">
                    {slide.title}
                  </h1>
                  {slide.subtitle && (
                    <p className="text-sm md:text-lg mb-4 md:mb-8">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.btnText && (
                    <button
                      onClick={() => handleNavigation(slide)}
                      className="bg-[#6B705C] hover:bg-[#535647] transition-colors px-6 py-2 md:px-8 md:py-3 text-white font-medium w-fit"
                    >
                      {slide.btnText} →
                    </button>
                  )}
                </div> */}
              </div>
            )}
          </div>
        );
      })}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-4">
        {isCurrentSlideVideo() && (
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 rounded-full bg-white/30 hover:bg-white/50 transition-colors"
          >
            {isPaused ? (
              <Play className="w-4 h-4 text-white" />
            ) : (
              <Pause className="w-4 h-4 text-white" />
            )}
          </button>
        )}

        <div className="flex space-x-2">
          {data.items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-white" : "bg-white/30"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <button
        onClick={goToPrevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors focus:outline-none"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={goToNextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors focus:outline-none"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>
    </section>
  );
};

export default HeroSlider;
