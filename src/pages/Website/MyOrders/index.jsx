import React, { useEffect, useState } from "react";
import {
  Trash2,
  ChevronRight,
  ShoppingBag,
  Package,
  MapPin,
  Check,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { AccountInfo } from "../../../components/Website/AccountInfo";
import { IoMdCalendar } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import config from "../../../config/config";
import { useAppContext } from "../../../context/AppContext";
import {
  cancelOrder,
  createReturnOrReplacement,
  getOrdersByUserId,
} from "../../../services/api.order";
import EmptyImg from "/assets/skeleton/order-ongoing-empty.svg";
import { GoSearch } from "react-icons/go";
import { FaFilter } from "react-icons/fa";
import TrackOrderModal from "../../../components/Website/TrackOrderModal";
import CancelOrder from "../../../components/Website/CancelOrder";
import ReturnOrder from "../../../components/Website/ReturnOrder";
import ReplaceOrder from "../../../components/Website/ReplaceOrder";
import CommonTopBanner from "../../../components/Website/CommonTopBanner";
import common_top_banner from "/assets/banners/Commen-top-banner.png";
import { formatDate } from "../../../utils/date&Time/dateAndTimeFormatter";
import { differenceInDays, parseISO } from "date-fns";
import AddReviewModal from "../../../components/Website/AddReviewModal";
import {
  notifyOnFail,
  notifyOnSuccess,
} from "../../../utils/notification/toast";

const bannerData = [
  {
    id: 1,
    image: common_top_banner,
  },
];

// Order status configuration for visual representation
const ORDER_STATUS_CONFIG = {
  placed: {
    color: "border-blue-500 text-blue-500 bg-blue-100",
    icon: <ShoppingBag size={16} />,
    label: "Placed",
    description: "Your order has been placed successfully",
  },
  shipped: {
    color: "border-indigo-500 text-indigo-500 bg-indigo-100",
    icon: <Package size={16} />,
    label: "Shipped",
    description: "Your order is on its way",
  },
  intransit: {
    color: "border-purple-500 text-purple-500 bg-purple-100",
    icon: <MapPin size={16} />,
    label: "In Transit",
    description: "Your order is in transit",
  },
  delivered: {
    color: "border-green-500 text-green-500 bg-green-100",
    icon: <Check size={16} />,
    label: "Delivered",
    description: "Your order has been delivered",
  },
  cancelled: {
    color: "border-red-500 text-red-500 bg-red-100",
    icon: <AlertTriangle size={16} />,
    label: "Cancelled",
    description: "Your order has been cancelled",
  },
  rejected: {
    color: "border-red-500 text-red-500 bg-red-100",
    icon: <AlertTriangle size={16} />,
    label: "Rejected",
    description: "Your order has been rejected",
  },
  "return pending": {
    color: "border-orange-500 text-orange-500 bg-orange-100",
    icon: <Clock size={16} />,
    label: "Return Initiated",
    description: "Your return request has been initiated",
  },
  "return initiated": {
    color: "border-orange-500 text-orange-500 bg-orange-100",
    icon: <Clock size={16} />,
    label: "Return Initiated",
    description: "Your return request has been initiated",
  },
  returned: {
    color: "border-yellow-500 text-yellow-500 bg-yellow-100",
    icon: <Package size={16} />,
    label: "Returned",
    description: "Your item has been returned",
  },
  "replacement pending": {
    color: "border-orange-500 text-orange-500 bg-orange-100",
    icon: <Clock size={16} />,
    label: "Replacement Pending",
    description: "Your replacement request is being processed",
  },
  "replacement initiated": {
    color: "border-orange-500 text-orange-500 bg-orange-100",
    icon: <Clock size={16} />,
    label: "Replacement Initiated",
    description: "Your replacement has been initiated",
  },
  replaced: {
    color: "border-teal-500 text-teal-500 bg-teal-100",
    icon: <Check size={16} />,
    label: "Replaced",
    description: "Your item has been replaced",
  },
};

const FilterModal = ({
  isOpen,
  onClose,
  onApply,
  selectedStatus,
  setSelectedStatus,
  selectedTime,
  setSelectedTime,
}) => {
  const statusOptions = [
    "All",
    "placed",
    "shipped",
    "intransit",
    "delivered",
    "cancelled",
    "rejected",
    "returned",
  ];

  const timeOptions = [
    { label: "Anytime", days: null },
    { label: "Last 30 Days", days: 30 },
    { label: "Last 60 Days", days: 60 },
    { label: "Last 90 Days", days: 90 },
  ];

  const handleStatusChange = (e) => setSelectedStatus(e.target.value);
  const handleTimeChange = (e) => setSelectedTime(e.target.value);

  const handleApply = () => {
    onApply({
      status: selectedStatus,
      time: selectedTime,
    });
    onClose();
  };

  const handleClearFilters = () => {
    setSelectedStatus("All");
    setSelectedTime("Anytime");
    onApply({
      status: "All",
      time: "Anytime",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 animate-fadeIn">
      <div className="bg-white p-6 w-96 rounded-lg shadow-lg relative">
        <h2 className="text-xl font-semibold mb-4 text-black">Filter Orders</h2>
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-black hover:text-gray-700 transition-colors"
        >
          ✕
        </button>

        {/* Status Filter */}
        <div className="mb-4">
          <h3 className="font-medium text-black">Status</h3>
          <div className="text-[#484848] max-h-48 overflow-y-auto">
            {statusOptions.map((status) => (
              <label
                key={status}
                className="block mt-2 hover:bg-gray-50 p-1 rounded transition-colors cursor-pointer"
              >
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={selectedStatus === status}
                  onChange={handleStatusChange}
                  className="mr-2 accent-black"
                />
                {status === "All"
                  ? status
                  : ORDER_STATUS_CONFIG[status]?.label ||
                    status.charAt(0).toUpperCase() + status.slice(1)}
              </label>
            ))}
          </div>
        </div>

        {/* Time Filter */}
        <div className="mb-4">
          <h3 className="font-medium text-black">Time</h3>
          <div className="text-[#484848]">
            {timeOptions.map((option) => (
              <label
                key={option.label}
                className="block mt-2 hover:bg-gray-50 p-1 rounded transition-colors cursor-pointer"
              >
                <input
                  type="radio"
                  name="orderDate"
                  value={option.label}
                  checked={selectedTime === option.label}
                  onChange={handleTimeChange}
                  className="mr-2 accent-black"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col space-y-2 mt-6">
          <button
            onClick={handleApply}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
          >
            Apply
          </button>
          <button
            onClick={handleClearFilters}
            className="text-black border py-2 border-black hover:bg-gray-50 transition-colors focus:bg-black focus:text-white"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderItem = ({
  order,
  product,
  index,
  toggleTrackModal,
  toggleCancelModal,
  toggleReturnModal,
  toggleReplaceModal,
  handleShareOrder,
  setOrderToReturnReplaceCancel,
  showReviewForm,
}) => {
  const statusConfig =
    ORDER_STATUS_CONFIG[product.status] || ORDER_STATUS_CONFIG.placed;

  // Calculate if order is returnable (within 7 days of delivery)
  const isReturnEligible =
    product.status === "delivered" &&
    product.deliveredDate &&
    differenceInDays(new Date(), new Date(product.deliveredDate)) <= 7;

  return (
    <div className="p-4 border rounded-lg mb-4 transition-all hover:shadow-md animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b pb-4">
        <div className="flex gap-4 items-center">
          <div className="w-20 h-28 md:w-28 md:h-40 flex items-center justify-center bg-gray-50 rounded-md">
            <img
              src={product.images[0] || ""}
              className="w-full h-full object-contain p-2"
              alt={product.productName}
              onError={(e) => {
                e.target.src = "/assets/skeleton/empty-orders.svg";
              }}
            />
          </div>
          <div className="pl-2">
            <p className="font-medium text-black text-sm md:text-base line-clamp-2">
              {product.productName}{" "}
              <span className="font-normal text-[#484848] text-xs ml-2">
                (Order ID: {order.orderNumber})
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-x-4 text-xs md:text-sm text-[#484848] font-normal my-2">
              {product.variations?.size?.variation && (
                <p className="flex items-center gap-1">
                  Size:{" "}
                  <span className="font-medium">
                    {product.variations.size.variation}
                  </span>
                </p>
              )}
              {product.variations?.color?.variation && (
                <p className="flex items-center gap-1">
                  Color:
                  <span className="font-medium flex items-center gap-1">
                    {product.variations.color.variation}
                    {product.variations.color.code && (
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: product.variations.color.code,
                        }}
                      ></span>
                    )}
                  </span>
                </p>
              )}
              <p>
                Quantity: <span className="font-medium">{product.qty}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 text-xs md:text-sm text-[#484848] font-normal">
              {product.status === "delivered" ? (
                <p>
                  Total Bill:{" "}
                  <span className="font-medium">₹{product.order_total}</span>
                </p>
              ) : (
                <>
                  <p>
                    Price:{" "}
                    <span className="font-medium">
                      ₹{product.totalPrice || "N/A"}
                    </span>
                  </p>
                  <p>
                    Discount:{" "}
                    <span className="font-medium">
                      ₹{product.discount_amount}
                    </span>
                  </p>
                  <p>
                    Total Bill:{" "}
                    <span className="font-medium">₹{product.order_total}</span>
                  </p>
                </>
              )}
            </div>

            {(product.instant_return_charge ||
              product.normal_return_charge) && (
              <div className="flex items-center gap-x-4 text-xs md:text-sm text-[#484848] font-normal my-2">
                <p>
                  {product.instant_return_charge
                    ? "Instant Return Charge"
                    : "Normal Return Charge"}
                  :{" "}
                  <span className="font-medium">
                    ₹
                    {product.instant_return_charge ||
                      product.normal_return_charge}
                  </span>
                </p>
              </div>
            )}

            {/* {product.status === "delivered" && isReturnEligible && (
              <>
                <div className="flex md:gap-2 my-2">
                  {product.is_returnable && (
                    <button
                      className="text-black text-sm underline cursor-pointer focus:outline-none hover:text-gray-700 transition"
                      onClick={() => {
                        toggleReturnModal();
                        setOrderToReturnReplaceCancel(product);
                      }}
                    >
                      Return Order
                    </button>
                  )}
                  <span className="mx-1">/</span>
                  <button
                    className="text-black text-sm underline cursor-pointer focus:outline-none hover:text-gray-700 transition"
                    onClick={() => {
                      setOrderToReturnReplaceCancel(product);
                      toggleReplaceModal();
                    }}
                  >
                    Replace Order
                  </button>
                </div>
                <p className="text-xs text-[#484848]">
                  (Valid till one week of your order delivery date)
                </p>
              </>
            )} */}

            {product.status !== "delivered" && (
              <div className="text-xs md:text-sm text-gray-600 font-normal my-2">
                <p>
                  Estimated Delivery:{" "}
                  <span className="font-medium">
                    {order.estimatedDeliveryDate || "Not Available"}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-y-2 mt-4 md:mt-0">
          {product.status === "placed" && (
            <div className="flex flex-col gap-2 mt-2 w-full md:w-auto">
              <button
                onClick={() => {
                  toggleTrackModal();
                  setOrderToReturnReplaceCancel(product);
                }}
                className="bg-[#5A5E44] text-white font-medium px-4 py-2 hover:bg-[#4D523B] transition text-sm md:text-base rounded-sm flex items-center justify-center gap-2"
              >
                <MapPin size={16} /> Track Order
              </button>
              <button
                onClick={() => handleShareOrder(product.orderId)}
                className="border border-[#5A5E44] text-[#5A5E44] font-medium px-3 py-2 hover:bg-[#F9F9F9] transition text-sm md:text-base rounded-sm flex items-center justify-center gap-2"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8.59 13.51L15.42 17.49"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15.41 6.51L8.59 10.49"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Share Order
              </button>
              <button
                onClick={() => {
                  toggleCancelModal();
                  setOrderToReturnReplaceCancel(product);
                }}
                className="text-[#5A5E44] underline font-medium px-3 py-2 hover:text-[#4D523B] transition text-sm md:text-base w-full md:w-auto mt-2 md:mt-0 flex items-center justify-center gap-2"
              >
                <Trash2 size={16} /> Cancel Order
              </button>
            </div>
          )}

          {(product.status === "shipped" || product.status === "intransit") && (
            <div className="flex flex-col gap-2 mt-2 w-full md:w-auto">
              <button
                onClick={() => {
                  toggleTrackModal();
                  setOrderToReturnReplaceCancel(product);
                }}
                className="bg-[#5A5E44] text-white font-medium px-4 py-2 text-xs md:text-base hover:bg-[#4D523B] transition rounded-sm flex items-center justify-center gap-2"
              >
                <MapPin size={16} /> Track Order
              </button>
              <button
                onClick={() => handleShareOrder(product.orderId)}
                className="border border-[#5A5E44] text-[#5A5E44] font-medium px-4 py-2 text-xs md:text-base hover:bg-[#F9F9F9] transition rounded-sm flex items-center justify-center gap-2"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8.59 13.51L15.42 17.49"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15.41 6.51L8.59 10.49"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Share Order
              </button>
            </div>
          )}

          {product.status === "delivered" && (
            <div className="flex flex-col gap-y-2 items-end">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span key={index} className="text-black">
                    {index < (product?.reviewStats?.average_rating || 0)
                      ? "★"
                      : "☆"}
                  </span>
                ))}
              </div>
              <button
                onClick={() => showReviewForm(product)}
                className="text-black text-sm font-semibold hover:text-gray-500 transition flex items-center gap-2"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Rate the Product
              </button>
              {/* <button
                onClick={() => console.log("Get Invoice")}
                className="border border-black text-black font-medium px-4 py-2 hover:bg-gray-100 transition rounded-sm flex items-center gap-2"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 17H8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 13H8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 9H9H8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 2V8H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Get Invoice
              </button> */}
            </div>
          )}
        </div>
      </div>

      {product.status && (
        <div className="text-sm text-gray-600 font-normal my-2 inline-flex items-center gap-x-4 animate-fadeIn">
          <button
            className={`border px-3 py-1.5 rounded-full font-medium transition flex items-center gap-2 ${statusConfig.color}`}
          >
            {statusConfig.icon}
            {statusConfig.label}
          </button>
          <p className="text-black text-sm md:text-base">
            {product.status === "delivered" && (
              <>
                Your Order was Delivered on{" "}
                <span className="font-medium">
                  {formatDate(product.deliveredDate)}
                </span>
              </>
            )}
            {product.status === "shipped" && (
              <>
                Your Order was Shipped on{" "}
                <span className="font-medium">
                  {formatDate(product.shippedDate)}
                </span>
              </>
            )}
            {product.status === "cancelled" && <>Your Order was Cancelled.</>}
            {product.status === "returned" && <>Your Order was Returned.</>}
            {product.status === "placed" && (
              <>Your Order has been placed successfully.</>
            )}
            {product.status === "return pending" ||
              (product.status === "return initiated" && (
                <>Your Return request has been initiated.</>
              ))}
          </p>
        </div>
      )}
    </div>
  );
};

const MyOrders = () => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "All",
    time: "Anytime",
  });
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [orderData, setOrderData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [
    showReturnReplaceCancelConfirmModal,
    setShowReturnReplaceCancelConfirmModal,
  ] = useState(false);
  const [orderToReturnReplaceCancel, setOrderToReturnReplaceCancel] =
    useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [orderToReview, setOrderToReview] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [returnDetails, setReturnDetails] = useState({
    return_reason: "",
    comments: "",
  });
  const [returnReplaceCancelMode, setReturnReplaceCancelMode] = useState(null);
  const [selectedStatusForFilter, setSelectedStatusForFilter] = useState("All");
  const [selectedTimeForFilter, setSelectedTimeForFilter] = useState("Anytime");
  const [returnReplaceCancelErrors, setReturnReplaceCancelErrors] = useState(
    {}
  );

  const navigate = useNavigate();
  const { user } = useAppContext();

  useEffect(() => {
    if (user?.id) {
      myOrders();
    }
  }, [user]);

  const myOrders = async () => {
    setIsLoading(true);
    try {
      const res = await getOrdersByUserId(user?.id);
      if (res && res.data) {
        setOrderData(res.data);
        setFilteredOrders(res.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    if (!orderData.length) return [];

    let filteredOrders = orderData;

    // Apply status filter
    if (filters.status !== "All") {
      filteredOrders = filteredOrders
        .map((order) => {
          // Filter products based on status
          const filteredProducts = order.products.filter((product) => {
            const matchesStatus =
              product.status === filters.status ||
              (product.status === "return pending" &&
                filters.status === "returned");
            return matchesStatus;
          });

          // If the order has matching products, include it
          if (filteredProducts.length > 0) {
            return { ...order, products: filteredProducts };
          }
          return null; // Exclude orders without matching products
        })
        .filter((order) => order !== null);
    }

    // Apply time filter
    if (selectedTimeForFilter !== "Anytime") {
      const dayLimit =
        selectedTimeForFilter === "Last 30 Days"
          ? 30
          : selectedTimeForFilter === "Last 60 Days"
          ? 60
          : 90;

      filteredOrders = filteredOrders
        .map((order) => {
          const filteredProducts = order.products.filter((product) => {
            return (
              product.created_at &&
              differenceInDays(new Date(), parseISO(product.created_at)) <=
                dayLimit
            );
          });

          if (filteredProducts.length > 0) {
            return { ...order, products: filteredProducts };
          }
          return null;
        })
        .filter((order) => order !== null);
    }

    // Apply search filter
    if (searchTerm) {
      filteredOrders = filteredOrders
        .map((order) => {
          const filteredProducts = order.products.filter(
            (product) =>
              product.productName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
          );

          if (filteredProducts.length > 0) {
            return { ...order, products: filteredProducts };
          }
          return null;
        })
        .filter((order) => order !== null);
    }

    return filteredOrders;
  };

  useEffect(() => {
    setFilteredOrders(filterOrders());
  }, [orderData, filters, searchTerm, selectedTimeForFilter]);

  const handleReturnReplaceCancelErrorsCleanup = () => {
    setReturnReplaceCancelErrors({});
  };

  const handleReturnDetailsCleanup = () => {
    setReturnDetails({
      return_reason: "",
      comments: "",
    });
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleFilterModal = () => {
    setIsFilterModalOpen(!isFilterModalOpen);
  };

  const toggleTrackModal = () => {
    setIsTrackModalOpen(!isTrackModalOpen);
  };

  const toggleCancelModal = () => {
    setIsCancelModalOpen(!isCancelModalOpen);
    handleReturnReplaceCancelErrorsCleanup();
  };

  const toggleReturnModal = () => {
    setIsReturnModalOpen(!isReturnModalOpen);
    handleReturnReplaceCancelErrorsCleanup();
    handleReturnDetailsCleanup();
  };

  const toggleReplaceModal = () => {
    setIsReplaceModalOpen(!isReplaceModalOpen);
    handleReturnReplaceCancelErrorsCleanup();
    handleReturnDetailsCleanup();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "All") {
      setFilters({ ...filters, status: "All" });
    } else if (tab === "Active") {
      setFilters({ ...filters, status: "placed" });
    } else if (tab === "Delivered") {
      setFilters({ ...filters, status: "delivered" });
    } else if (tab === "Cancelled") {
      setFilters({ ...filters, status: "cancelled" });
    } else if (tab === "Returned") {
      setFilters({ ...filters, status: "returned" });
    }
  };

  // Generate secure order token
  const generateOrderToken = (orderId) => {
    const timestamp = Date.now();
    const tokenData = `${orderId}-${timestamp}`;
    // Base64 encode for basic obfuscation - you can implement more secure encoding
    return btoa(tokenData);
  };

  // Validate token (optional - for additional security)
  const validateOrderToken = (token, maxAge = 30 * 24 * 60 * 60 * 1000) => {
    // 30 days default
    try {
      const decoded = atob(token);
      const [orderId, timestamp] = decoded.split("-");
      const tokenAge = Date.now() - parseInt(timestamp);

      return {
        isValid: tokenAge <= maxAge,
        orderId: orderId,
        age: tokenAge,
      };
    } catch (error) {
      return { isValid: false, orderId: null, age: null };
    }
  };

  // Enhanced share order function
  const handleShareOrder = async (orderId, options = {}) => {
    try {
      // Generate secure token
      const orderToken = generateOrderToken(orderId);

      // Create shareable URL with token
      const baseUrl = options.baseUrl || window.location.origin;
      const orderLink = `${baseUrl}/track/order/${orderToken}`;

      // Try to use modern Web Share API first (mobile devices)
      if (navigator.share && options.useWebShare !== false) {
        try {
          await navigator.share({
            title: `Order #${orderId} - Track Your Order`,
            text: `Track your order #${orderId} and get real-time updates on delivery status.`,
            url: orderLink,
          });

          // Show success message
          if (options.onSuccess) {
            options.onSuccess("Order shared successfully!");
          }
          return { success: true, method: "webshare", url: orderLink };
        } catch (shareError) {
          // If Web Share API fails, fall back to clipboard
          console.log("Web Share API failed, falling back to clipboard");
        }
      }

      // Fallback to clipboard copy
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(orderLink);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = orderLink;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      // Show success message
      if (options.onSuccess) {
        options.onSuccess("Order tracking link copied to clipboard!");
      }

      // Optional: Log sharing activity (for analytics)
      if (options.trackSharing) {
        // Send analytics event
        console.log("Order shared:", {
          orderId,
          method: "clipboard",
          timestamp: new Date(),
        });
      }

      return { success: true, method: "clipboard", url: orderLink };
    } catch (error) {
      console.error("Failed to share order:", error);

      if (options.onError) {
        options.onError("Failed to share order. Please try again.");
      }

      return { success: false, error: error.message };
    }
  };

  const handleCancelOrder = async (orderId) => {
    setIsLoading(true);
    try {
      const res = await cancelOrder(orderId, "customer", returnDetails);
      if (res && res.status === 1) {
        toggleCancelModal();
        myOrders();
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      notifyOnFail("Something went wrong while cancelling order.");
    } finally {
      setIsLoading(false);
      setOrderToReturnReplaceCancel(null);
    }
  };

  const handleReturnReplace = async (type) => {
    if (!returnDetails.return_reason) {
      setReturnReplaceCancelErrors({
        ...returnReplaceCancelErrors,
        return_reason: "Please select a reason",
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        orderId: orderToReturnReplaceCancel?.orderId,
        productId: orderToReturnReplaceCancel?.productId,
        userId: user?.id,
        type: type, // "return" or "replacement"
        reason: returnDetails.return_reason,
        comments: returnDetails.comments || "",
      };

      const res = await createReturnOrReplacement(payload);
      if (res && res.success) {
        type === "return" ? toggleReturnModal() : toggleReplaceModal();
        handleReturnDetailsCleanup();
        myOrders(); // Refresh orders
        notifyOnSuccess(
          `${
            type === "return" ? "Return" : "Replacement"
          } request initiated successfully!`
        );
      } else {
        notifyOnFail(
          res?.message || `Failed to initiate ${type}. Please try again.`
        );
      }
    } catch (error) {
      console.error(`Error initiating ${type}:`, error);
      notifyOnFail(`Something went wrong while initiating ${type}.`);
    } finally {
      setIsLoading(false);
      setOrderToReturnReplaceCancel(null);
    }
  };

  const showReviewForm = (product) => {
    setOrderToReview(product);
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (reviewData) => {
    // Implementation for submitting review
    setShowReviewModal(false);
    setOrderToReview(null);
    myOrders(); // Refresh orders to show updated review status
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fadeIn">
      <img
        src={EmptyImg}
        alt="No orders"
        className="w-40 h-40 object-contain mb-4"
      />
      <h3 className="text-xl font-semibold text-black mb-2">No Orders Found</h3>
      <p className="text-gray-500 mb-6 max-w-md">
        {searchTerm || filters.status !== "All" || filters.time !== "Anytime"
          ? "No orders match your search criteria. Try changing your filters."
          : "You haven't placed any orders yet. Start shopping to see your orders here."}
      </p>
      <button
        onClick={() => navigate("/shop")}
        className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors flex items-center gap-2"
      >
        <ShoppingBag size={16} /> Start Shopping
      </button>
    </div>
  );

  const renderOrderCards = () => {
    return filteredOrders.map((order, orderIndex) => (
      <div key={order.id} className="mb-8 animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <IoMdCalendar className="text-gray-500" size={18} />
            <p className="text-black font-medium">
              Order Date: {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <p className="text-[#484848] text-sm">
              Payment Mode:{" "}
              <span className="font-medium">{order.paymentMethod}</span>
            </p>
            <p className="text-[#484848] text-sm">
              Payment Status:{" "}
              <span className="font-medium">{order.paymentStatus}</span>
            </p>
          </div>
        </div>

        {order.products.map((product, productIndex) => (
          <OrderItem
            key={product.id || productIndex}
            order={order}
            product={product}
            index={productIndex}
            toggleTrackModal={toggleTrackModal}
            toggleCancelModal={toggleCancelModal}
            toggleReturnModal={toggleReturnModal}
            toggleReplaceModal={toggleReplaceModal}
            handleShareOrder={handleShareOrder}
            setOrderToReturnReplaceCancel={setOrderToReturnReplaceCancel}
            showReviewForm={showReviewForm}
          />
        ))}
      </div>
    ));
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <CommonTopBanner bannerData={bannerData} />
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/4">
              <AccountInfo />
            </div>
            <div className="w-full md:w-3/4">
              <div className="bg-white shadow-sm rounded-lg p-6 pb-8">
                <h2 className="text-2xl font-semibold text-black mb-6">
                  My Orders
                </h2>

                {/* Filter and Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search orders by name or order ID"
                      value={searchTerm}
                      onChange={handleSearch}
                      className="w-full border border-gray-300 p-3 pl-10 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black"
                    />
                    <GoSearch
                      className="absolute top-3.5 left-3 text-gray-400"
                      size={18}
                    />
                  </div>
                  <button
                    onClick={toggleFilterModal}
                    className="flex items-center justify-center gap-2 border border-black text-black py-3 px-4 rounded-md text-sm hover:bg-gray-50 transition-colors"
                  >
                    <FaFilter size={14} /> Filter
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex overflow-x-auto gap-4 mb-6 pb-2 scrollbar-hide">
                  <button
                    onClick={() => handleTabChange("All")}
                    className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === "All"
                        ? "bg-black text-white"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    All Orders
                  </button>
                  <button
                    onClick={() => handleTabChange("Active")}
                    className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === "Active"
                        ? "bg-black text-white"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => handleTabChange("Delivered")}
                    className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === "Delivered"
                        ? "bg-black text-white"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Delivered
                  </button>
                  <button
                    onClick={() => handleTabChange("Cancelled")}
                    className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === "Cancelled"
                        ? "bg-black text-white"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Cancelled
                  </button>
                  <button
                    onClick={() => handleTabChange("Returned")}
                    className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === "Returned"
                        ? "bg-black text-white"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Returned
                  </button>
                </div>

                {/* Order Cards */}
                {isLoading ? (
                  <div className="flex flex-col gap-4 animate-pulse">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="bg-gray-100 p-6 rounded-lg">
                        <div className="flex justify-between mb-4">
                          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                        </div>
                        <div className="flex gap-4 mb-4">
                          <div className="h-28 w-28 bg-gray-200 rounded"></div>
                          <div className="flex flex-col gap-2 flex-1">
                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          </div>
                          <div className="w-1/4">
                            <div className="h-10 bg-gray-200 rounded mb-2"></div>
                            <div className="h-10 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredOrders.length === 0 ? (
                  renderEmptyState()
                ) : (
                  renderOrderCards()
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={toggleFilterModal}
        onApply={handleApplyFilters}
        selectedStatus={selectedStatusForFilter}
        setSelectedStatus={setSelectedStatusForFilter}
        selectedTime={selectedTimeForFilter}
        setSelectedTime={setSelectedTimeForFilter}
      />

      {/* Track Order Modal */}
      {isTrackModalOpen && orderToReturnReplaceCancel && (
        <TrackOrderModal
          isOpen={isTrackModalOpen}
          onClose={toggleTrackModal}
          order={orderToReturnReplaceCancel}
        />
      )}

      {/* Cancel Order Modal */}
      {isCancelModalOpen && orderToReturnReplaceCancel && (
        <CancelOrder
          isOpen={isCancelModalOpen}
          onClose={toggleCancelModal}
          order={orderToReturnReplaceCancel}
          returnDetails={returnDetails}
          setReturnDetails={setReturnDetails}
          handleReturnDetailsCleanup={handleReturnDetailsCleanup}
          setShowReturnReplaceCancelConfirmModal={
            setShowReturnReplaceCancelConfirmModal
          }
          setReturnReplaceCancelMode={setReturnReplaceCancelMode}
          onCancel={handleCancelOrder}
          isLoading={isLoading}
          errors={returnReplaceCancelErrors}
          setErrors={setReturnReplaceCancelErrors}
        />
      )}

      {/* Return Order Modal */}
      {isReturnModalOpen && orderToReturnReplaceCancel && (
        <ReturnOrder
          isOpen={isReturnModalOpen}
          onClose={toggleReturnModal}
          order={orderToReturnReplaceCancel}
          returnDetails={returnDetails}
          setReturnDetails={setReturnDetails}
          handleReturnDetailsCleanup={handleReturnDetailsCleanup}
          setShowReturnReplaceCancelConfirmModal={
            setShowReturnReplaceCancelConfirmModal
          }
          setReturnReplaceCancelMode={setReturnReplaceCancelMode}
          onReturn={() => handleReturnReplace("return")}
          isLoading={isLoading}
          errors={returnReplaceCancelErrors}
          setErrors={setReturnReplaceCancelErrors}
        />
      )}

      {/* Replace Order Modal */}
      {isReplaceModalOpen && orderToReturnReplaceCancel && (
        <ReplaceOrder
          isOpen={isReplaceModalOpen}
          onClose={toggleReplaceModal}
          order={orderToReturnReplaceCancel}
          returnDetails={returnDetails}
          setReturnDetails={setReturnDetails}
          handleReturnDetailsCleanup={handleReturnDetailsCleanup}
          setShowReturnReplaceCancelConfirmModal={
            setShowReturnReplaceCancelConfirmModal
          }
          setReturnReplaceCancelMode={setReturnReplaceCancelMode}
          onReplace={() => handleReturnReplace("replacement")}
          isLoading={isLoading}
          errors={returnReplaceCancelErrors}
          setErrors={setReturnReplaceCancelErrors}
        />
      )}

      {/* Review Modal */}
      {showReviewModal && orderToReview && (
        <AddReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          product={orderToReview}
          onSubmit={handleReviewSubmit}
        />
      )}
    </>
  );
};

export default MyOrders;
