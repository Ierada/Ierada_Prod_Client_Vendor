import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BrandLogos = ({ title, items }) => {
  const sliderRef = useRef(null);
  const [visibleItems, setVisibleItems] = useState(5);
  const [itemWidth, setItemWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Dynamically set the number of visible logos based on screen width
  useEffect(() => {
    const updateVisibleItems = () => {
      if (sliderRef.current) {
        const containerWidth = sliderRef.current.clientWidth;
        const firstItem = sliderRef.current.firstChild;
        if (firstItem) {
          const itemWidth = firstItem.clientWidth + 16; // Add gap between items
          setItemWidth(itemWidth);
          setVisibleItems(Math.floor(containerWidth / itemWidth));
        }
      }
    };

    updateVisibleItems();
    window.addEventListener("resize", updateVisibleItems);
    return () => window.removeEventListener("resize", updateVisibleItems);
  }, [items]);

  const handlePrevClick = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: -itemWidth * visibleItems,
        behavior: "smooth",
      });
    }
  };

  const handleNextClick = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: itemWidth * visibleItems,
        behavior: "smooth",
      });
    }
  };

  // Mouse & Touch Dragging Events
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Multiply for faster scroll effect
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <section className="max-w-6xl mx-auto space-y-4">
      {title && (
        <div className="text-center py-6">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold">
            {title}
          </h2>
        </div>
      )}
      <div className="relative">
        <div
          ref={sliderRef}
          className="flex overflow-x-auto gap-4 scroll-smooth no-scrollbar cursor-pointer select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {items?.map((logo, index) => (
            <div key={index} className="flex-shrink-0">
              <img
                src={logo.image}
                alt={`Brand ${index}`}
                className="h-25 md:h-30 lg:h-45 w-auto object-contain mx-auto"
              />
            </div>
          ))}
        </div>

        {items?.length > visibleItems && (
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none">
            <button
              onClick={handlePrevClick}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 pointer-events-auto ml-2"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <button
              onClick={handleNextClick}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 pointer-events-auto mr-2"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default BrandLogos;
