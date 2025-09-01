import React from 'react';

const CustomerReviews = ({ reviews = [] }) => {
  return (
    <div className="mt-4">
      <h2 className="text-[25px] font-semibold text-txtPage font-satoshi mb-4">
        Customer Reviews
      </h2>
      <div className="bg-white rounded-lg shadow-md p-4">
        <ul>
          {reviews.map((review, index) => (
            <li key={index} className="py-2 border-b last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {review.customerImage ? (
                    <img
                      src={review.customerImage}
                      alt={review.customerName}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full mr-3 bg-gray-200"></div>
                  )}
                  <div>
                    <p className="text-[14px] font-satoshi font-semibold text-txtPage">
                      {review.customerName}
                    </p>
                    <p className="text-[12px] text-gray-500">
                      {review.productName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-[14px] font-satoshi font-semibold text-txtPage mr-2">
                    {review.rating}
                  </span>
                  <span className="text-yellow-500">&#9733;</span>
                </div>
              </div>
              <p className="text-[12px] text-gray-600 italic">
                "{review.comment}"
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CustomerReviews;