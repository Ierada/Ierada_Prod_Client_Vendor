import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X } from "lucide-react";

const OfferModal = ({ isOpen, onClose, mode, offer }) => {
  const [offerData, setOfferData] = useState({
    title: "",
    description: "",
    discountType: "",
    discountValue: "",
    startDate: "",
    endDate: "",
    isActive: false,
    product_id: "",
    category_id: "",
    sub_category_id: "",
    inner_subcategory_id: "",
    image: "",
  });

  // Initialize with offer data when modal opens
  useEffect(() => {
    if (offer) {
      setOfferData({
        ...offer,
        // Format dates for display if they exist
        startDate: offer.startDate
          ? new Date(offer.startDate).toLocaleDateString()
          : "N/A",
        endDate: offer.endDate
          ? new Date(offer.endDate).toLocaleDateString()
          : "N/A",
      });
    }
  }, [offer]);

  if (!isOpen) return null;

  // Determine offer type
  const getOfferType = () => {
    if (offerData.product_id) return "Product";
    if (offerData.category_id) return "Category";
    if (offerData.sub_category_id) return "Subcategory";
    if (offerData.inner_subcategory_id) return "Inner Subcategory";
    return "N/A";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Offer Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Offer image */}
          {offerData.image && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Offer Image
              </h3>
              <div className="relative inline-block">
                <img
                  src={offerData.image}
                  alt="Offer Image"
                  className="w-full max-h-48 object-contain rounded-md"
                />
              </div>
            </div>
          )}

          {/* Basic info section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Basic Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600 text-sm">Title:</span>
                <p className="font-medium">{offerData.title || "N/A"}</p>
              </div>

              <div>
                <span className="text-gray-600 text-sm">Description:</span>
                <p>{offerData.description || "N/A"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600 text-sm">Start Date:</span>
                  <p>{offerData.startDate}</p>
                </div>

                <div>
                  <span className="text-gray-600 text-sm">End Date:</span>
                  <p>{offerData.endDate}</p>
                </div>
              </div>

              <div>
                <span className="text-gray-600 text-sm">Status:</span>
                <p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      offerData.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {offerData.isActive ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Offer type section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Offer Type</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600 text-sm">Applied To:</span>
                <p className="font-medium">{getOfferType()}</p>
              </div>

              {offerData.product_id && offerData.Product && (
                <div>
                  <span className="text-gray-600 text-sm">Product:</span>
                  <p>{offerData.Product?.name}</p>
                </div>
              )}

              {offerData.category_id && offerData.Category && (
                <div>
                  <span className="text-gray-600 text-sm">Category:</span>
                  <p>{offerData.Category?.title}</p>
                </div>
              )}

              {offerData.sub_category_id && offerData.SubCategory && (
                <div>
                  <span className="text-gray-600 text-sm">Subcategory:</span>
                  <p>{offerData.SubCategory?.title}</p>
                </div>
              )}

              {offerData.inner_subcategory_id && offerData.InnerSubCategory && (
                <div>
                  <span className="text-gray-600 text-sm">
                    Inner Subcategory:
                  </span>
                  <p>{offerData.InnerSubCategory?.title}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Close button */}
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

OfferModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(["view"]).isRequired,
  offer: PropTypes.object,
};

OfferModal.defaultProps = {
  offer: null,
};

export default OfferModal;
