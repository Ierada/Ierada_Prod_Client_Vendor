import React, { useState } from "react";
import {
  addEmailSubscribe,
  unSubscribeEmail,
} from "../../../../src/services/api.emailSubscribe";
import {
  notifyOnSuccess,
  notifyOnFail,
} from "../../../utils/notification/toast";
import { AiOutlineMail } from "react-icons/ai";
import { IoClose } from "react-icons/io5";

export default function EmailSubscribe() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUnsubscribe, setShowUnsubscribe] = useState(false);
  const [unsubscribeEmail, setUnsubscribeEmail] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalEmail, setModalEmail] = useState("");
  const [unsubscribeLoading, setUnsubscribeLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await addEmailSubscribe({ email });
      if (response.status === 1) {
        notifyOnSuccess(response.message);
        setEmail("");
      } else {
        notifyOnFail(response.message);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Something went wrong.";
      notifyOnFail(errorMessage);
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribeClick = (e) => {
    e.preventDefault();
    setShowUnsubscribe(!showUnsubscribe);
    setShowModal(false);
  };

  const openConfirmationModal = (e) => {
    e.preventDefault();
    if (!unsubscribeEmail) {
      notifyOnFail("Please enter your email address to unsubscribe");
      return;
    }
    setModalEmail(unsubscribeEmail);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const confirmUnsubscribe = async () => {
    setUnsubscribeLoading(true);
    try {
      const response = await unSubscribeEmail({ email: modalEmail });
      if (response.status === 1) {
        notifyOnSuccess(response.message);
        setUnsubscribeEmail("");
        setShowModal(false);
        setShowUnsubscribe(false);
      } else {
        notifyOnFail(response.message);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Something went wrong.";
      notifyOnFail(errorMessage);
      console.error("Error:", error);
    } finally {
      setUnsubscribeLoading(false);
    }
  };

  return (
    <div className="h-auto flex flex-col justify-center items-center py-10 lg:py-16 px-4 md:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-Lato font-medium text-[24px] text-[#000000]">
          Our Newsletter
        </h2>
        <h2
          className="text-[28px] md:text-[36px] lg:text-[48px] font-medium text-[#1C1C1C] text-center my-4 tracking-wide leading-6 lg:leading-10"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {showUnsubscribe
            ? "Unsubscribe from Our Newsletter"
            : "Subscribe to Our Newsletter to Get Updates to Our Latest Collection"}
        </h2>
        <p className="text-[#000000] text-[14px] sm:text-[16px] lg:text-[18px] font-light text-center mt-2 font-poppins">
          {showUnsubscribe
            ? "We're sorry to see you go. Please enter your email to unsubscribe."
            : "Get 25% off on your order just by subscribing to our newsletter"}
        </p>
      </div>

      {!showUnsubscribe ? (
        <>
          <form
            onSubmit={handleSubscribe}
            className="w-full max-w-xl mt-8 mx-auto flex flex-col sm:flex-row items-center gap-2"
          >
            {/* Email Input with Icon */}
            <div className="relative w-full ">
              <AiOutlineMail className="absolute top-1/2 left-1 transform -translate-y-1/2 text-white bg-[#6B705C] p-3 w-11 h-11" />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email Address"
                className="w-full pl-14 p-3 text-[#8C8C8C] text-[18px] sm:text-[16px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B705C] placeholder-[#95989A] placeholder:font-medium"
                required
              />
            </div>

            {/* Subscribe Button */}
            <button
              type="submit"
              className="bg-[#6B705C] text-white text-[15px] sm:text-[16px] font-medium px-6 py-3 hover:bg-[#531F28] transition-colors w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? "Loading..." : "Subscribe"}
            </button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={handleUnsubscribeClick}
              className="text-[#6B705C] underline text-sm hover:text-[#531F28]"
            >
              Want to unsubscribe?
            </button>
          </div>
        </>
      ) : (
        <>
          <form
            onSubmit={openConfirmationModal}
            className="w-full max-w-xl mt-8 mx-auto flex flex-col sm:flex-row items-center gap-2"
          >
            {/* Email Input with Icon */}
            <div className="relative w-full ">
              <AiOutlineMail className="absolute top-1/2 left-1 transform -translate-y-1/2 text-white bg-[#6B705C] p-3 w-11 h-11" />

              <input
                type="email"
                value={unsubscribeEmail}
                onChange={(e) => setUnsubscribeEmail(e.target.value)}
                placeholder="Enter Email to Unsubscribe"
                className="w-full pl-14 p-3 text-[#8C8C8C] text-[18px] sm:text-[16px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B705C] placeholder-[#95989A] placeholder:font-medium"
                required
              />
            </div>

            {/* Unsubscribe Button */}
            <button
              type="submit"
              className="bg-[#BB5656] text-white text-[15px] sm:text-[16px] font-medium px-6 py-3 hover:bg-[#922828] transition-colors w-full sm:w-auto"
            >
              Unsubscribe
            </button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={handleUnsubscribeClick}
              className="text-[#6B705C] underline text-sm hover:text-[#531F28]"
            >
              Back to subscribe
            </button>
          </div>
        </>
      )}

      {message && (
        <p className="text-center mt-4 text-sm text-[#D9534F]">{message}</p>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium text-gray-900">
                Confirm Unsubscribe
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <IoClose size={24} />
              </button>
            </div>
            <div className="py-4">
              <p className="text-gray-600 mb-4">
                Are you sure you want to unsubscribe{" "}
                <span className="font-medium">{modalEmail}</span> from our
                newsletter?
              </p>
              <p className="text-gray-500 text-sm">
                You will no longer receive updates about our latest collections,
                promotions, and offers.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={confirmUnsubscribe}
                className="px-4 py-2 bg-[#BB5656] text-white rounded hover:bg-[#922828] transition-colors w-full sm:w-auto flex justify-center items-center"
                disabled={unsubscribeLoading}
              >
                {unsubscribeLoading ? (
                  <span>Processing...</span>
                ) : (
                  <span>Yes, Unsubscribe</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
