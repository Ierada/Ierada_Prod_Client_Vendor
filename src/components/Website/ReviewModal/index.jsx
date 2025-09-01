import React, { useState } from 'react';
import { X } from 'lucide-react';

const ReviewModal = ({ order, onClose }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const submitReview = () => {
    // API call to submit the review
    console.log('Submitting review:', { rating, review });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[black] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Review "{order.item}"</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Review</label>
            <textarea
              className="w-full p-2 border rounded"
              rows={4}
              value={review}
              onChange={(e) => setReview(e.target.value)}
            ></textarea>
          </div>
          <button
            onClick={submitReview}
            className="w-full bg-black text-white py-3 rounded-lg"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;