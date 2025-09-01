import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { getAllLabels, updateLabel } from "../../../services/api.label";

const LabelModal = ({ isOpen, onClose, mode, label }) => {
  console.log(label, "label");
  
  const [formData, setFormData] = useState({
    designer_id: "",
    image: "",
  });

  const [imageFile, setImageFile] = useState({
    file: null,
    preview: null,
  });

  useEffect(() => {
    if (label && mode !== "add") {
      setFormData({
        designer_id: label.designer_id || "",
        image: label.image || "",
      });

      setImageFile({
        file: null,
        preview: label.image || null,
      });
    }
  }, [label, mode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const validateForm = () => {
    if (!formData.designer_id || (!imageFile.file && !imageFile.preview)) {
      alert("Designer ID and Image are required.");
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
      const response = await updateLabel(label?.id, formDataToSend);
      if (response.status === 1) {
        await getAllLabels();
        onClose();
      }
    } catch (error) {
      console.error("Error updating label:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[black] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {mode === "view"
                ? "View Label"
                : mode === "edit"
                ? "Edit Label"
                : "Add Label"}
            </h2>
            <button onClick={onClose} className="p-2">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Label Information */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Designer ID
                  </label>
                  {mode === "view" ? (
                    <p>{formData.designer_id}</p>
                  ) : (
                    <input
                      type="number"
                      name="designer_id"
                      value={formData.designer_id}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Image Section */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Label Image
                </label>
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
                      alt="Label Preview"
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
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              {mode !== "view" && (
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                >
                    Update Label
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LabelModal;
