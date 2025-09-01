import React, { useEffect, useState } from "react";
import { getVariationDetails } from "../../../services/api.product";

const VariationSelection = ({ data, setReturnDetails, errors, setErrors }) => {
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(null);

  // Extract unique colors
  const colors = Array.from(new Set(data.map((item) => item.color_name)));

  // Filter sizes dynamically based on the selected color
  const filteredSizes = selectedColor
    ? data
        .filter((item) => item.color_name === selectedColor && item.stock > 0)
        .map((item) => item)
    : [];

  const handleSizeSelection = (variation) => {
    setSelectedVariation({
      variation_id: variation.id,
      color: variation.color_name,
      size: variation.size,
    });
    setReturnDetails((prev) => ({
      ...prev,
      variation_id: variation.id,
    }));
    setErrors((prev) => ({
      ...prev,
      variation_id: "",
    }));
  };

  return (
    <>
      {/* Color Selection */}
      <div className="mb-4 mt-4">
        <label className="text-sm font-medium text-[black]">
          Select Colors
        </label>
        <div className="flex flex-wrap gap-2 mt-2">
          {colors.map((color) => (
            <div key={color} className="flex items-center">
              <input
                type="radio"
                id={`color-${color}`}
                value={color}
                checked={selectedColor === color}
                onChange={() => {
                  setSelectedColor(color);
                  setSelectedVariation(null);
                }}
              />
              <label
                htmlFor={`color-${color}`}
                className="ml-2 text-sm text-[#484848]"
              >
                {color}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Size Selection */}
      {selectedColor && (
        <div>
          <label className="text-sm font-medium text-[black]">
            Select Sizes
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {filteredSizes.length > 0 ? (
              filteredSizes.map((variation) => (
                <div key={variation.id} className="flex items-center">
                  <input
                    type="radio"
                    id={`size-${variation.size}`}
                    value={variation.id}
                    checked={selectedVariation?.variation_id === variation.id}
                    onChange={() => handleSizeSelection(variation)}
                  />
                  <label
                    htmlFor={`size-${variation.size}`}
                    className="ml-2 text-sm text-[#484848]"
                  >
                    {variation.size}
                  </label>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No sizes available</p>
            )}
          </div>
        </div>
      )}
      {errors.variation_id && (
        <p className="text-sm text-red-500">{errors.variation_id}</p>
      )}
    </>
  );
};

const ReplaceOrder = ({
  isOpen,
  onClose,
  returnDetails,
  setReturnDetails,
  handleReturnDetailsCleanup,
  setShowReturnReplaceCancelConfirmModal,
  setReturnReplaceCancelMode,
  onReplace,
  orderToReturnReplaceCancel,
  errors,
  setErrors,
}) => {
  if (!isOpen) return;

  const [variations, setVariations] = useState([]);

  useEffect(() => {
    const fetchVariations = async () => {
      if (!isOpen || !orderToReturnReplaceCancel) return null;
      const res = await getVariationDetails(
        orderToReturnReplaceCancel?.productId
      );
      setVariations(res.data);
    };

    fetchVariations();
  }, [isOpen]);

  const handleReasonChange = (e) => {
    const { name, value } = e.target;
    if (name === "problem") {
      setReturnDetails((prev) => ({
        ...prev,
        return_reason: value,
      }));
      setErrors((prev) => ({
        ...prev,
        return_reason: "",
      }));
    } else if (name === "comments") {
      setReturnDetails((prev) => ({
        ...prev,
        replacement: true,
        comments: value,
      }));
    }
  };

  const handleErrors = () => {
    if (
      returnDetails.return_reason === "" ||
      (variations.length > 0 && !returnDetails.variation_id)
    ) {
      if (returnDetails.return_reason === "") {
        setErrors((prev) => ({
          ...prev,
          return_reason: "Please provide a reason befor proceeding further",
        }));
      }
      if (variations.length > 0 && !returnDetails.variation_id) {
        setErrors((prev) => ({
          ...prev,
          variation_id: "Please select a variation before proceeding further",
        }));
      }
      return false;
    }
    return true;
  };

  const handleReplaceClick = () => {
    if (!handleErrors()) return;
    setReturnReplaceCancelMode("replace");
    setShowReturnReplaceCancelConfirmModal(true);
    onReplace();
  };

  const colors = ["Red", "Blue", "Green", "Black", "White"];
  const sizes = ["S", "M", "L", "XL"];

  const toggleSelection = (option, setSelectedOptions, selectedOptions) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((item) => item !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  useEffect(() => {
    handleReturnDetailsCleanup();
  }, []);

  return (
    isOpen && (
      <div className="fixed inset-0 z-99 flex items-center justify-center bg-black bg-opacity-50  ">
        <div className="bg-white  p-8 max-h-[80%] max-w-3xl w-full relative font-Lato overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-700 hover:text-gray-900"
          >
            &times;
          </button>

          <div className="flex items-center justify-center ">
            <div className="w-full max-w-md">
              <h2 className="text-lg font-semibold text-[black] text-start mb-2">
                Replace Order
              </h2>
              <p className="text-xs text-[#484848] text-start mb-4">
                Please provide a reason why you want to cancel the order so that
                we can make your experience better the next time.
              </p>

              <div className="border  p-4  mb-6">
                <div className="flex items-center gap-2">
                  {/* Label */}
                  <label
                    htmlFor="problem"
                    className="text-sm font-medium  text-[#484848] "
                  >
                    Problem:
                  </label>

                  {/* Dropdown */}
                  <select
                    id="problem"
                    name="problem"
                    className="w-full p-2 text-sm border text-[black] bg-white focus:outline-none focus:ring-2 focus:ring-black    "
                    onChange={(e) => handleReasonChange(e)}
                  >
                    <option value="" disabled selected>
                      Select a reason
                    </option>
                    <option value="Sizing Issue">Sizing Issue</option>
                    <option value="Quality Issue">Quality Issue</option>
                    <option value="Wrong Item Received">
                      Wrong Item Received
                    </option>
                    <option value="Damaged Product">Damaged Product</option>
                    <option value="Changed Mind">Changed Mind</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {errors.return_reason && (
                  <div className="text-red-500 text-xs mt-1">
                    {errors.return_reason}
                  </div>
                )}

                {variations.length > 0 && (
                  <VariationSelection
                    data={variations}
                    setReturnDetails={setReturnDetails}
                    errors={errors}
                    setErrors={setErrors}
                  />
                )}

                {/* Textarea for Additional Comments */}
                <label
                  htmlFor="comments"
                  className="text-sm font-medium text-[#484848] mb-2 mt-2 block"
                >
                  Additional Comments
                </label>
                <textarea
                  id="comments"
                  name="comments"
                  rows="4"
                  placeholder="Please provide additional comments (optional)"
                  className="w-full p-2 border  text-sm text-[black] bg-white focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  onChange={(e) => handleReasonChange(e)}
                ></textarea>
              </div>

              {/* Cancel Button */}
              <button
                className="w-full py-2 bg-black text-white font-medium  transition flex items-center justify-center"
                onClick={handleReplaceClick}
              >
                Replace <span className="ml-2">&rarr;</span>
              </button>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="">
            <h3 className="font-medium text-lg text-[black] text-center my-6">
              Replace Policy
            </h3>
            <p className="text-[black] text-xs mb-4 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Vestibulum venenatis augue sed velit congue, in tincidunt arcu
              ullamcorper. Donec vehicula malesuada ante, sit amet laoreet elit
              dictum at. Curabitur nec metus nec neque pulvinar pretium.
              Suspendisse potenti. Proin aliquam, urna vel interdum scelerisque,
              sem neque tincidunt lectus, nec aliquam justo nisi id nisl.
              Praesent ullamcorper magna sed metus bibendum, eget dapibus justo
              eleifend.
            </p>
          </div>
        </div>
      </div>
    )
  );
};

export default ReplaceOrder;
