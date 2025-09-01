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

const CheckOutAddress = ({ setShipmentAddress }) => {
  const { user } = useAppContext();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isAddressUpdated, setIsAddressUpdated] = useState(false);

  const fetchAddresses = async () => {
    const response = await getAllAddress(user?.id);
    if (!response) return;

    const activeAddress = response.filter(
      (address) => address.is_active === true
    );
    setAddresses(activeAddress);
    const defaultAddress = response.find(
      (address) => address.is_default === true
    );
    if (defaultAddress) {
      setShipmentAddress(defaultAddress);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [isAddressUpdated]);

  const handleAddAddress = () => {
    setSelectedAddress(null);
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (updatedAddress) => {
    if (updatedAddress.id) {
      const response = await updateAddress(updatedAddress.id, updatedAddress);
      response && setIsAddressUpdated((prev) => !prev);
    } else {
      const res = await addAddress(user.id, updatedAddress);
      res && setIsAddressUpdated((prev) => !prev);
    }
    setShowAddressModal(false);
  };

  const handleSetDefaultAddress = async (address) => {
    try {
      await setDefaultAddress(user.id, address.id);
      setIsAddressUpdated((prev) => !prev);
    } catch (error) {
      console.error(
        "Error setting default address:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-[black] ">
          Select Delivery Address
        </h2>
      </div>

      <div className="space-y-4 mb-8">
        {addresses?.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <img className="mb-4" src={EmptyImg} alt="" />
            <h1 className="text-2xl font-bold mb-4">ADDRESS IS EMPTY</h1>
            <p className="text-gray-600 mb-8 text-center ">
              Add your different addresses.
            </p>
          </div>
        )}
        {addresses?.map((address) => (
          <div
            key={address.id}
            className={`flex flex-col items-start border ${
              address.is_default ? "" : ""
            }`}
          >
            <div className="flex items-start w-full sm:w-auto p-4">
              <input
                type="radio"
                name="defaultAddress"
                checked={address.is_default}
                onChange={() => handleSetDefaultAddress(address)}
                className="mr-4 mt-1 text-black"
              />
              <div className="">
                <p className=" text-[black] font-Lato font-semibold text-base  mt-2">
                  {address.first_name} {address.last_name}
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
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={handleAddAddress}
          className=" border border-black px-4 text-black py-3 flex gap-2 items-center"
        >
          <IoMdAdd />
          <span>Add Address</span>
        </button>
      </div>

      {showAddressModal && (
        <AddressModal
          address={selectedAddress}
          onSave={handleSaveAddress}
          onClose={() => setShowAddressModal(false)}
        />
      )}
    </div>
  );
};

export default CheckOutAddress;
