import React, { useState } from "react";
import { X, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import WomenSizeGuide from "/assets/banners/size-guide-women-cm.svg";

const SizeGuideModal = ({ isOpen, onClose, sizeGuideImage }) => {
  const [zoomChart, setZoomChart] = useState(1);

  if (!isOpen) return null;

  const handleZoom = (direction) => {
    const zoomStep = 0.1;
    if (direction === "in") setZoomChart((z) => Math.min(z + zoomStep, 2));
    else if (direction === "out")
      setZoomChart((z) => Math.max(z - zoomStep, 0.5));
    else setZoomChart(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-semibold">Size Guide</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleZoom("in")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Zoom in"
            >
              <ZoomIn size={18} />
            </button>
            <button
              onClick={() => handleZoom("out")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Zoom out"
            >
              <ZoomOut size={18} />
            </button>
            <button
              onClick={() => handleZoom("reset")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Reset zoom"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="relative w-full">
            <img
              src={sizeGuideImage || WomenSizeGuide}
              alt="Size chart"
              className="w-full h-auto transition-transform duration-300 mx-auto"
              style={{
                transform: `scale(${zoomChart})`,
                transformOrigin: "top center",
              }}
            />
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              These are Garment Sizes. Take your body measurements and match the
              garments accordingly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuideModal;
