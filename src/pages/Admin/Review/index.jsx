import React, { useState, useEffect } from "react";
import { MdStar, MdStarHalf, MdStarBorder } from "react-icons/md";
import { FiChevronLeft, FiChevronRight, FiCalendar } from "react-icons/fi";
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf } from "react-icons/fa";
import userDefaultImage from "/assets/user/person-circle.png";
import { formatDate } from "../../../utils/date&Time/dateAndTimeFormatter";
import {
  getAllReviews,
  updateReviewStatus,
} from "../../../services/api.review";

// Star Rating Component
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

// Custom Select Component
const CustomSelect = ({ label, value, onChange, options }) => {
  return (
    <div className="flex flex-col space-y-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="p-2 border border-gray-200 rounded-lg text-sm font-medium appearance-none bg-white pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
    </div>
  );
};

// Date Input Component
const DateInput = ({ label, value, onChange, placeholder }) => {
  return (
    <div className="flex flex-col space-y-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="p-2 pl-8 border border-gray-200 rounded-lg text-sm font-medium w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <FiCalendar className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  const statusIcons = {
    pending: <FaHourglassHalf className="inline mr-1" />,
    approved: <FaCheckCircle className="inline mr-1" />,
    rejected: <FaTimesCircle className="inline mr-1" />,
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}
    >
      {statusIcons[status]}
      {status?.charAt(0)?.toUpperCase() + status?.slice(1)}
    </span>
  );
};

