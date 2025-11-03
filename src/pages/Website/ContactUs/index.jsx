import React, { useState, useEffect } from "react";
import CommonTopBanner from "../../../components/Website/CommonTopBanner";
import common_top_banner from "/assets/banners/Commen-top-banner.png";
import { GoArrowRight } from "react-icons/go";
import { createContact } from "../../../services/api.contactusform";
import { notifyOnSuccess } from "../../../utils/notification/toast";

const bannerData = [
  {
    id: 1,
    image: common_top_banner,
  },
];

// Puzzle types
const PUZZLE_TYPES = {
  IMAGE_SELECT: "IMAGE_SELECT",
  SLIDER: "SLIDER",
  CHECKBOX: "CHECKBOX",
};

// Sample images for image selection puzzle
const sampleImages = [
  { id: 1, src: "/assets/puzzle/car.jpg", category: "vehicle" },
  { id: 2, src: "/assets/puzzle/tree.jpg", category: "nature" },
  { id: 3, src: "/assets/puzzle/building.jpg", category: "structure" },
  { id: 4, src: "/assets/puzzle/cat.jpg", category: "animal" },
  { id: 5, src: "/assets/puzzle/mountain.jpg", category: "nature" },
  { id: 6, src: "/assets/puzzle/bicycle.jpg", category: "vehicle" },
  { id: 7, src: "/assets/puzzle/dog.jpg", category: "animal" },
  { id: 8, src: "/assets/puzzle/bridge.jpg", category: "structure" },
];

