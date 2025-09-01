import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { updateAdData } from "../../../services/api.ads"; 

const AdHistoryModal = ({ isOpen, onClose, mode, adData }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: {
      id: "",
      name: "",
      subtitle: "",
    },
    amount: "",
    start_date: "",
    end_date: "",
    stock_limit: "",
    image: "",
  });

  const [imageFile, setImageFile] = useState({
    file: null,
    preview: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("category.")) {
      const categoryKey = name.split(".")[1]; 
      setFormData((prev) => ({
        ...prev,
        category: {
          ...prev.category,
          [categoryKey]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const file = files[0];
      setImageFile({
        file: file,
        preview: URL.createObjectURL(file),
      });
    }
  };

  const removeImage = () => {
    setImageFile({
      file: null,
      preview: null,
    });
  };

  useEffect(() => {
    if (adData && mode !== "add") {
      setFormData({
        name: adData.name || "",
        category: adData.category || {
          id: "",
          name: "",
          subtitle: "",
        },
        amount: adData.amount || "",
        start_date: adData.start_date || "",
        end_date: adData.end_date || "",
        stock_limit: adData.stock_limit || "",
        image: adData.image || "",
      });

      setImageFile({
        file: null,
        preview: adData.image || null,
      });
    }
  }, [adData, mode]);

  const validateForm = () => {
    if (!formData.name || !formData.amount || (!imageFile.file && !imageFile.preview)) {
      alert("Name, Amount, and Image are required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    if (imageFile.file) {
      formDataToSend.append("image", imageFile.file);
    }

    try {
      const response = await updateAdData(adData?.id, formDataToSend);
      if (response.status === 1) {
        onClose();
      }
    } catch (error) {
      console.error("Error updating Ad History:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[black] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {mode === "view" ? "View Ad History" : mode === "edit" ? "Edit Ad History" : "Add Ad History"}
            </h2>
            <button onClick={onClose} className="p-2">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  {mode === "view" ? (
                    <p>{formData.name}</p>
                  ) : (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                  {mode === "view" ? (
                    <p>{formData.category.name}</p>
                  ) : (
                    <input
                      type="text"
                      name="category.name"
                      value={formData.category.name}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category Subtitle</label>
                  {mode === "view" ? (
                    <p>{formData.category.subtitle}</p>
                  ) : (
                    <input
                      type="text"
                      name="category.subtitle"
                      value={formData.category.subtitle}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  {mode === "view" ? (
                    <p>{formData.amount}</p>
                  ) : (
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  {mode === "view" ? (
                    <p>{formData.start_date}</p>
                  ) : (
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  {mode === "view" ? (
                    <p>{formData.end_date}</p>
                  ) : (
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Limit</label>
                  {mode === "view" ? (
                    <p>{formData.stock_limit}</p>
                  ) : (
                    <input
                      type="number"
                      name="stock_limit"
                      value={formData.stock_limit}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Image Section */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ad Image</label>
                {mode !== "view" && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mb-4"
                  />
                )}
                {imageFile.preview && (
                  <div className="relative inline-block">
                    <img
                      src={imageFile.preview}
                      alt="Ad Preview"
                      className="w-32 h-32 object-cover rounded-md"
                    />
                    {mode !== "view" && (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-50">
                Cancel
              </button>
              {mode === "edit" && (
                <button type="submit" className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                  Update Ad History
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdHistoryModal
