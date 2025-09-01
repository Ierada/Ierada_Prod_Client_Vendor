import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { updateCharge } from "../../../services/api.charges";

const ChargesModal = ({ isOpen, onClose, charge }) => {
  const [formData, setFormData] = useState({
    charge_name: "",
    charge_type: "",
    hsn_code: "",
    charges_price: "",
    description: "",
  });

  useEffect(() => {
    if (charge) {
      setFormData({
        charge_name: charge.charge_name || "",
        charge_type: charge.charge_type || "",
        hsn_code: charge.hsn_code || "",
        charges_price: charge.charges_price || "",
        description: charge.description || "",
      });
    }
  }, [charge]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.charge_name || !formData.charges_price) {
      alert("Charge Name and Charges Price are required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await updateCharge(charge?.id, formData);
      if (response.status === 1) {
        alert("Charge updated successfully!");
        onClose(); 
      } else {
        alert("Failed to update charge. Please try again.");
      }
    } catch (error) {
      console.error("Error updating charge:", error);
      alert("An error occurred while updating the charge.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[black] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Edit Charge</h2>
            <button onClick={onClose} className="p-2">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Charge Name
                  </label>
                  <input
                    type="text"
                    name="charge_name"
                    value={formData.charge_name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Charge Type
                  </label>
                  <input
                    type="text"
                    name="charge_type"
                    value={formData.charge_type}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HSN Code
                  </label>
                  <input
                    type="text"
                    name="hsn_code"
                    value={formData.hsn_code}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Charges Price
                  </label>
                  <input
                    type="number"
                    name="charges_price"
                    value={formData.charges_price}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
            </div>

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
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Update Charge
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChargesModal;
