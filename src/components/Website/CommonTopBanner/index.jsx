import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getActiveOffer } from "../../../services/api.offers";
import { useNavigate } from "react-router-dom";
import config from "../../../config/config";

const CommonTopBanner = () => {
  const [offerData, setOfferData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await getActiveOffer();
        if (response && response.data) {
          setOfferData(response.data);
          console.log("Offer Data:", response.data);
        } else {
          console.error("No active offers found");
        }
      } catch (error) {
        console.error("Error fetching offers:", error);
      }
    };

    fetchBanners();
  }, []);

  if (offerData.length === 0) {
    return null;
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? prevIndex : prevIndex - 1
    );
  };

  const nextSlide = () => {
    const nextIndex =
      currentIndex === offerData.length - 1 ? currentIndex : currentIndex + 1;
    setCurrentIndex(nextIndex);
  };

  // Handle Image Click with Debugging
  const handleImageClick = (banner) => {
    const targetUrl = `${config.VITE_BASE_WEBSITE_URL}/collection/all`;
    console.log("Navigating to:", targetUrl); // Debugging the URL
    navigate(targetUrl);
  };

  return (
    <div className="relative w-full h-[120px] md:h-[300px] overflow-hidden">
      {/* {offerData.length > 0 ? (
        offerData.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => handleImageClick(banner)}
          >
            <img
              src={banner.image}
              alt={banner.title || `Slide ${index + 1}`}
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 flex flex-col justify-end pb-10 items-center text-center bg-black bg-opacity-30 text-white">
              <h2 className="text-3xl font-normal mb-4">{banner.title}</h2>
              <p className="text-lg mb-4">{banner.description}</p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center mt-4">Loading offers...</p>
      )} */}

      {offerData.map((banner, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => handleImageClick(banner)}
        >
          <img
            src={banner.image}
            alt={banner.title || `Slide ${index + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="hidden md:block absolute inset-0 flex flex-col justify-end pb-10 items-center text-center bg-black bg-opacity-30 text-white">
            <h2 className="text-3xl font-normal mb-4">{banner.title}</h2>
            <p className="text-lg mb-4">{banner.description}</p>
          </div>
        </div>
      ))}

      {/* Only render Prev and Next buttons if there's more than one offer */}
      {offerData.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/50 rounded-full p-2 hover:bg-white/70 transition-all"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/50 rounded-full p-2 hover:bg-white/70 transition-all"
          >
            <ChevronRight />
          </button>
        </>
      )}
    </div>
  );
};

export default CommonTopBanner;
