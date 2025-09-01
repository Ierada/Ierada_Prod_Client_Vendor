import React, { useEffect, useState } from "react";
import { X, Image as ImageIcon, Video as VideoIcon } from "lucide-react";

const BannerModal = ({
  isOpen,
  onClose,
  mode,
  banner,
  categories = [],
  subcategories = [],
  innerSubCategories = [],
}) => {
  const [formData, setFormData] = useState({
    title: "",
    positions: "hometop",
    link: "",
    cat_id: "",
    subcat_id: "",
    inner_subcat_id: "",
    file_type: "image",
    file_url: "",
    mobile_image_url: "",
  });

  useEffect(() => {
    if (banner && mode === "view") {
      setFormData({
        title: banner.title || "",
        positions: banner.positions || "hometop",
        link: banner.link || "",
        cat_id: banner.cat_id || "",
        subcat_id: banner.subcat_id || "",
        inner_subcat_id: banner.inner_subcat_id || "",
        file_type: banner.file_type || "image",
        file_url: banner.file_url || "",
        mobile_image_url: banner.mobile_image_url || "",
      });
    }
  }, [banner, mode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">View Banner</h2>
            <button onClick={onClose} className="p-2">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Banner Details */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Title */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <p className="text-gray-900">{formData.title || "N/A"}</p>
                </div>

                {/* Subtitle */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle
                  </label>
                  <p className="text-gray-900">{formData.subtitle || "N/A"}</p>
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  <p className="text-gray-900">{formData.positions || "N/A"}</p>
                </div>

                {/* Link Type and Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link Type
                  </label>
                  <p className="text-gray-900">{formData.link_type || "N/A"}</p>
                </div>

                {formData.link_type === "direct_link" && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link URL
                    </label>
                    <p className="text-gray-900">{formData.link || "N/A"}</p>
                  </div>
                )}

                {(formData.link_type === "category" ||
                  formData.link_type === "subcategory" ||
                  formData.link_type === "innersubcategory") && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <p className="text-gray-900">
                      {formData.cat_id
                        ? categories.find((cat) => cat.id === formData.cat_id)
                            ?.name || "N/A"
                        : "No Category Selected"}
                    </p>
                  </div>
                )}

                {(formData.link_type === "subcategory" ||
                  formData.link_type === "innersubcategory") &&
                  formData.subcat_id && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subcategory
                      </label>
                      <p className="text-gray-900">
                        {formData.subcat_id
                          ? subcategories.find(
                              (sub) => sub.id === formData.subcat_id
                            )?.name || "N/A"
                          : "No Subcategory Selected"}
                      </p>
                    </div>
                  )}

                {formData.link_type === "innersubcategory" &&
                  formData.inner_subcat_id && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Inner Subcategory
                      </label>
                      <p className="text-gray-900">
                        {formData.inner_subcat_id
                          ? innerSubCategories.find(
                              (inner) => inner.id === formData.inner_subcat_id
                            )?.name || "N/A"
                          : "No Inner Subcategory Selected"}
                      </p>
                    </div>
                  )}
              </div>
            </div>

            {/* Media Preview */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Preview
              </label>
              {formData.file_type === "image" ? (
                <div className="space-y-4">
                  {formData.file_url && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Desktop Image
                      </p>
                      <div className="relative inline-block">
                        <img
                          src={formData.file_url}
                          alt="Banner Preview"
                          className="w-full max-h-48 object-cover rounded-md"
                        />
                        <ImageIcon className="absolute top-2 left-2 h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                  )}
                  {formData.mobile_image_url && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Mobile Image
                      </p>
                      <div className="relative inline-block">
                        <img
                          src={formData.mobile_image_url}
                          alt="Mobile Banner Preview"
                          className="w-full max-h-48 object-cover rounded-md"
                        />
                        <ImageIcon className="absolute top-2 left-2 h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                formData.file_url && (
                  <div className="relative inline-block">
                    <video
                      src={formData.file_url}
                      controls
                      className="w-full max-h-48 object-cover rounded-md"
                    />
                    <VideoIcon className="absolute top-2 left-2 h-6 w-6 text-gray-400" />
                  </div>
                )
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerModal;
