import React, { useState, useEffect, useMemo } from "react";
import { PencilLine } from "lucide-react";
import { MdStar, MdStarHalf, MdStarBorder } from "react-icons/md";
import userDefaultImage from "/assets/common_images/avatar.jpeg";
import AddReviewModal from "../../../components/Website/AddReviewModal";
import { formatDate } from "../../../utils/date&Time/dateAndTimeFormatter";
import { getReviewsByVendorId } from "../../../services/api.review";
import { useAppContext } from "../../../context/AppContext";

const StarRating = ({ rating, maxStars = 5 }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0 ? 1 : 0;
  const emptyStars = maxStars - fullStars - halfStar;

  const stars = [
    ...Array(fullStars).fill(<MdStar className="text-yellow-500 text-md" />),
    ...Array(halfStar).fill(<MdStarHalf className="text-yellow-500 text-md" />),
    ...Array(emptyStars).fill(
      <MdStarBorder className="text-gray-300 text-md" />
    ),
  ];

  return <div className="flex space-x-1">{stars}</div>;
};

const CustomSelect = ({ value, onChange, options, placeholder }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="p-2 border border-[#EFF0F6] rounded-lg text-[14px] font-satoshi font-medium appearance-none bg-white pr-8 relative cursor-pointer"
      style={{
        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.5rem center",
        backgroundSize: "1.5em 1.5em",
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

const ReviewCard = ({ review }) => {
  return (
    <div className="flex flex-col gap-2 border-b-2 last:border-b-0 p-1 pb-4 mt-3 text-black-2">
      <div className="flex gap-4">
        {/* Optional product info can be uncommented if needed */}
      </div>
      <div className="flex justify-between">
        <div className="flex gap-1 items-center">
          <img
            className="w-11 h-11 object-cover rounded-full"
            src={review.customer_avatar || userDefaultImage}
            alt="User avatar"
          />
          <div>
            <span className="font-bold text-base md:text-md">
              {review.customer_name}
            </span>
          </div>
        </div>
        <div className="text-xs md:text-base">
          {formatDate(review.created_at)}
        </div>
      </div>
      <div className="font-normal text-xs md:text-sm text-black-2">
        <h3 className="font-semibold text-sm md:text-base text-black-2 mb-1">
          Great Experience
        </h3>
        {review.comment}
      </div>
      <div className="text-sm">{review.description}</div>
      <div className="flex items-center gap-2">
        <StarRating rating={review.review} />
        <p className="text-xs">{review.review}</p>
      </div>
      {review.media && review.media.length > 0 && (
        <div className="flex gap-2">
          {review.media.map((med, index) => {
            if (med.type === "image") {
              return (
                <img
                  className="w-24 h-24 object-cover rounded-md"
                  key={index}
                  src={med.media}
                  alt={`Review Image ${index + 1}`}
                />
              );
            } else if (med.type === "video") {
              return (
                <video
                  className="w-24 h-24 object-cover"
                  key={index}
                  src={med.media}
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

const Reviews = ({ filteredReviews, handleShowMore, visibleReviews }) => {
  const showToggle = filteredReviews.length > 5;

  if (filteredReviews.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 text-lg">
        No reviews available
      </div>
    );
  }

  return (
    <div>
      {filteredReviews.slice(0, visibleReviews).map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
      {showToggle && (
        <div
          onClick={handleShowMore}
          className="cursor-pointer text-gray-500 hover:text-gray-600 underline text-sm mt-1"
        >
          {visibleReviews < filteredReviews.length ? "See More" : ""}
        </div>
      )}
    </div>
  );
};

export default function ReviewPage() {
  const [reviews, setReviews] = useState([]);
  const [filterType, setFilterType] = useState("Most Recent");
  const [visibleReviews, setVisibleReviews] = useState(5);
  const [timeframe, setTimeframe] = useState("all-time");
  const [category, setCategory] = useState("category");
  const [product, setProduct] = useState("all");
  const User = useAppContext().user;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await getReviewsByVendorId(User.id);
        if (response.data) {
          setReviews(response.data);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, []);

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
    setVisibleReviews(5);
  };

  const handleShowMore = () => {
    setVisibleReviews((prev) =>
      prev < filteredReviews.length ? prev + 5 : prev
    );
  };

  const filteredReviews = useMemo(() => {
    let filtered = reviews;

    if (product !== "all") {
      filtered = filtered.filter((r) => r.product_name === product);
    }

    if (category !== "category") {
      filtered = filtered.filter((r) => r.category_name === category);
    }

    const now = new Date();
    switch (timeframe) {
      case "this-month":
        filtered = filtered.filter((r) => {
          const reviewDate = new Date(r.created_at);
          return (
            reviewDate.getFullYear() === now.getFullYear() &&
            reviewDate.getMonth() === now.getMonth()
          );
        });
        break;
      case "this-year":
        filtered = filtered.filter((r) => {
          const reviewDate = new Date(r.created_at);
          return reviewDate.getFullYear() === now.getFullYear();
        });
        break;
      case "all-time":
      default:
        break;
    }

    switch (filterType) {
      case "Most Recent":
        return [...filtered].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
      case "Rating":
        return [...filtered].sort((a, b) => b.review - a.review);
      default:
        return filtered;
    }
  }, [filterType, reviews, product, category, timeframe]);

  const timeframeOptions = [
    { value: "all-time", label: "All time" },
    { value: "this-month", label: "This month" },
    { value: "this-year", label: "This year" },
  ];

  const productOptions = useMemo(() => {
    const uniqueProducts = [...new Set(reviews.map((r) => r.product_name))];
    return [
      { value: "all", label: "All Product" },
      ...uniqueProducts.map((product) => ({
        value: product,
        label: product,
      })),
    ];
  }, [reviews]);

  const categoryOptions = useMemo(() => {
    const uniqueCategories = [...new Set(reviews.map((r) => r.category_name))];
    return [
      { value: "category", label: "All Category" },
      ...uniqueCategories.map((category) => ({
        value: category,
        label: category,
      })),
    ];
  }, [reviews]);

  return (
    <main className="mb-10 mx-4 md:mx-5 mt-4 space-y-10">
      <section>
        <div className="relative flex flex-col gap-3">
          <div className="text-3xl font-semibold text-black-2">Reviews</div>
          <div className="grid md:grid-cols-3 gap-4">
            <CustomSelect
              value={timeframe}
              onChange={setTimeframe}
              options={timeframeOptions}
            />
            <CustomSelect
              value={category}
              onChange={setCategory}
              options={categoryOptions}
            />
            <CustomSelect
              value={product}
              onChange={setProduct}
              options={productOptions}
            />
          </div>

          <div className="flex flex-wrap justify-between items-center mt-5">
            <div className="text-[#484848] text-sm sm:text-base">
              Showing 1-{Math.min(visibleReviews, filteredReviews.length)} of{" "}
              {filteredReviews.length} results
            </div>
            <div className="flex justify-end items-center w-full sm:w-2/5 mt-3 sm:mt-0">
              <label
                htmlFor="filterSelect"
                className="mr-2 font-medium text-sm sm:text-base text-[#484848]"
              >
                Sort By:
              </label>
              <select
                id="filterSelect"
                value={filterType}
                onChange={handleFilterChange}
                className="p-1.5 border rounded text-sm cursor-pointer w-full sm:w-4/12"
              >
                <option className="text-[#484848]" value="Most Recent">
                  Most Recent
                </option>
                <option className="text-[#484848]" value="Rating">
                  Rating
                </option>
              </select>
            </div>
          </div>

          <Reviews
            filteredReviews={filteredReviews}
            handleShowMore={handleShowMore}
            visibleReviews={visibleReviews}
          />
        </div>
      </section>
    </main>
  );
}
