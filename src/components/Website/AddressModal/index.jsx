import React, { useState, useEffect, useRef } from "react";
import { useAppContext } from "../../../context/AppContext";

import config from "../../../config/config";

const loadGoogleMapsApi = (() => {
  let promise = null;

  return () => {
    if (!promise) {
      promise = new Promise((resolve, reject) => {
        const existingScript = document.querySelector(
          'script[src*="maps.googleapis.com/maps/api"]'
        );
        if (existingScript) {
          existingScript.remove();
        }

        window.google = undefined;

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${config.GMAP_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          setTimeout(() => {
            if (
              window.google &&
              window.google.maps &&
              window.google.maps.places
            ) {
              resolve(window.google);
            } else {
              reject(new Error("Google Maps Places library failed to load"));
            }
          }, 100);
        };

        script.onerror = () => {
          reject(new Error("Failed to load Google Maps script"));
          promise = null;
        };

        document.head.appendChild(script);
      });
    }
    return promise;
  };
})();

const AddressModal = ({ address, onSave, onClose }) => {
  const [street, setStreet] = useState(address?.street_address || "");
  const [landmark, setLandmark] = useState(address?.landmark || "");
  const [city, setCity] = useState(address?.city || "");
  const [state, setState] = useState(address?.state || "");
  const [zip, setZipCode] = useState(address?.zip || "");
  const [mapPosition, setMapPosition] = useState({
    latitude: address?.latitude || "",
    longitude: address?.longitude || "",
  });
  const [loading, setLoading] = useState(false);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);
  const [userDetails, setUserDetails] = useState({
    first_name: address?.first_name || "",
    last_name: address?.last_name || "",
    email: address?.email || "",
    phone: address?.phone || "",
  });
  const [errors, setErrors] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    street_address: "",
    city: "",
    state: "",
    zip: "",
    landmark: "",
  });

  const handleInputChange = (event) => {
    const { name, value, type } = event.target;

    if (type === "number") {
      if (name === "phone" && value.length > 10) return;

      if (name === "zip" && value.length > 6) {
        return;
      } else if (name === "zip" && value.length <= 6) {
        setZipCode(value);
      }
    }

    setUserDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  useEffect(() => {
    const initializeGoogleMaps = async () => {
      try {
        await loadGoogleMapsApi();

        if (
          inputRef.current &&
          window.google &&
          window.google.maps &&
          window.google.maps.places
        ) {
          // Clear any existing autocomplete
          if (autocompleteRef.current) {
            window.google.maps.event.clearInstanceListeners(
              autocompleteRef.current
            );
          }

          autocompleteRef.current = new window.google.maps.places.Autocomplete(
            inputRef.current,
            {
              types: ["geocode"],
              componentRestrictions: { country: "in" },
              fields: [
                "address_components",
                "formatted_address",
                "geometry",
                "name",
              ],
            }
          );

          autocompleteRef.current.addListener("place_changed", () => {
            const place = autocompleteRef.current.getPlace();
            if (!place.geometry) {
              notifyOnFail("Please select an address from the dropdown");
              return;
            }

            let address = place.formatted_address || "";
            let postcode = "";
            let locality = "";
            let administrativeAreaLevel1 = "";

            place.address_components.forEach((component) => {
              const types = component.types;
              if (types.includes("postal_code")) {
                postcode = component.long_name;
              }
              if (types.includes("locality")) {
                locality = component.long_name;
              }
              if (types.includes("administrative_area_level_1")) {
                administrativeAreaLevel1 = component.long_name;
              }
            });

            // Set address fields
            if (address) {
              setStreet(address);
              setCity(locality);
              setState(administrativeAreaLevel1); // Populate state
              setZipCode(postcode);
              setMapPosition({
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng(),
              });
            }
          });
        }
      } catch (error) {
        console.error("Error initializing Google Maps API:", error);
      }
    };

    initializeGoogleMaps();

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current
        );
      }
    };
  }, []);

  //   const updatedAddress = {
  //     street_address: street,
  //     city,
  //     state,
  //     zip,
  //     latitude: mapPosition.latitude,
  //     longitude: mapPosition.longitude,
  //   };

  //   try {
  //     setLoading(true);
  //     let response;
  //     if (address?.id) {
  //       response = await updateAddress(address.id, updatedAddress);
  //       if (response?.status === 1) {
  //         // notifyOnSuccess('Address updated successfully');
  //       } else {
  //         // notifyOnFail('Failed to update address');
  //       }
  //     } else {
  //       response = await addAddress(updatedAddress);
  //       if (response?.status === 1) {
  //         // notifyOnSuccess('Address added successfully');
  //       } else {
  //         // notifyOnFail('Failed to add address');
  //       }
  //     }
  //     setLoading(false);
  //     onSave(updatedAddress);
  //   } catch (error) {
  //     setLoading(false);
  //     // notifyOnFail('An error occurred while saving the address');
  //     console.error('Error saving address:', error);
  //   }
  // };
  const handleSave = async () => {
    // Validate form
    const newErrors = { ...errors };

    // Validate required fields
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!userDetails.first_name) {
      newErrors.first_name = "First name is required";
    } else {
      newErrors.first_name = "";
    }

    if (!userDetails.last_name) {
      newErrors.last_name = "Last name is required";
    } else {
      newErrors.last_name = "";
    }

    if (!userDetails.email || !isValidEmail(userDetails.email)) {
      newErrors.email = "A valid email is required";
    } else {
      newErrors.email = "";
    }

    if (!userDetails.phone || userDetails.phone.length !== 10) {
      newErrors.phone = "Phone number must be 10 digits";
    } else {
      newErrors.phone = "";
    }

    if (!street) {
      newErrors.street_address = "Street address is required";
    } else {
      newErrors.street_address = "";
    }

    if (!city) {
      newErrors.city = "City is required";
    } else {
      newErrors.city = "";
    }

    if (!state) {
      newErrors.state = "State is required";
    } else {
      newErrors.state = "";
    }

    if (!zip || zip.length !== 6) {
      newErrors.zip = "Zip code must be 6 digits";
    } else {
      newErrors.zip = "";
    }

    setErrors(newErrors);

    // Check if there are any validation errors
    if (Object.values(newErrors).some((error) => error)) {
      return;
    }

    const updatedAddress = {
      id: address?.id,
      first_name: userDetails.first_name,
      last_name: userDetails.last_name,
      email: userDetails.email,
      phone: userDetails.phone,
      street_address: street,
      landmark,
      city,
      state,
      zip,
      latitude: mapPosition.latitude,
      longitude: mapPosition.longitude,
    };

    try {
      setLoading(true);
      await onSave(updatedAddress);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error saving address:", error);
    }
  };
  return (
    <div className="fixed inset-0 bg-[black] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {address ? "Edit Address" : "Add New Address"}
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                className="w-full p-1.5 border rounded"
                value={userDetails.first_name || ""}
                onChange={(e) => handleInputChange(e)}
              />
              {errors.first_name && (
                <p className="text-red-500 text-sm">{errors.first_name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                className="w-full p-1.5 border rounded"
                value={userDetails.last_name || ""}
                onChange={(e) => handleInputChange(e)}
              />
              {errors.last_name && (
                <p className="text-red-500 text-sm">{errors.last_name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                className="w-full p-1.5 border rounded"
                value={userDetails.email || ""}
                onChange={(e) => handleInputChange(e)}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                minLength={10}
                maxLength={10}
                name="phone"
                className="w-full p-1.5 border rounded"
                value={userDetails.phone || ""}
                onChange={(e) => handleInputChange(e)}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone}</p>
              )}
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Street Address
              </label>
              <input
                type="text"
                ref={inputRef}
                className="w-full p-1.5 border rounded"
                name="street_address"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
              {errors.street_address && (
                <p className="text-red-500 text-sm">{errors.street_address}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Land Mark
              </label>
              <input
                type="text"
                className="w-full p-1.5 border rounded"
                name="landmark"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
              />
              {errors.landmark && (
                <p className="text-red-500 text-sm">{errors.landmark}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                type="text"
                className="w-full p-1.5 border rounded"
                name="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              {errors.city && (
                <p className="text-red-500 text-sm">{errors.city}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <input
                type="text"
                className="w-full p-1.5 border rounded"
                name="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
              {errors.state && (
                <p className="text-red-500 text-sm">{errors.state}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Zip Code</label>
              <input
                type="number"
                className="w-full p-1.5 border rounded"
                name="zip"
                value={zip}
                onChange={(e) => handleInputChange(e)}
              />
              {errors.zip && (
                <p className="text-red-500 text-sm">{errors.zip}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