const ContactUs = () => {
  const [error, setError] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    message: "",
  });
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  const [puzzleType, setPuzzleType] = useState("");
  const [puzzleChallenge, setPuzzleChallenge] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [sliderValue, setSliderValue] = useState(0);
  const [targetSliderValue, setTargetSliderValue] = useState(0);
  const [puzzleError, setPuzzleError] = useState("");

  // Generate a random puzzle challenge
  useEffect(() => {
    if (showPuzzle) {
      const puzzleTypes = Object.values(PUZZLE_TYPES);
      const randomType =
        puzzleTypes[Math.floor(Math.random() * puzzleTypes.length)];
      setPuzzleType(randomType);

      switch (randomType) {
        case PUZZLE_TYPES.IMAGE_SELECT:
          setPuzzleChallenge("Select all images with vehicles");
          break;
        case PUZZLE_TYPES.SLIDER:
          const target = Math.floor(Math.random() * 90) + 10;
          setTargetSliderValue(target);
          setPuzzleChallenge(`Slide to ${target}`);
          setSliderValue(0);
          break;
        case PUZZLE_TYPES.CHECKBOX:
          setPuzzleChallenge("Check the box to prove you're not a robot");
          break;
        default:
          break;
      }
    }
  }, [showPuzzle]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const newError = {};
    if (!formData.name) newError.name = "Name is required.";
    if (!formData.email.trim()) {
      newError.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newError.email = "Enter a valid email address.";
    }
    if (!formData.phone_number.trim()) {
      newError.phone_number = "Phone number is required.";
    } else if (!/^\d{10}$/.test(formData.phone_number)) {
      newError.phone_number = "Phone number must be 10 digits.";
    }
    if (!formData.message) newError.message = "Message is required.";
    return newError;
  };

  const handleImageSelect = (id, category) => {
    if (selectedImages.includes(id)) {
      setSelectedImages(selectedImages.filter((imgId) => imgId !== id));
    } else {
      setSelectedImages([...selectedImages, id]);
    }
  };

  const validatePuzzle = () => {
    switch (puzzleType) {
      case PUZZLE_TYPES.IMAGE_SELECT:
        // Check if all selected images are vehicles and all vehicles are selected
        const vehicleIds = sampleImages
          .filter((img) => img.category === "vehicle")
          .map((img) => img.id);

        const allVehiclesSelected = vehicleIds.every((id) =>
          selectedImages.includes(id)
        );
        const onlyVehiclesSelected = selectedImages.every((id) =>
          vehicleIds.includes(id)
        );

        if (!allVehiclesSelected || !onlyVehiclesSelected) {
          setPuzzleError(
            "Please select all images with vehicles and nothing else."
          );
          return false;
        }
        break;

      case PUZZLE_TYPES.SLIDER:
        if (Math.abs(sliderValue - targetSliderValue) > 5) {
          setPuzzleError("Please slide to the exact position.");
          return false;
        }
        break;

      case PUZZLE_TYPES.CHECKBOX:
        // For checkbox, we just need to know it was checked
        if (!puzzleSolved) {
          setPuzzleError("Please check the box to continue.");
          return false;
        }
        break;

      default:
        setPuzzleError("Please complete the puzzle.");
        return false;
    }

    setPuzzleError("");
    return true;
  };

  const handlePuzzleSubmit = (e) => {
    e.preventDefault();
    if (validatePuzzle()) {
      setPuzzleSolved(true);
      setShowPuzzle(false);
      // Now submit the form
      submitForm();
    }
  };

  const submitForm = async () => {
    try {
      const response = await createContact(formData);
      if (response.status === 1) {
        setFormData({
          name: "",
          email: "",
          phone_number: "",
          message: "",
        });
        setPuzzleSolved(false);
        notifyOnSuccess(
          "Thank you for contacting us! We will get back to you soon!"
        );
      }
    } catch (err) {
      console.error("Error submitting contact form:", err);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // First validate the form
    const newError = validate();
    if (Object.keys(newError).length > 0) {
      setError(newError);
      return;
    }

    // If form is valid, show the puzzle
    if (!puzzleSolved) {
      setShowPuzzle(true);
      return;
    }

    // If puzzle is already solved, submit the form
    submitForm();
  };

  const renderPuzzle = () => {
    switch (puzzleType) {
      case PUZZLE_TYPES.IMAGE_SELECT:
        return (
          <div className="grid grid-cols-2 gap-4 mb-4">
            {sampleImages.map((image) => (
              <div
                key={image.id}
                className={`relative border-2 ${
                  selectedImages.includes(image.id)
                    ? "border-blue-500"
                    : "border-gray-200"
                }`}
                onClick={() => handleImageSelect(image.id, image.category)}
              >
                <img
                  src={image.src}
                  alt={`Puzzle image ${image.id}`}
                  className="w-full h-auto"
                />
                {selectedImages.includes(image.id) && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white p-1">
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case PUZZLE_TYPES.SLIDER:
        return (
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              onChange={(e) => setSliderValue(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-center mt-2">
              Current: {sliderValue} | Target: {targetSliderValue}
            </div>
          </div>
        );

      case PUZZLE_TYPES.CHECKBOX:
        return (
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="robot-check"
              checked={puzzleSolved}
              onChange={() => setPuzzleSolved(!puzzleSolved)}
              className="mr-2 h-5 w-5"
            />
            <label htmlFor="robot-check" className="text-sm">
              I'm not a robot
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main>
      {/* <section className="h-[300px]">
        <CommonTopBanner bannerData={bannerData} />
      </section> */}
      <section>
        <div className="min-h-screen flex flex-col mb-6 items-center bg-white">
          {/* Header Section */}
          <div className="text-center my-10 text-[#000000]">
            <h1 className="text-2xl lg:text-4xl font-semibold  font-Playfair">
              Contact Us
            </h1>
            <p className=" text-sm lg:text-base font-Lato font-medium ">
              Home / Contact Us
            </p>
          </div>

          {/* Contact Form */}
          <div className="w-full max-w-4xl mx-auto px-4 lg:px-0">
            <h2 className="text-xl lg:text-2xl font-semibold text-[#000000] mb-2 font-Lato">
              Let's Get in Touch
            </h2>
            <p className="text-[#484848]  mb-6 font-Lato font-normal">
              Help us with these details so that we can help you
            </p>

            {/* Puzzle Modal */}
            {showPuzzle && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-md w-full">
                  <h3 className="text-xl font-semibold mb-4">
                    Complete this verification:
                  </h3>
                  <p className="text-lg mb-4">{puzzleChallenge}</p>

                  {renderPuzzle()}

                  {puzzleError && (
                    <p className="text-red-500 mb-4">{puzzleError}</p>
                  )}

                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => {
                        setShowPuzzle(false);
                        setSelectedImages([]);
                        setSliderValue(0);
                        setPuzzleError("");
                      }}
                      className="px-4 py-2 border border-gray-300 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePuzzleSubmit}
                      className="px-4 py-2 bg-black text-white rounded"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleFormSubmit}>
              {/* Name and Email */}
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="relative w-full lg:w-1/2">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray peer"
                  />
                  <label
                    htmlFor="name"
                    className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-gray peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4"
                  >
                    Your Name*
                  </label>
                  {error.name && (
                    <p className="text-red-500 text-sm">{error.name}</p>
                  )}
                </div>
                <div className="relative w-full lg:w-1/2">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray peer"
                  />
                  <label
                    htmlFor="email"
                    className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-gray peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4"
                  >
                    Email Address*
                  </label>
                  {error.email && (
                    <p className="text-red-500 text-sm">{error.email}</p>
                  )}
                </div>
              </div>
              {/* Phone */}
              <div className="relative">
                <input
                  type="text"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setFormData((prev) => ({
                      ...prev,
                      phone_number: value,
                    }));
                  }}
                  className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray peer"
                  maxLength={10}
                />
                <label
                  htmlFor="phone_number"
                  className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-gray peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4"
                >
                  Phone Number*
                </label>
                {error.phone_number && (
                  <p className="text-red-500 text-sm">{error.phone_number}</p>
                )}
              </div>

              {/* Message */}
              <div className="relative">
                <textarea
                  rows="4"
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray peer"
                />
                <label
                  htmlFor="message"
                  className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-gray peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4"
                >
                  Your Message*
                </label>
                {error.message && (
                  <p className="text-red-500 text-sm">{error.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="bg-black border text-white  px-6 py-3 text-sm lg:text-base font-semibold flex items-center transition"
              >
                Send Message
                <GoArrowRight className="ml-2" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ContactUs;
