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
import { Import, Trash2, User } from "lucide-react";
import { MdEdit } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";


const MyAddress = ({ setShipmentAddress }) => {
  const { user } = useAppContext();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isAddressUpdated, setIsAddressUpdated] = useState(false);


  const fetchAddresses = async () => {
    try {
       const response = await getAllAddress(user.id);
      
      if (!response) {
        console.error("No response from API");
        return;
      }

      // Log the response to check the data structure
      console.log(response);

      // Filter active addresses and update state
      const activeAddress = response.filter(
        (address) => address.is_active === true
      );
      setAddresses(activeAddress);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [isAddressUpdated]);

  // useEffect(() => {
  //   const selectedAddress = addresses.find(
  //     (address) => address.is_default === true
  //   );
  //   if (setShipmentAddress) {
  //     setShipmentAddress(selectedAddress);
  //     localStorage.setItem(
  //       `${config.BRAND_NAME}selectedShippingAddress`,
  //       JSON.stringify(selectedAddress)
  //     );
  //   }
  // }, [addresses]);

  const handleEditAddress = (address) => {
    setSelectedAddress(address);
    setShowAddressModal(true);
  };

  const handleAddAddress = () => {
    setSelectedAddress(null);
    setShowAddressModal(true);
  };

  const handleRemoveAddress = (address) => {
    setSelectedAddress(address);
    setShowConfirmationModal(true);
  };

  const handleSaveAddress = async (updatedAddress) => {
    if (updatedAddress.id) {
      const response = await updateAddress(updatedAddress.id, updatedAddress);
      response && setIsAddressUpdated((prev) => !prev);
    } else {
      // const res = await addAddress(user.id, updatedAddress);
      const res = await addAddress(user.id,updatedAddress);
      res && setIsAddressUpdated((prev) => !prev);
    }
    setShowAddressModal(false);
  };


  

  const handleDeleteAddress = async () => {
    if (selectedAddress) {
      const response = await deleteAddress(selectedAddress.id);
      response && setIsAddressUpdated((prev) => !prev);
      setShowConfirmationModal(false);
    }
  };
  const handleSetDefaultAddress = async (address) => {
    try {
      // await setDefaultAddress(user.id, address.id);
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
        <h2 className="text-xl font-semibold text-[black] ">Saved Addresses</h2>
        <button
          onClick={handleAddAddress}
          className=" border border-black px-4 text-black py-3 flex gap-2 items-center"
        >
          <IoMdAdd />
          <span>Add New Address</span>
        </button>
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
            {address.is_default && (
              <h3 className="text-lg font-medium text-[black] bg-gray-300 px-4 py-4 w-full text-start">
                Default Address
              </h3>
            )}
            <div className="flex items-center w-full sm:w-auto p-2 px-4">
              <div>
                <p className="font-semibold text-gray-700 mt-2">
                  {address.first_name} {address.last_name}
                </p>
                <h3 className="font-medium text-sm">
                  {address.street_address}
                </h3>
                <p className="text-sm">
                  {address.city}, {address.state} {address.zip}
                </p>
                <p>Mobile: {address.phone}</p>
              </div>
            </div>

            <div className="w-full flex justify-between items-center gap-4 my-4 px-4">
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditAddress(address)}
                  className="text-white bg-black px-6 py-2 "
                >
                  Edit
                </button>
                <button
                  onClick={() => handleRemoveAddress(address)}
                  className="text-black border border-black px-4 py-2 hover:bg-black hover:text-white"
                >
                  Remove
                </button>
              </div>
              {!address.is_default && (
                <button
                  onClick={() => handleSetDefaultAddress(address)}
                  className="text-white bg-black px-6 py-2 "
                >
                  Make Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAddressModal && (
        <AddressModal
          address={selectedAddress}
          onSave={handleSaveAddress}
          onClose={() => setShowAddressModal(false)}
        />
      )}

      {showConfirmationModal && (
        <ConfirmationModal
          message="Are you sure you want to delete this address?"
          onConfirm={handleDeleteAddress}
          onCancel={() => setShowConfirmationModal(false)}
        />
      )}
    </div>
  );
};

export default MyAddress;
