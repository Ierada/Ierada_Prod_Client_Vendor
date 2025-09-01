import React, { useEffect } from "react";

const ReturnOrder = ({
  isOpen,
  onClose,
  returnDetails,
  setReturnDetails,
  handleReturnDetailsCleanup,
  setShowReturnReplaceCancelConfirmModal,
  setReturnReplaceCancelMode,
  onReturn,
  errors,
  setErrors,
}) => {
  if (!isOpen) return;

  const handleReasonChange = (e) => {
    const { name, value } = e.target;
    if (name === "problem") {
      setReturnDetails((prev) => ({
        ...prev,
        return_reason: value,
      }));
      setErrors((prev) => ({
        ...prev,
        return_reason: "",
      }));
    } else if (name === "comments") {
      setReturnDetails((prev) => ({
        ...prev,
        comments: value,
      }));
    }
  };

  const handleReturnClick = () => {
    if (returnDetails.return_reason === "") {
      setErrors((prev) => ({
        ...prev,
        return_reason: "Please provide a reason befor proceeding further",
      }));
      return;
    }
    setReturnReplaceCancelMode("return");
    setShowReturnReplaceCancelConfirmModal(true);
    onReturn();
  };

  useEffect(() => {
    handleReturnDetailsCleanup();
  }, []);

  return (
    isOpen && (
      <div className="fixed inset-0 z-99 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-8 max-h-[80%] max-w-3xl w-full relative font-Lato  overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-700 hover:text-gray-900"
          >
            &times;
          </button>

          <div className="flex items-center justify-center ">
            <div className="w-full max-w-md">
              <h2 className="text-lg font-semibold text-[black] text-start mb-2">
                Return Order
              </h2>
              <p className="text-xs text-[#484848] text-start mb-4">
                Please provide a reason why you want to cancel the order so that
                we can make your experience better the next time.
              </p>

              <div className="border  p-4  mb-6">
                <div className="flex items-center gap-2">
                  {/* Label */}
                  <label
                    htmlFor="problem"
                    className="text-sm font-medium  text-[#484848] "
                  >
                    Problem:
                  </label>

                  {/* Dropdown */}
                  <select
                    id="problem"
                    name="problem"
                    className="w-full p-2 text-sm border text-[black] bg-white focus:outline-none focus:ring-2 focus:ring-black"
                    onChange={(e) => handleReasonChange(e)}
                  >
                    <option value="" disabled selected>
                      Select a reason
                    </option>
                    <option value="Sizing Issue">Sizing Issue</option>
                    <option value="Quality Issue">Quality Issue</option>
                    <option value="Wrong Item Received">
                      Wrong Item Received
                    </option>
                    <option value="Damaged Product">Damaged Product</option>
                    <option value="Changed Mind">Changed Mind</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {errors.return_reason && (
                  <div className="text-red-500 text-xs mt-1">
                    {errors.return_reason}
                  </div>
                )}

                {/* Textarea for Additional Comments */}
                <label
                  htmlFor="comments"
                  className="text-sm font-medium text-[#484848] mb-2 mt-4 block"
                >
                  Additional Comments
                </label>
                <textarea
                  id="comments"
                  name="comments"
                  rows="4"
                  placeholder="Please provide additional comments (optional)"
                  className="w-full p-2 border  text-sm text-[black] bg-white focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  onChange={(e) => handleReasonChange(e)}
                ></textarea>
              </div>

              {/* Cancel Button */}
              <button
                className="w-full py-2 bg-black text-white font-medium  transition flex items-center justify-center"
                onClick={handleReturnClick}
              >
                Return <span className="ml-2">&rarr;</span>
              </button>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="">
            <h3 className="font-medium text-lg text-[black] text-center my-6">
              Return Policy
            </h3>
            <p className="text-[black] text-xs mb-4 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Vestibulum venenatis augue sed velit congue, in tincidunt arcu
              ullamcorper. Donec vehicula malesuada ante, sit amet laoreet elit
              dictum at. Curabitur nec metus nec neque pulvinar pretium.
              Suspendisse potenti. Proin aliquam, urna vel interdum scelerisque,
              sem neque tincidunt lectus, nec aliquam justo nisi id nisl.
              Praesent ullamcorper magna sed metus bibendum, eget dapibus justo
              eleifend.
            </p>
          </div>
        </div>
      </div>
    )
  );
};

export default ReturnOrder;
