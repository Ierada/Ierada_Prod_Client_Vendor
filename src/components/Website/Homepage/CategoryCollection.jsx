import React, { useRef, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import left_decor from "/assets/heading_decoration/heading_decoration_left.svg";
import right_decor from "/assets/heading_decoration/heading_decoration_right.svg";
import { ChevronLeft, ChevronRight } from "lucide-react";
import config from "../../../config/config";

const CategoryCollection = ({ data }) => {
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const [itemWidth, setItemWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0); // Renamed to avoid conflict with method
  const [duplicatedItems, setDuplicatedItems] = useState([]);

  // Number of times to duplicate the items for a robust continuous loop
  // Original + 2-3 copies usually provides enough buffer.
  const DUPLICATION_FACTOR = 3;

  // Use a ref for animation frame ID to easily clear it across renders
  const animationFrameRef = useRef(null);
  const autoScrollSpeed = 1; // Pixels per frame

  useEffect(() => {
    if (data?.items) {
      // Create duplicated items for continuous scrolling
      const duplicated = [];
      for (let i = 0; i < DUPLICATION_FACTOR; i++) {
        duplicated.push(...data.items);
      }
      setDuplicatedItems(duplicated);
    }
  }, [data]);

  // Calculate itemWidth more robustly
  useEffect(() => {
    const calculateItemWidth = () => {
      if (sliderRef.current && sliderRef.current.firstChild) {
        const firstItem = sliderRef.current.firstChild;
        // getBoundingClientRect provides accurate width including padding/border, but not margin.
        // For gap-4 (16px), we add it manually.
        const width = firstItem.getBoundingClientRect().width + 16;
        setItemWidth(width);
      }
    };

    calculateItemWidth(); // Initial calculation
    window.addEventListener("resize", calculateItemWidth);
    return () => window.removeEventListener("resize", calculateItemWidth);
  }, [duplicatedItems]); // Recalculate when duplicated items are set or change

  // Auto-scrolling and continuous loop logic
  useEffect(() => {
    if (
      !itemWidth ||
      !sliderRef.current ||
      !data?.items?.length ||
      duplicatedItems.length === 0
    ) {
      return;
    }

    const totalOriginalWidth = itemWidth * data.items.length;
    // We only care about the length of one full cycle of original items

    const scroll = () => {
      if (!sliderRef.current) return;

      const currentScrollLeft = sliderRef.current.scrollLeft;

      // Check if we've scrolled past the first 'original' set
      if (currentScrollLeft >= totalOriginalWidth) {
        // If so, instantly jump back to the start of the next 'original' set
        // This creates the seamless loop illusion.
        sliderRef.current.scrollLeft = currentScrollLeft - totalOriginalWidth;
      }

      // If not dragging, continue auto-scrolling
      if (!isDragging) {
        sliderRef.current.scrollLeft += autoScrollSpeed;
      }

      animationFrameRef.current = requestAnimationFrame(scroll);
    };

    // Start auto-scroll
    animationFrameRef.current = requestAnimationFrame(scroll);

    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [itemWidth, data, duplicatedItems, isDragging]); // Dependencies for this effect

  // Drag Events
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    // Stop auto-scroll when dragging starts
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeftState(sliderRef.current.scrollLeft);
    sliderRef.current.style.cursor = "grabbing";
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || !sliderRef.current) return;
      e.preventDefault(); // Prevent text selection and other default behaviors
      const x = e.pageX - sliderRef.current.offsetLeft;
      const walk = (x - startX) * 2; // Adjust scroll speed during drag
      sliderRef.current.scrollLeft = scrollLeftState - walk;
    },
    [isDragging, startX, scrollLeftState]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (sliderRef.current) {
      sliderRef.current.style.cursor = "grab";
    }
    // Auto-scroll will naturally restart because `isDragging` changes state,
    // triggering the `useEffect` for auto-scrolling (which has `isDragging` in its dependencies).
  }, []);

  // For programmatic buttons, consider scrolling by a fixed amount that doesn't break the loop
  const handlePrevClick = () => {
    if (sliderRef.current && itemWidth) {
      // Temporarily stop auto-scroll for manual interaction
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      sliderRef.current.scrollBy({ left: -itemWidth, behavior: "smooth" });
      // Restart auto-scroll after a short delay or on next scroll frame
      // This is a common challenge with continuous auto-scroll and manual controls.
      // For simplicity, it will restart with the `isDragging` state change.
    }
  };

  const handleNextClick = () => {
    if (sliderRef.current && itemWidth) {
      // Temporarily stop auto-scroll for manual interaction
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      sliderRef.current.scrollBy({ left: itemWidth, behavior: "smooth" });
    }
  };

  return (
    <section className="px-4 sm:px-6 md:px-8 lg:px-16 space-y-4">
      {data?.title && (
        <div className="w-full flex justify-center items-center gap-3 sm:gap-4 md:gap-6">
          {left_decor && (
            <img
              src={left_decor}
              alt="Left Decoration"
              className="h-2 md:h-4 lg:h-6 w-[50vh] hidden md:block"
            />
          )}
          <h2 className="text-lg sm:text-2xl md:text-3xl font-bold flex gap-2 capitalize">
            <span className="bg-gradient-to-r from-[#FFB700] to-[#FF3B00] bg-clip-text text-transparent ">
              {data?.title?.split(" ")[0]}
            </span>
            <span>{data?.title?.split(" ")?.slice(1)?.join(" ")}</span>
          </h2>
          {right_decor && (
            <img
              src={right_decor}
              alt="Right Decoration"
              className="h-2 md:h-4 lg:h-6 w-[50vh] hidden md:block"
            />
          )}
        </div>
      )}

      <div className="relative">
        <div
          ref={sliderRef}
          className="flex overflow-x-auto gap-4 no-scrollbar cursor-grab select-none"
          // Removed scroll-smooth from here because the loop reset needs to be instantaneous
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp} // Important: Release drag state if mouse leaves
        >
          {duplicatedItems.map((category, index) => (
            <div
              key={`${category.id}-${index}`} // Ensure unique key for duplicated items
              className="flex-shrink-0 flex flex-col items-center text-center cursor-pointer transition-transform hover:scale-105"
              style={{ minWidth: "clamp(120px, 20vw, 200px)" }}
              onClick={() =>
                navigate(
                  `${config.VITE_BASE_WEBSITE_URL}/collection/category/${category.slug}`
                )
              }
            >
              <div className="w-[80%] aspect-square rounded-full flex items-center justify-center overflow-hidden shadow">
                <img
                  src={category.image}
                  alt={category.title}
                  className="object-contain w-50 h-50"
                />
              </div>
              <p className="mt-2 text-sm sm:text-base font-medium text-gray-700">
                {category.title}
              </p>
            </div>
          ))}
        </div>

        {/* Navigation buttons */}
        {data.items?.length > 0 && (
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

export default CategoryCollection;