// Review Card Component
const ReviewCard = ({ review, onStatusUpdate }) => {
  const handleStatusChange = async (status) => {
    try {
      await updateReviewStatus(review.id, { status });
      onStatusUpdate(review.id, status);
    } catch (error) {
      console.error("Error updating review status:", error);
    }
  };

  return (
    <div className="flex flex-col gap-4 border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 flex-wrap">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Product:</span>{" "}
            {review.product_name}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Category:</span>{" "}
            {review.category_name}
          </p>
          <StatusBadge status={review.status} />
        </div>
        <div className="text-xs text-gray-500">
          {formatDate(review.created_at)}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <img
          className="w-12 h-12 object-cover rounded-full border border-gray-200"
          src={review.customer_avatar || userDefaultImage}
          alt={review.customer_name}
        />
        <div>
          <span className="font-bold text-sm">{review.customer_name}</span>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={review.review} />
            <p className="text-xs font-medium text-gray-600">{review.review}</p>
          </div>
        </div>
      </div>

      {review.comment && (
        <div className="font-medium text-gray-800 text-sm">
          {review.comment}
        </div>
      )}

      {review.review_media && review.review_media.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
          {review.review_media.map((med, index) =>
            med.type === "image" ? (
              <img
                className="w-full h-24 object-cover rounded-md"
                key={index}
                src={med.media}
                alt={`Review Image ${index + 1}`}
              />
            ) : (
              <video
                className="w-full h-24 object-cover rounded-md"
                key={index}
                src={med.media}
                controls
              />
            )
          )}
        </div>
      )}

      {review.status === "pending" && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => handleStatusChange("approved")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
          >
            Approve
          </button>
          <button
            onClick={() => handleStatusChange("rejected")}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      if (startPage > 2) pages.push("...");
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      if (endPage < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex justify-center items-center mt-6 space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-full ${
          currentPage === 1
            ? "text-gray-400 cursor-not-allowed"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <FiChevronLeft className="text-lg" />
      </button>

      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => (typeof page === "number" ? onPageChange(page) : null)}
          className={`px-3 py-1 rounded-full text-sm ${
            page === currentPage
              ? "bg-blue-600 text-white"
              : page === "..."
              ? "text-gray-500 cursor-default"
              : "text-gray-700 hover:bg-gray-100"
          }`}
          disabled={page === "..."}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 0}
        className={`p-2 rounded-full ${
          currentPage === totalPages || totalPages === 0
            ? "text-gray-400 cursor-not-allowed"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <FiChevronRight className="text-lg" />
      </button>
    </div>
  );
};

// Main Reviews Page Component
export default function ReviewAdminPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [productId, setProductId] = useState("");
  const [status, setStatus] = useState("");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const fetchReviews = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.itemsPerPage,
        sortBy,
        sortOrder,
        fromDate: fromDate || null,
        toDate: toDate || null,
        category_id: categoryId || null,
        product_id: productId || null,
        status: status || null,
      };

      const response = await getAllReviews(params);

      if (response.status === 1) {
        setReviews(response.data || []);
        setPagination({
          currentPage: response.pagination.currentPage,
          totalPages: response.pagination.totalPages,
          totalItems: response.pagination.totalItems,
          itemsPerPage: pagination.itemsPerPage,
        });

        if (response.data && response.data.length > 0) {
          const uniqueCategories = [
            ...new Set(
              response.data
                .filter((r) => r.category_id && r.category_name)
                .map((r) => ({
                  id: r.category_id,
                  title: r.category_name,
                }))
            ),
          ];

          const uniqueProducts = [
            ...new Set(
              response.data
                .filter((r) => r.product_id && r.product_name)
                .map((r) => ({
                  id: r.product_id,
                  name: r.product_name,
                }))
            ),
          ];

          setCategories(uniqueCategories);
          setProducts(uniqueProducts);
        }
      } else {
        setError("Failed to fetch reviews");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError("Error fetching reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    fetchReviews(1);
  }, [
    fromDate,
    toDate,
    categoryId,
    productId,
    status,
    sortBy,
    sortOrder,
    pagination.itemsPerPage,
  ]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchReviews(newPage);
    }
  };

  const handleSortChange = (value) => {
    if (value === "Most Recent") {
      setSortBy("created_at");
      setSortOrder("DESC");
    } else if (value === "Highest Rating") {
      setSortBy("review");
      setSortOrder("DESC");
    } else if (value === "Lowest Rating") {
      setSortBy("review");
      setSortOrder("ASC");
    }
  };

  const handleStatusUpdate = (reviewId, newStatus) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === reviewId ? { ...review, status: newStatus } : review
      )
    );
  };

  const handleClearFilters = () => {
    setFromDate("");
    setToDate("");
    setCategoryId("");
    setProductId("");
    setStatus("");
  };

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...categories.map((cat) => ({ value: cat.id, label: cat.title })),
  ];

  const productOptions = [
    { value: "", label: "All Products" },
    ...products.map((prod) => ({ value: prod.id, label: prod.name })),
  ];

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Customer Reviews
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Manage and approve product reviews
          </p>
        </div>

        <div className="mb-6 bg-gray-50 p-4 sm:p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Filters</h2>
            {(fromDate || toDate || categoryId || productId || status) && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <DateInput
              label="From Date"
              value={fromDate}
              onChange={setFromDate}
              placeholder="Select start date"
            />
            <DateInput
              label="To Date"
              value={toDate}
              onChange={setToDate}
              placeholder="Select end date"
            />
            <CustomSelect
              label="Category"
              value={categoryId}
              onChange={setCategoryId}
              options={categoryOptions}
            />
            <CustomSelect
              label="Product"
              value={productId}
              onChange={setProductId}
              options={productOptions}
            />
            <CustomSelect
              label="Status"
              value={status}
              onChange={setStatus}
              options={statusOptions}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 px-1">
          <div className="text-sm text-gray-600 mb-2 sm:mb-0">
            Showing{" "}
            {pagination.totalItems === 0
              ? 0
              : (pagination.currentPage - 1) * pagination.itemsPerPage + 1}
            -
            {Math.min(
              pagination.currentPage * pagination.itemsPerPage,
              pagination.totalItems
            )}{" "}
            of {pagination.totalItems} results
          </div>
          <div className="flex items-center space-x-4">
            <CustomSelect
              label="Sort By"
              value={
                sortBy === "created_at"
                  ? "Most Recent"
                  : sortOrder === "DESC"
                  ? "Highest Rating"
                  : "Lowest Rating"
              }
              onChange={handleSortChange}
              options={[
                { value: "Most Recent", label: "Most Recent" },
                { value: "Highest Rating", label: "Highest Rating" },
                { value: "Lowest Rating", label: "Lowest Rating" },
              ]}
            />
            <div className="flex items-center space-x-2">
              <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
                Show:
              </label>
              <select
                id="itemsPerPage"
                value={pagination.itemsPerPage}
                onChange={(e) => {
                  const newLimit = parseInt(e.target.value);
                  setPagination((prev) => ({
                    ...prev,
                    itemsPerPage: newLimit,
                  }));
                }}
                className="text-sm border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-600 text-sm">{error}</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            No reviews found with the selected filters.
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </section>
    </main>
  );
}
