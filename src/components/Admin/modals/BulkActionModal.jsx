import React from "react";

const BulkActionModal = ({
  isOpen,
  onClose,
  onAction,
  selectedCount,
  isProcessing,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-lg font-semibold mb-4 text-gray-900">
          Bulk Action
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Are you sure you want to perform this action on {selectedCount}{" "}
          {selectedCount === 1 ? "item" : "items"}?
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => onAction("Published")}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            {isProcessing ? "Processing..." : "Publish"}
          </button>
          <button
            onClick={() => onAction("Hidden")}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            {isProcessing ? "Processing..." : "Hide"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionModal;
