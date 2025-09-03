import React, { useState, useEffect } from "react";
import AddressModal from "../AddressModal";
import ConfirmationModal from "../ConfirmationModal";
import {
  getAllAddress,
  deleteAddress,
  addAddress,
  updateAddress,
  setDefaultAddress,
} from "../../../services/api.address";
import { useAppContext } from "../../../context/AppContext";
import EmptyImg from "/assets/skeleton/empty-address.svg";

import { Trash2 } from "lucide-react";
import { MdEdit } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";

const CheckOutAddress = ({ setShipmentAddress, setBillingAddress }) => {
  const { user } = useAppContext();
  const [addresses, setAddresses] = useState([]);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState(null);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [modalType, setModalType] = useState(null); // 'shipping' or 'billing'
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isAddressUpdated, setIsAddressUpdated] = useState(false);

  const fetchAddresses = async () => {
    const response = await getAllAddress(user?.id);
    if (!response) return;

    const activeAddress = response.filter(
      (address) => address.is_active === true
    );
    setAddresses(activeAddress);

    // Set initial selections based on default address or first available
    const defaultAddress = response.find(
      (address) => address.is_default === true
    );
    if (defaultAddress) {
      setSelectedShippingAddress(defaultAddress);
      setSelectedBillingAddress(defaultAddress);
      setShipmentAddress(defaultAddress);
      setBillingAddress(defaultAddress);
    } else if (activeAddress.length > 0) {
      setSelectedShippingAddress(activeAddress[0]);
      setSelectedBillingAddress(activeAddress[0]);
      setShipmentAddress(activeAddress[0]);
      setBillingAddress(activeAddress[0]);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [isAddressUpdated]);

  const handleAddAddress = (type) => {
    setModalType(type);
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (updatedAddress) => {
    if (updatedAddress.id) {
      const response = await updateAddress(updatedAddress.id, updatedAddress);
      response && setIsAddressUpdated((prev) => !prev);
    } else {
      const res = await addAddress(user.id, updatedAddress);
      if (res) {
        setIsAddressUpdated((prev) => !prev);
        // Set new address as selected for the respective type
        if (modalType === "shipping") {
          setSelectedShippingAddress(res);
          setShipmentAddress(res);
        } else if (modalType === "billing") {
          setSelectedBillingAddress(res);
          setBillingAddress(res);
        }
      }
    }
    setShowAddressModal(false);
    setModalType(null);
  };

  const handleSelectAddress = (address, type) => {
    if (type === "shipping") {
      setSelectedShippingAddress(address);
      setShipmentAddress(address);
    } else if (type === "billing") {
      setSelectedBillingAddress(address);
      setBillingAddress(address);
    }
  };

  const handleSetDefaultAddress = async (address) => {
    try {
      await setDefaultAddress(user.id, address.id);
      setIsAddressUpdated((prev) => !prev);
      // Update both selections to default address
      setSelectedShippingAddress(address);
      setSelectedBillingAddress(address);
      setShipmentAddress(address);
      setBillingAddress(address);
    } catch (error) {
      console.error(
        "Error setting default address:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className="w-full">
      {/* Shipping Address Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-[black]">
            Select Shipping Address
          </h2>
        </div>

        <div className="space-y-4 mb-8">
          {addresses?.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full">
              <img className="mb-4" src={EmptyImg} alt="Empty Address" />
              <h1 className="text-2xl font-bold mb-4">ADDRESS IS EMPTY</h1>
              <p className="text-gray-600 mb-8 text-center">
                Add your different addresses.
              </p>
            </div>
          )}
          {addresses?.map((address) => (
            <div
              key={`shipping-${address.id}`}
              className={`flex flex-col items-start border ${
                address.id === selectedShippingAddress?.id ? "border-black" : ""
              }`}
            >
              <div className="flex items-start w-full sm:w-auto p-4">
                <input
                  type="radio"
                  name="shippingAddress"
                  checked={address.id === selectedShippingAddress?.id}
                  onChange={() => handleSelectAddress(address, "shipping")}
                  className="mr-4 mt-1 text-black"
                />
                <div>
                  <p className="text-[black] font-Lato font-semibold text-base mt-2">
                    {address.first_name} {address.last_name}
                    {address.is_default && (
                      <span className="ml-2 text-sm text-gray-500">
                        (Default)
                      </span>
                    )}
                  </p>
                  <h3 className="text-sm text-[black] font-Lato my-2">
                    {address.street_address}
                  </h3>
                  <p className="text-sm text-[black] font-Lato mb-2">
                    {address.city}, {address.state} {address.zip}
                  </p>
                  <p className="text-sm text-[black] font-Lato">
                    Mobile: {address.phone}
                  </p>
                  {!address.is_default && (
                    <button
                      onClick={() => handleSetDefaultAddress(address)}
                      className="text-sm text-blue-600 mt-2"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={() => handleAddAddress("shipping")}
            className="border border-black px-4 text-black py-3 flex gap-2 items-center"
          >
            <IoMdAdd />
            <span>Add Shipping Address</span>
          </button>
        </div>
      </div>

      {/* Billing Address Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-[black]">
            Select Billing Address
          </h2>
        </div>

        <div className="space-y-4 mb-8">
          {addresses?.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full">
              <img className="mb-4" src={EmptyImg} alt="Empty Address" />
              <h1 className="text-2xl font-bold mb-4">ADDRESS IS EMPTY</h1>
              <p className="text-gray-600 mb-8 text-center">
                Add your different addresses.
              </p>
            </div>
          )}
          {addresses?.map((address) => (
            <div
              key={`billing-${address.id}`}
              className={`flex flex-col items-start border ${
                address.id === selectedBillingAddress?.id ? "border-black" : ""
              }`}
            >
              <div className="flex items-start w-full sm:w-auto p-4">
                <input
                  type="radio"
                  name="billingAddress"
                  checked={address.id === selectedBillingAddress?.id}
                  onChange={() => handleSelectAddress(address, "billing")}
                  className="mr-4 mt-1 text-black"
                />
                <div>
                  <p className="text-[black] font-Lato font-semibold text-base mt-2">
                    {address.first_name} {address.last_name}
                    {address.is_default && (
                      <span className="ml-2 text-sm text-gray-500">
                        (Default)
                      </span>
                    )}
                  </p>
                  <h3 className="text-sm text-[black] font-Lato my-2">
                    {address.street_address}
                  </h3>
                  <p className="text-sm text-[black] font-Lato mb-2">
                    {address.city}, {address.state} {address.zip}
                  </p>
                  <p className="text-sm text-[black] font-Lato">
                    Mobile: {address.phone}
                  </p>
                  {!address.is_default && (
                    <button
                      onClick={() => handleSetDefaultAddress(address)}
                      className="text-sm text-blue-600 mt-2"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={() => handleAddAddress("billing")}
            className="border border-black px-4 text-black py-3 flex gap-2 items-center"
          >
            <IoMdAdd />
            <span>Add Billing Address</span>
          </button>
        </div>
      </div>

      {showAddressModal && (
        <AddressModal
          address={
            modalType === "shipping"
              ? selectedShippingAddress
              : selectedBillingAddress
          }
          onSave={handleSaveAddress}
          onClose={() => {
            setShowAddressModal(false);
            setModalType(null);
          }}
        />
      )}
    </div>
  );
};

export default CheckOutAddress;
