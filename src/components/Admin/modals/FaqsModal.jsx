import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const FaqsModal = ({ isOpen, onClose, mode, faqs, onSubmit }) => {
  const [error, setError] = useState({});
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    type: "General",
  });

  useEffect(() => {
    if (mode === "edit" || mode === "view") {
      if (faqs) {
        setFormData({
          question: faqs.question || "",
          answer: faqs.answer || "",
          type: faqs.type || "General",
        });
      }
    } else if (mode === "add") {
      setFormData({
        question: "",
        answer: "",
        type: "General",
      });
    }
  }, [mode, faqs]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    const newError = {};
    if (!formData.question) newError.question = "Question is required.";
    if (!formData.answer) newError.answer = "Answer is required.";
    if (!formData.type) newError.type = "Type is required.";

    setError(newError);

    if (Object.keys(newError).length === 0) {
      // Call onSubmit handler with form data
      onSubmit(formData);
      setFormData({
        question: "",
        answer: "",
        type: "General",
      });
      onClose();
    }
  };

  return isOpen ? (
    <div className="fixed inset-0 bg-[black] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-[#1A1C21]">
              {mode === "view"
                ? "View Faqs"
                : mode === "edit"
                ? "Edit Faqs"
                : "Add Faqs"}
            </h2>
            <button onClick={onClose} className="p-2">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#4D5464] mb-2">
                    Question
                  </label>
                  {mode === "view" ? (
                    <p>{formData.question || "No question provided"}</p>
                  ) : (
                    <>
                      <input
                        type="text"
                        name="question"
                        value={formData.question || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                        placeholder="Enter Question"
                      />
                      {error.question && (
                        <p className="text-red-500 text-sm mt-1">
                          {error.question}
                        </p>
                      )}
                    </>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4D5464] mb-2">
                    Type
                  </label>
                  {mode === "view" ? (
                    <p>{formData.type || "No type provided"}</p>
                  ) : (
                    <>
                      <select
                        name="type"
                        value={formData.type || "General"}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="General">General</option>
                        <option value="Ordering">Ordering</option>
                        <option value="Returns">Returns</option>
                        {/* <option value="Other">Other</option> */}
                      </select>
                      {error.type && (
                        <p className="text-red-500 text-sm mt-1">
                          {error.type}
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[#4D5464] mb-2">
                    Answer
                  </label>
                  {mode === "view" ? (
                    <p>{formData.answer || "No answer provided"}</p>
                  ) : (
                    <>
                      <textarea
                        name="answer"
                        value={formData.answer || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                        placeholder="Enter Answer"
                      />
                      {error.answer && (
                        <p className="text-red-500 text-sm mt-1">
                          {error.answer}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            {(mode === "edit" || mode === "add") && (
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F47954] text-white rounded-md"
                >
                  {mode === "edit" ? "Update Faqs" : "Create Faqs"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  ) : null;
};

export default FaqsModal;
