import React, { useState } from "react";
import { FiImage, FiVideo } from "react-icons/fi";
import { useAppContext } from "../../../context/AppContext";
import { addReview } from "../../../services/api.review";
import { notifyOnFail } from "../../../utils/notification/toast";

export default function AddReviewModal({ isOpen, onClose, product }) {
  if (!isOpen) return null;

  const { user } = useAppContext();
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [media, setMedia] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateVideoDuration = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 30) {
          notifyOnFail("Video duration must be 30 seconds or less.");
          resolve(false);
        } else {
          resolve(true);
        }
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const handleAddMedia = async (event, type) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    const validFiles = [];
    for (const file of files) {
      if (type === "video") {
        const isValid = await validateVideoDuration(file);
        if (!isValid) continue;
      }
      validFiles.push({
        file,
        type,
        preview: URL.createObjectURL(file),
      });
    }

    if (validFiles.length) {
      setMedia((prev) => [...prev, ...validFiles]);
      console.log(
        `${type.charAt(0).toUpperCase() + type.slice(1)} added successfully.`
      );
    }
  };

  const handleRemoveMedia = (index) => {
    setMedia((prev) => {
      const newMedia = prev.filter((_, i) => i !== index);
      return newMedia;
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("review", rating);
      formData.append("comment", feedback);
      formData.append("product_id", product.productId);
      formData.append("user_id", user.id);

      media.forEach((item) => {
        formData.append("reviewMedia", item.file);
      });

      const res = await addReview(formData);
      if (res.status === 1) {
        onClose();
        setMedia([]);
        setRating(5);
        setFeedback("");
      }
    } catch (error) {
      notifyOnFail("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed z-50 inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[80vh] p-6 overflow-y-auto scrollbar-hide">
          <h2 className="text-xl font-bold mb-4">Submit Your Review</h2>

          {/* Rating */}
          <div className="mb-4">
            <label className="block text-lg font-medium mb-1">Rating</label>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl ${
                      star <= rating ? "text-yellow-500" : "text-gray-300"
                    }`}
                    disabled={isSubmitting}
                  >
                    ★
                  </button>
                ))}
              </div>
              <span>{rating} Star Rating</span>
            </div>
          </div>

          {/* Review Textarea */}
          <div className="mb-4">
            <label className="block text-lg font-medium mb-1">Feedback</label>
            <textarea
              className="w-full p-2 border-none border-transparent placeholder-gray-500 placeholder:p-1 placeholder-opacity-75 placeholder:text-sm focus:outline-none focus:ring-black focus:ring-2 rounded-sm"
              rows={4}
              value={feedback}
              placeholder="Write down your feedback about our product & services"
              onChange={(e) => setFeedback(e.target.value)}
              disabled={isSubmitting}
            ></textarea>
          </div>

          {/* Upload Buttons */}
          <div className="mb-4">
            <label className="block text-lg mb-2">Upload Media</label>
            <div className="flex gap-4 justify-center">
              <label className="flex items-center gap-2 px-4 py-2 text-black rounded cursor-pointer border-black border">
                <FiImage className="text-lg" />
                Add Photos
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleAddMedia(e, "image")}
                  disabled={isSubmitting}
                  multiple
                />
              </label>
              <label className="flex items-center gap-2 px-4 py-2 text-black rounded cursor-pointer border-black border">
                <FiVideo className="text-lg" />
                Add Video
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleAddMedia(e, "video")}
                  disabled={isSubmitting}
                  multiple
                />
              </label>
            </div>
          </div>

          {/* Media Preview */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            {media.map((item, index) => (
              <div
                key={index}
                className="relative w-full h-24 bg-gray-100 rounded-md overflow-hidden"
              >
                {item.type === "image" ? (
                  <img
                    src={item.preview}
                    alt="Uploaded"
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <video
                    src={item.preview}
                    className="w-full h-full object-cover rounded-md"
                    controls
                  />
                )}
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full p-1"
                  onClick={() => handleRemoveMedia(index)}
                  disabled={isSubmitting}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end mt-4">
            <button
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ml-3 py-2 px-4 bg-black text-white rounded-md shadow-sm focus:outline-none disabled:bg-gray-500"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Publish Review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
