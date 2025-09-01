import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    const scrolled = window.scrollY;
    setIsVisible(scrolled > 300);
  };

  // Set the scroll event listener
  useEffect(() => {
    // Initial check
    toggleVisibility();
    
    // Add scroll listener
    window.addEventListener('scroll', toggleVisibility);
    
    // Cleanup
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Smooth scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-[9999] p-3 bg-black hover:bg-gray-800 text-white rounded-full shadow-lg transition-all duration-300 ease-in-out hover:transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 group"
          aria-label="Scroll to top"
        >
          <ChevronUp 
            className="w-6 h-6 group-hover:animate-bounce" 
            strokeWidth={2.5}
          />
        </button>
      )}
    </>
  );
};

export default ScrollToTop;