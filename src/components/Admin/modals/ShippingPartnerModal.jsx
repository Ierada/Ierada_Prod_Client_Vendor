import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { updateShippingPartner } from "../../../services/api.shippingpartner";

const ShippingPartnerModal = ({ isOpen, onClose, shippingPartner }) => {
  const [formData, setFormData] = useState({
    name: "",
    api_url: "",
    api_key: "",
    tracking_url: "",
    status: "",
  });

  useEffect(() => {
    if (shippingPartner) {
      setFormData({
        name: shippingPartner.name || "",
        api_url: shippingPartner.api_url || "",
        api_key: shippingPartner.api_key || "",
        tracking_url: shippingPartner.tracking_url || "",
        status: shippingPartner.status || "",
      });
    }
  }, [shippingPartner]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name) {
      alert("Vendor Name is required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await updateShippingPartner(shippingPartner?.id, formData);
      if (response.status === 1) {
        onClose();
      } else {
      }
    } catch (error) {
      console.error("Error updating shippingPartner:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[black] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Edit ShippingPartner</h2>
            <button onClick={onClose} className="p-2">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">API URL</label>
                  <input
                    type="text"
                    name="api_url"
                    value={formData.api_url}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">API KEY</label>
                  <input
                    type="text"
                    name="api_key"
                    value={formData.api_key}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tracking URL</label>
                  <input
                    type="text"
                    name="tracking_url"
                    value={formData.tracking_url}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-gray-800">
                Update Charge
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShippingPartnerModal;
