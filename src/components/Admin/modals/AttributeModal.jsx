import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const AttributeModal = ({ isOpen, onClose, mode, attribute }) => {
  const [error, setError] = useState({});
  const [formData, setFormData] = useState({
    attribute_name: "",
    cat_id: "",
    subCategory_id: "",
  });

  // Prefill the form when the mode is 'edit' or 'view' or when 'attribute' prop changes
  useEffect(() => {
    if (mode === "edit" || mode === "view") {
      if (attribute) {
        setFormData({
          attribute_name: attribute.attribute_name || "",
          cat_id: attribute.cat_id || "",
          subCategory_id: attribute.subCategory_id || "",
        });
      }
    } else if (mode === "add") {
      setFormData({
        attribute_name: "",
        cat_id: "",
        subCategory_id: "",
      });
    }
  }, [mode, attribute]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    let errors = {};
    if (!formData.attribute_name)
      errors.attribute_name = "Attribute Name is required";
    if (!formData.cat_id) errors.cat_id = "Category Name is required";
    if (!formData.subCategory_id)
      errors.subCategory_id = "SubCategory Name is required";
    setError(errors);
    return Object.keys(errors).length === 0; // Return true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) return;

    // Handle adding or updating the attribute
    if (mode === "add") {
      console.log("Adding new attribute:", formData);
    } else if (mode === "edit") {
      console.log("Editing attribute:", formData);
    }

    // Close the modal after submission
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[black] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-[#1A1C21]">
              {mode === "view"
                ? "View Attribute"
                : mode === "edit"
                ? "Edit Attribute"
                : "Add New Attribute"}
            </h2>
            <button onClick={onClose} className="p-2">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#4D5464] mb-2">
                    Attribute Name
                  </label>
                  {mode === "view" ? (
                    <p>{formData.attribute_name || "No name provided"}</p>
                  ) : (
                    <>
                      <input
                        type="text"
                        name="attribute_name"
                        value={formData.attribute_name || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                        placeholder="Enter Attribute Name"
                      />
                      {error.attribute_name && (
                        <p className="text-red-500 text-sm mt-1">
                          {error.attribute_name}
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4D5464] mb-2">
                    Category Name
                  </label>
                  {mode === "view" ? (
                    <p>{formData.cat_id || "No category provided"}</p>
                  ) : (
                    <>
                      <input
                        type="text"
                        name="cat_id"
                        value={formData.cat_id || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                        placeholder="Enter Category Name"
                      />
                      {error.cat_id && (
                        <p className="text-red-500 text-sm mt-1">
                          {error.cat_id}
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4D5464] mb-2">
                    SubCategory Name
                  </label>
                  {mode === "view" ? (
                    <p>
                      {formData.subCategory_id || "No subcategory provided"}
                    </p>
                  ) : (
                    <>
                      <input
                        type="text"
                        name="subCategory_id"
                        value={formData.subCategory_id || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                        placeholder="Enter SubCategory Name"
                      />
                      {error.subCategory_id && (
                        <p className="text-red-500 text-sm mt-1">
                          {error.subCategory_id}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            {mode === "edit" && (
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F47954] text-white rounded-md"
                >
                  Update
                </button>
              </div>
            )}
            {mode === "add" && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F47954] text-white rounded-md"
                >
                  Create Attribute
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AttributeModal;
