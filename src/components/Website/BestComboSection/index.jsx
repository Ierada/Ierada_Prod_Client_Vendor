import React, { useEffect, useState, useMemo } from "react";
import { IoMdArrowForward, IoMdCheckmark } from "react-icons/io";
import { useNavigate } from "react-router";
import config from "../../../config/config";

const BestComboSection = ({
  comboProducts,
  handleAddComboToCart,
  addingToCart,
  currentProduct,
}) => {
  // Track selected products with their variations
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [selectedVariations, setSelectedVariations] = useState({});
  const [selectedSizes, setSelectedSizes] = useState({});

  const navigate = useNavigate();

  // Combine current product with combo products
  const allComboProducts = useMemo(() => {
    if (!currentProduct || !comboProducts) return [];
    const isCurrentProductInCombo = comboProducts.some(
      (p) => p.id === currentProduct.id
    );

    const updatedCurrentProductData = {
      id: currentProduct.id,
      name: currentProduct.name,
      slug: currentProduct.slug,
      original_price: currentProduct.original_price,
      discounted_price: currentProduct.discounted_price,
      discount_percentage: currentProduct.discount_percentage,
      images:
        currentProduct.media && currentProduct.media.length > 0
          ? currentProduct.media
          : currentProduct.variationMedia,
      variations: currentProduct.variations,
    };
    return isCurrentProductInCombo
      ? comboProducts
      : [updatedCurrentProductData, ...comboProducts];
  }, [currentProduct, comboProducts]);

  // Initialize selected products and their variations
  useEffect(() => {
    if (allComboProducts?.length > 0) {
      // Initialize selected products
      const initialSelectedIds = allComboProducts.map((product) => product.id);
      setSelectedProducts(initialSelectedIds);

      // Initialize variations and sizes for products that have them
      const initialVariations = {};
      const initialSizes = {};

      allComboProducts.forEach((product) => {
        if (product.variations?.length > 0) {
          // Select first variation
          initialVariations[product.id] = product.variations[0];
          // Select first size of first variation
          if (product.variations[0].sizes?.length > 0) {
            initialSizes[product.id] = product.variations[0].sizes[0];
          }
        }
      });

      setSelectedVariations(initialVariations);
      setSelectedSizes(initialSizes);
    }
  }, [allComboProducts]);

  // Calculate prices whenever selection changes
  useEffect(() => {
    calculateTotalSavings();
  }, [selectedProducts, selectedVariations, selectedSizes]);

  const handleProductSelect = (product) => {
    setSelectedProducts((prev) => {
      if (prev.length === 1 && prev.includes(product.id)) {
        return prev;
      }
      return prev.includes(product.id)
        ? prev.filter((id) => id !== product.id)
        : [...prev, product.id];
    });
  };

  const handleVariationSelect = (productId, variation) => {
    setSelectedVariations((prev) => ({
      ...prev,
      [productId]: variation,
    }));

    // Reset size selection to first size of new variation
    if (variation.sizes?.length > 0) {
      setSelectedSizes((prev) => ({
        ...prev,
        [productId]: variation.sizes[0],
      }));
    }
  };

  const handleSizeSelect = (productId, size) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: size,
    }));
  };

  const getProductPrice = (product) => {
    if (!product) return { original: 0, discounted: 0 };

    // If product has selected size, use its price if available
    const selectedSize = selectedSizes[product.id];
    if (selectedSize) {
      return {
        original: selectedSize.original_price ?? product.original_price,
        discounted: selectedSize.discounted_price ?? product.discounted_price,
      };
    }

    // Otherwise use product's base price
    return {
      original: product.original_price,
      discounted: product.discounted_price,
    };
  };

  const calculateTotalSavings = () => {
    const totalOriginal = selectedProducts.reduce((total, productId) => {
      const product = allComboProducts.find((p) => p.id === productId);
      return total + getProductPrice(product).original;
    }, 0);

    const totalDiscounted = selectedProducts.reduce((total, productId) => {
      const product = allComboProducts.find((p) => p.id === productId);
      return total + getProductPrice(product).discounted;
    }, 0);

    setTotalSavings(totalOriginal - totalDiscounted);
  };

  const calculateComboPrice = () => {
    return selectedProducts.reduce((total, productId) => {
      const product = allComboProducts.find((p) => p.id === productId);
      return total + getProductPrice(product).discounted;
    }, 0);
  };

  const handlePurchaseTogether = async () => {
    if (selectedProducts.length < 2) return;

    // Create array of selected products with their variation and size IDs
    const selectedProductsData = selectedProducts.map((productId) => {
      const product = allComboProducts.find((p) => p.id === productId);
      const variation = selectedVariations[productId];
      const size = selectedSizes[productId];

      return {
        product_id: productId,
        variation_id: variation?.id || null,
        size_id: size?.size_id || null,
      };
    });

    try {
      await handleAddComboToCart(selectedProductsData);
    } catch (error) {
      console.error("Error adding combo to cart:", error);
    }
  };

  if (!allComboProducts?.length) return null;

  return (
    <section className="bg-[#FAFDF1] px-4 sm:px-6 md:px-8 lg:px-16 py-6 md:py-8">
      <h2 className="text-center text-xl md:text-2xl mb-6 md:mb-8 text-[#000000]">
        Affordable Together - Best Combo
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {allComboProducts?.map((product) => (
          <div
            key={product.id}
            className="relative rounded-lg p-3 md:p-4 flex flex-col justify-between border border-gray-200 bg-white"
          >
            <button
              className={`absolute top-2 right-2 p-1.5 md:p-2 rounded-md transition-colors z-10 ${
                selectedProducts.includes(product.id)
                  ? "bg-black text-white"
                  : "bg-gray-200 text-black hover:bg-gray-300"
              }`}
              onClick={() => handleProductSelect(product)}
              disabled={
                selectedProducts.length === 1 &&
                selectedProducts.includes(product.id)
              }
              aria-label={
                selectedProducts.includes(product.id)
                  ? "Deselect product"
                  : "Select product"
              }
            >
              {selectedProducts.includes(product.id) ? (
                <IoMdCheckmark size={16} className="md:size-[18px]" />
              ) : (
                <div className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </button>

            <div
              className="space-y-3 md:space-y-4 cursor-pointer"
              onClick={() =>
                navigate(
                  `${config.VITE_BASE_WEBSITE_URL}/product/${product.slug}`
                )
              }
            >
              <div className="aspect-square overflow-hidden rounded-md">
                <img
                  src={product.images?.[0]?.url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-base md:text-lg font-bold line-clamp-2 h-12 overflow-hidden">
                  {product.name}
                </h3>

                {/* Variations Selection */}
                {product.variations?.length > 0 && (
                  <div className="space-y-1 md:space-y-2">
                    <p className="text-xs md:text-sm text-gray-600">
                      Color - {selectedVariations[product.id]?.color_name}
                    </p>
                    <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {product.variations.map((variation) => (
                        <button
                          key={variation.id}
                          onClick={() =>
                            handleVariationSelect(product.id, variation)
                          }
                          className={`flex-none size-8 md:size-10 rounded-full border-2 ${
                            selectedVariations[product.id]?.id === variation.id
                              ? "border-black"
                              : "border-gray-200"
                          }`}
                          style={{ backgroundColor: variation.color_code }}
                          aria-label={`Select ${variation.color_name} color`}
                        />
                      ))}
                    </div>

                    {/* Size Selection */}
                    {selectedVariations[product.id]?.sizes?.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs md:text-sm text-gray-600">Size</p>
                        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                          {selectedVariations[product.id].sizes.map((size) => (
                            <button
                              key={size.size_id}
                              onClick={() => handleSizeSelect(product.id, size)}
                              className={`flex-none px-2 py-1 text-xs md:px-3 md:py-1.5 md:text-sm border rounded ${
                                selectedSizes[product.id]?.size_id ===
                                size.size_id
                                  ? "bg-black text-white"
                                  : "border-gray-200"
                              }`}
                            >
                              {size.size_name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-gray-500 line-through text-xs md:text-sm">
                    ₹{getProductPrice(product).original?.toLocaleString()}
                  </span>
                  <span className="font-semibold text-sm md:text-base">
                    ₹{getProductPrice(product).discounted?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6 md:mt-8">
        <div className="text-sm md:text-base text-gray-600">
          Total Savings:{" "}
          <span className="text-green-600 font-semibold">
            ₹{totalSavings?.toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <span className="text-lg md:text-xl font-semibold">
            ₹{calculateComboPrice()?.toLocaleString()}
          </span>
          <button
            onClick={handlePurchaseTogether}
            disabled={addingToCart || selectedProducts.length < 2}
            className="bg-black text-white px-4 py-2 md:px-6 md:py-3 rounded-md border border-black 
              text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed
              hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            {addingToCart ? (
              "Adding to Cart..."
            ) : (
              <>
                Purchase Together
                <IoMdArrowForward className="hidden sm:block" />
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};

export default BestComboSection;
