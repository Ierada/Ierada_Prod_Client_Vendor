import { useState } from "react";
import { formatDate } from "../../../utils/date&Time/dateAndTimeFormatter";
import userDefaultImage from "/assets/user/person-circle.png";

const StarRating = ({ rating, maxStars = 5 }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0 ? 1 : 0;
  const emptyStars = maxStars - fullStars - halfStar;

  const stars = [
    ...Array(fullStars).fill(
      <span className="text-yellow-500 text-xl">★</span>
    ), // Full stars
    ...Array(halfStar).fill(<span className="text-yellow-500 text-xl">☆</span>),
    ...Array(emptyStars).fill(<span className="text-gray-300 text-xl">★</span>),
  ];

  return <div className="flex space-x-1">{stars}</div>;
};

const ReviewCard = ({ review }) => {
  return (
    <div className="flex flex-col gap-2 border-b-2 last:border-b-0 p-1 pb-4 mt-3">
      <div className="flex justify-between">
        <div className="flex gap-1 items-center">
          <span className="">
            <img
              className="w-11 h-11 object-cover rounded-full"
              src={review.user?.avatar || userDefaultImage}
              alt={review.user?.first_name}
            />
          </span>
          <span className="font-bold text-md">
            {review.user?.first_name + " " + review.user?.last_name}
          </span>
        </div>
        <div>{formatDate(review.created_at)}</div>
      </div>
      <div>{review.comment}</div>
      <div>
        <StarRating rating={review.review} />
      </div>
      {review.media && review.media.length > 0 && (
        <div className="flex gap-2">
          {review.media?.map((med, index) => {
            if (med.type === "image") {
              return (
                <img
                  className="w-24 h-24 object-cover"
                  key={index}
                  src={med.url}
                  onClick={() => window.open(med.url, "_blank")}
                  alt={`Review Image ${index + 1}`}
                />
              );
            } else if (med.type === "video") {
              return (
                <video
                  className="w-24 h-24 object-cover"
                  key={index}
                  src={med.url}
                  controls
                />
              );
            }
          })}
        </div>
      )}
    </div>
  );
};

export default function Reviews({ reviews }) {
  return (
    <div>
      {reviews &&
        reviews?.map((review, index) => (
          <ReviewCard key={index} review={review} />
        ))}
    </div>
  );
}
