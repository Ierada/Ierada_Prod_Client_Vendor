import React from "react";
import order_success from "/assets/icons/order-success.svg";

const OrderConfirmationModal = ({ isOpen, onClose, amountSaved }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white  shadow-lg max-w-md w-full p-10 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black"
        >
          &times;
        </button>
        <div className="flex items-center justify-center mb-4">
          <div className="h-16 w-16 bg-orange-200 rounded-full flex items-center justify-center">
            {/* <svg
              className="h-8 w-8 text-orange-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 10-8 0v4m-4 0a8 8 0 1116 0m-5 5h-6"
              />
              
            </svg> */}
            <svg
              width="124"
              height="130"
              viewBox="0 0 124 124"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="62"
                cy="62"
                r="62"
                fill="#F47954"
                fill-opacity="0.4"
              />
              <circle
                cx="62.3748"
                cy="62.3738"
                r="50.4217"
                fill="#F47954"
                fill-opacity="0.3"
              />
              <circle
                cx="61.9996"
                cy="61.9996"
                r="38.8434"
                fill="#F47954"
                fill-opacity="0.4"
              />
              <path
                d="M54.0938 79.5938C54.8014 79.5938 55.375 79.0201 55.375 78.3125C55.375 77.6049 54.8014 77.0312 54.0938 77.0312C53.3861 77.0312 52.8125 77.6049 52.8125 78.3125C52.8125 79.0201 53.3861 79.5938 54.0938 79.5938Z"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M72.0312 79.5938C72.7389 79.5938 73.3125 79.0201 73.3125 78.3125C73.3125 77.6049 72.7389 77.0312 72.0312 77.0312C71.3236 77.0312 70.75 77.6049 70.75 78.3125C70.75 79.0201 71.3236 79.5938 72.0312 79.5938Z"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M43.8438 51.4062H48.9688L52.8125 73.1875H73.3125"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M52.8125 68.0625H72.7872C72.9353 68.0626 73.079 68.0113 73.1936 67.9175C73.3082 67.8236 73.3867 67.6929 73.4158 67.5476L75.7221 56.0163C75.7407 55.9234 75.7384 55.8274 75.7154 55.7354C75.6924 55.6434 75.6493 55.5577 75.5892 55.4843C75.5291 55.411 75.4534 55.352 75.3677 55.3114C75.2819 55.2709 75.1883 55.2499 75.0934 55.25H50.25"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M59 49L61 52L70 45"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-lg font-semibold text-[black]">
          Your Order is Confirmed
        </h2>
        <p className="text-sm text-[black] my-4">
          Thanks for shopping with us! You can keep track of your order's status
          by going to your profile.
        </p>
        {/* <p className="text-sm font-medium text-[black] ">
          Congratulations, you saved{" "}
          <span className="font-semibold">₹{amountSaved}</span> in your
          purchase!
        </p> */}
      </div>
    </div>
  );
};

export default OrderConfirmationModal;
