import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  Home,
  Check,
  AlertCircle,
  Clock,
  ArrowLeft,
  Share2,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { getOrderByOrderId } from "../../../services/api.order";

const TrackOrderPage = () => {
  const { orderToken } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deliveryTimeline, setDeliveryTimeline] = useState([]);
  const [trackingDetails, setTrackingDetails] = useState(null);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Decode order token to get order ID
  const decodeOrderToken = (token) => {
    try {
      // Simple base64 decode - you can make this more secure
      const decoded = atob(token);
      const [orderId, timestamp] = decoded.split("-");
      return orderId;
    } catch (error) {
      console.error("Invalid order token:", error);
      return null;
    }
  };

  // Fetch order data
  const fetchOrderData = async (orderId) => {
    try {
      setLoading(true);
      const result = await getOrderByOrderId(orderId);

      if (result.status === 1 && result.data) {
        setOrder(result.data);
        generateDeliveryTimeline(result.data);
        generateTrackingDetails(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch order");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const orderId = decodeOrderToken(orderToken);
    if (orderId) {
      fetchOrderData(orderId);
    } else {
      setError("Invalid tracking link");
      setLoading(false);
    }
  }, [orderToken]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const generateDeliveryTimeline = (orderData) => {
    const timeline = [];

    // Order Placed
    timeline.push({
      id: "placed",
      title: "Order Placed",
      description: "Your order has been confirmed",
      date: formatDate(orderData.createdAt),
      status: "completed",
      icon: <Package size={18} />,
    });

    if (orderData.orderStatus === "cancelled") {
      timeline.push({
        id: "cancelled",
        title: "Order Cancelled",
        description: "Your order has been cancelled",
        date: formatDate(orderData.cancelledAt),
        status: "error",
        icon: <AlertCircle size={18} />,
      });
    } else {
      // Shipped
      timeline.push({
        id: "shipped",
        title: "Order Shipped",
        description: "Your order has been shipped",
        date: formatDate(orderData.shippedAt),
        status: ["shipped", "intransit", "delivered"].includes(
          orderData.orderStatus
        )
          ? "completed"
          : "pending",
        icon: <Package size={18} />,
      });

      // In Transit
      timeline.push({
        id: "intransit",
        title: "In Transit",
        description: "Your order is on the way",
        date:
          orderData.orderStatus === "intransit" ||
          orderData.orderStatus === "delivered"
            ? formatDate(orderData.shippedAt || new Date())
            : "Pending",
        status: ["intransit", "delivered"].includes(orderData.orderStatus)
          ? "completed"
          : "pending",
        icon: <Truck size={18} />,
      });

      // Out for Delivery
      timeline.push({
        id: "outfordelivery",
        title: "Out for Delivery",
        description: "Your order is out for delivery",
        date:
          orderData.orderStatus === "delivered"
            ? formatDate(orderData.deliveredAt)
            : "Pending",
        status: orderData.orderStatus === "delivered" ? "completed" : "pending",
        icon: <Home size={18} />,
      });

      // Delivered
      timeline.push({
        id: "delivered",
        title: "Delivered",
        description: "Your order has been delivered",
        date: formatDate(orderData.deliveredAt),
        status: orderData.orderStatus === "delivered" ? "completed" : "pending",
        icon: <Check size={18} />,
      });

      // Handle returns and replacements
      if (orderData.orderStatus?.includes("return")) {
        timeline.push({
          id: "return",
          title:
            orderData.orderStatus === "returned"
              ? "Return Completed"
              : "Return In Process",
          description:
            orderData.orderStatus === "returned"
              ? "Your return has been processed"
              : "Your return request is being processed",
          date: formatDate(orderData.returnedAt),
          status:
            orderData.orderStatus === "returned" ? "completed" : "pending",
          icon: <Clock size={18} />,
        });
      }

      if (orderData.orderStatus?.includes("replacement")) {
        timeline.push({
          id: "replacement",
          title:
            orderData.orderStatus === "replaced"
              ? "Replacement Completed"
              : "Replacement In Process",
          description:
            orderData.orderStatus === "replaced"
              ? "Your replacement has been processed"
              : "Your replacement request is being processed",
          date: formatDate(orderData.replacedAt),
          status:
            orderData.orderStatus === "replaced" ? "completed" : "pending",
          icon: <Clock size={18} />,
        });
      }
    }

    setDeliveryTimeline(timeline);
  };

  const generateTrackingDetails = (orderData) => {
    const details = {
      courier: orderData.courier_name || "Express Logistics",
      trackingId:
        orderData.tracking_id ||
        `TR${Math.floor(1000000 + Math.random() * 9000000)}`,
      trackingUrl: orderData.tracking_url,
      expectedDelivery: formatDate(new Date(Date.now() + 86400000 * 2)),
      currentLocation: "Regional Distribution Center",
      updates: [],
    };

    // Generate tracking updates based on order status
    switch (orderData.orderStatus) {
      case "delivered":
        details.updates = [
          {
            status: "Delivered",
            location: "Customer Address",
            timestamp: orderData.deliveredAt || new Date().toISOString(),
          },
          {
            status: "Out for Delivery",
            location: "Local Distribution Center",
            timestamp: new Date(Date.now() - 21600000).toISOString(),
          },
          {
            status: "In Transit",
            location: "Regional Distribution Center",
            timestamp: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            status: "Shipped",
            location: "Warehouse",
            timestamp:
              orderData.shippedAt ||
              new Date(Date.now() - 86400000 * 2).toISOString(),
          },
        ];
        break;
      case "intransit":
        details.updates = [
          {
            status: "In Transit",
            location: "Regional Distribution Center",
            timestamp: new Date(Date.now() - 43200000).toISOString(),
          },
          {
            status: "Shipped",
            location: "Warehouse",
            timestamp:
              orderData.shippedAt ||
              new Date(Date.now() - 86400000).toISOString(),
          },
        ];
        break;
      case "shipped":
        details.updates = [
          {
            status: "Shipped",
            location: "Warehouse",
            timestamp:
              orderData.shippedAt ||
              new Date(Date.now() - 21600000).toISOString(),
          },
        ];
        break;
    }

    setTrackingDetails(details);
  };

  const handleShare = async () => {
    const currentUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(currentUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = currentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "pending":
        return "bg-gray-300";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "shipped":
      case "intransit":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "placed":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Order Not Found
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const product = order.products?.[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Home
              </button>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {shareSuccess ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={16} />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Order Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 animate-fadeIn">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Order #{order.orderNumber}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1" />
                  Placed on {formatDate(order.createdAt)}
                </div>
                <div className="flex items-center">
                  <Package size={16} className="mr-1" />
                  {order.qty} item{order.qty > 1 ? "s" : ""}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                ₹{order.orderTotal}
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeClass(
                  order.orderStatus
                )}`}
              >
                {order.orderStatus?.charAt(0).toUpperCase() +
                  order.orderStatus?.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Product Info */}
        {product && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 animate-fadeIn">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Items
            </h2>
            <div className="flex items-start space-x-4">
              <div className="w-20 h-24 flex-shrink-0 bg-gray-100 rounded-lg p-2">
                <img
                  src={
                    product.images?.[0] || "/assets/skeleton/empty-orders.svg"
                  }
                  alt={product.productName}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src = "/assets/skeleton/empty-orders.svg";
                  }}
                />
              </div>
              <div className="flex-grow">
                <h3 className="font-medium text-gray-900 mb-1">
                  {product.productName}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    Price: ₹{product.discountedPrice || product.originalPrice}
                  </p>
                  <p>Quantity: {order.qty}</p>
                  {product.variations && (
                    <div className="flex gap-2 flex-wrap">
                      {product.variations.size?.variation && (
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          Size: {product.variations.size.variation}
                        </span>
                      )}
                      {product.variations.color?.variation && (
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs flex items-center">
                          Color: {product.variations.color.variation}
                          {product.variations.color.colorCode && (
                            <span
                              className="ml-1 w-3 h-3 rounded-full border"
                              style={{
                                backgroundColor:
                                  product.variations.color.colorCode,
                              }}
                            />
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Progress */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 animate-fadeIn">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Order Progress
          </h2>

          {/* Progress Bar */}
          <div className="relative mb-8">
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200"></div>
            <div className="flex justify-between relative">
              {deliveryTimeline.slice(0, 4).map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                      step.status === "completed"
                        ? "bg-green-500 text-white"
                        : step.status === "error"
                        ? "bg-red-500 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {step.icon}
                  </div>
                  <div className="mt-3 text-center">
                    <p
                      className={`text-sm font-medium ${
                        step.status === "completed"
                          ? "text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Timeline */}
          <div className="space-y-4">
            {deliveryTimeline.map((step, index) => (
              <div key={step.id} className="flex items-start space-x-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step.status === "completed"
                      ? "bg-green-100 text-green-600"
                      : step.status === "error"
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {React.cloneElement(step.icon, { size: 16 })}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">{step.title}</h3>
                    <span className="text-sm text-gray-500">{step.date}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tracking Details */}
        {trackingDetails && order.orderStatus !== "placed" && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 animate-fadeIn">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tracking Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-sm font-medium text-gray-900">Courier</p>
                <p className="text-sm text-gray-600">
                  {trackingDetails.courier}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Tracking ID</p>
                <p className="text-sm text-gray-600">
                  {trackingDetails.trackingId}
                </p>
              </div>
              {trackingDetails.trackingUrl && (
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Track Online
                  </p>
                  <a
                    href={trackingDetails.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    View on Courier Site
                  </a>
                </div>
              )}
            </div>

            {/* Tracking History */}
            {trackingDetails.updates && trackingDetails.updates.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">
                  Tracking History
                </h3>
                <div className="space-y-3">
                  {trackingDetails.updates.map((update, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {update.status}
                        </p>
                        <p className="text-sm text-gray-600">
                          {update.location}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(update.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="bg-white rounded-lg shadow-sm p-6 animate-fadeIn">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Shipping Address
            </h2>
            <div className="flex items-start space-x-3">
              <MapPin size={20} className="text-gray-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">
                  {order.shippingAddress.firstName}{" "}
                  {order.shippingAddress.lastName}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {order.shippingAddress.streetAddress}
                </p>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zip}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Phone size={14} className="mr-1" />
                    {order.shippingAddress.phone}
                  </div>
                  {order.shippingAddress.email && (
                    <div className="flex items-center">
                      <Mail size={14} className="mr-1" />
                      {order.shippingAddress.email}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TrackOrderPage;
