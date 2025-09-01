import React, { useState, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ImageMagnifier = ({
  src,
  alt = "Product Image",
  magnifierHeight = 200,
  magnifierWidth = 200,
}) => {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const elem = imageRef.current;
    if (elem) {
      const { left, top, width, height } = elem.getBoundingClientRect();

      const x = e.pageX - left - window.pageXOffset;
      const y = e.pageY - top - window.pageYOffset;

      setCoordinates({ x, y });
    }
  }, []);

  return (
    <div
      className="relative w-full h-full cursor-zoom-in"
      onMouseEnter={() => setShowMagnifier(true)}
      onMouseLeave={() => setShowMagnifier(false)}
      onMouseMove={handleMouseMove}
    >
      <img ref={imageRef} src={src} alt={alt} className="w-full h-full" />

      {showMagnifier && (
        <div
          className="absolute border-2 border-gray-300 pointer-events-none"
          style={{
            height: `${magnifierHeight}px`,
            width: `${magnifierWidth}px`,
            top: coordinates.y - magnifierHeight / 2,
            left: coordinates.x - magnifierWidth / 2,
            backgroundImage: `url(${src})`,
            backgroundSize: `${imageRef.current.width * 2}px ${
              imageRef.current.height * 2
            }px`,
            backgroundPosition: `-${coordinates.x * 2}px -${
              coordinates.y * 2
            }px`,
            zIndex: 50,
          }}
        />
      )}
    </div>
  );
};

const ProductImagesSection = ({
  productData,
  selectedColor,
  selectedSize,
  onReadMoreClick,
}) => {
  const [activeImg, setActiveImg] = useState(null);

  const getAvailableImages = () => {
    if (productData.is_variation) {
      if (
        selectedColor &&
        selectedColor.images &&
        selectedColor.images.length > 0
      ) {
        return selectedColor.images;
      }
      const allVariationImages = productData.variations?.color?.reduce(
        (acc, variation) => {
          if (variation.images && variation.images.length > 0) {
            return [...acc, ...variation.images];
          }
          return acc;
        },
        []
      );

      if (allVariationImages && allVariationImages.length > 0) {
        return allVariationImages;
      }
    }

    return productData.images || [];
  };

  const images = getAvailableImages();

  React.useEffect(() => {
    if (images.length > 0 && !activeImg) {
      setActiveImg(images[0]);
    }
  }, [images]);

  React.useEffect(() => {
    if (
      selectedColor &&
      selectedColor.images &&
      selectedColor.images.length > 0
    ) {
      setActiveImg(selectedColor.images[0]);
    }
  }, [selectedColor]);

  const handlePrevImage = () => {
    const currentIndex = images.findIndex((img) => img === activeImg);
    if (currentIndex > 0) {
      setActiveImg(images[currentIndex - 1]);
    }
  };

  const handleNextImage = () => {
    const currentIndex = images.findIndex((img) => img === activeImg);
    if (currentIndex < images.length - 1) {
      setActiveImg(images[currentIndex + 1]);
    }
  };

  if (!productData || images.length === 0) {
    return (
      <div className="w-full lg:1/2 xl:w-2/5 flex flex-col">
        <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-500">No images available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Thumbnail Column */}
        <div className="flex md:flex-col gap-2 order-2 md:order-1">
          {images?.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveImg(img)}
              className={`relative w-16 md:w-20 aspect-square border rounded-lg ${
                activeImg === img ? "border-black border-2" : "border-gray-300"
              }`}
            >
              {activeImg !== img && (
                <div className="absolute inset-0 bg-white opacity-50" />
              )}
              <img
                src={img}
                alt={`Product view ${index + 1}`}
                className="w-full h-full rounded-lg"
              />
            </button>
          ))}
        </div>

        {/* Main Image */}
        <div className="w-full order-1 md:order-2">
          <div className="w-full h-[500px] md:h-[600px] bg-gray-50 rounded-lg overflow-hidden">
            <ImageMagnifier
              src={activeImg}
              alt={productData.name}
              magnifierHeight={200}
              magnifierWidth={200}
            />
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <button
            onClick={handlePrevImage}
            disabled={images.indexOf(activeImg) === 0}
            className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNextImage}
            disabled={images.indexOf(activeImg) === images.length - 1}
            className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Product Specifications */}
      <div className="p-2">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold mb-4">Product Specifications</h3>
          <button className="underline" onClick={onReadMoreClick}>
            Read More
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#FAFDF1]">
              <tr>
                <th className="px-4 py-2 border-b font-medium text-left">
                  Feature
                </th>
                <th className="px-4 py-2 border-b font-medium text-left">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {productData?.product_features?.map((feature, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-white" : "bg-[#FAFDF1]"}
                >
                  <td className="px-4 py-2 border-b">{feature.name}</td>
                  <td className="px-4 py-2 border-b">{feature.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductImagesSection;
