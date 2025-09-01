import React, { useState, useEffect } from "react";
import {
  Package,
  Truck,
  Home,
  Check,
  AlertCircle,
  Clock,
  TruckIcon,
} from "lucide-react";
import { formatDate } from "../../../utils/date&Time/dateAndTimeFormatter";

const TrackOrderModal = ({ isOpen, onClose, order }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [deliveryTimeline, setDeliveryTimeline] = useState([]);
  const [trackingDetails, setTrackingDetails] = useState(null);

  // Animation classes for modal
  const modalClasses = isOpen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out"
    : "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-0 pointer-events-none transition-opacity duration-300 ease-in-out";

  const contentClasses = isOpen
    ? "bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ease-in-out scale-100 animate-fadeIn"
    : "bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ease-in-out scale-95";

  useEffect(() => {
    if (isOpen && order) {
      generateDeliveryTimeline();
      // Simulating tracking details fetch
      setTimeout(() => {
        fetchTrackingDetails();
      }, 500);
    }
  }, [isOpen, order]);

  const generateDeliveryTimeline = () => {
    const timeline = [];

    // Basic steps for all orders
    timeline.push({
      id: "placed",
      title: "Order Placed",
      description: "Your order has been confirmed",
      date: order.created_at ? formatDate(order.created_at) : "N/A",
      status: "completed",
      icon: <Package size={18} />,
    });

    if (order.status === "cancelled") {
      timeline.push({
        id: "cancelled",
        title: "Order Cancelled",
        description: "Your order has been cancelled",
        date: order.cancelledDate ? formatDate(order.cancelledDate) : "N/A",
        status: "error",
        icon: <AlertCircle size={18} />,
      });
    } else {
      // Add shipped step
      timeline.push({
        id: "shipped",
        title: "Order Shipped",
        description: "Your order has been shipped",
        date: order.shippedDate ? formatDate(order.shippedDate) : "Pending",
        status:
          order.status === "shipped" ||
          order.status === "intransit" ||
          order.status === "delivered"
            ? "completed"
            : "pending",
        icon: <Package size={18} />,
      });

      // Add in transit step
      timeline.push({
        id: "intransit",
        title: "In Transit",
        description: "Your order is on the way",
        date: order.transitDate ? formatDate(order.transitDate) : "Pending",
        status:
          order.status === "intransit" || order.status === "delivered"
            ? "completed"
            : "pending",
        icon: <Truck size={18} />,
      });

      // Add out for delivery step
      timeline.push({
        id: "outfordelivery",
        title: "Out for Delivery",
        description: "Your order is out for delivery",
        date: order.outForDeliveryDate
          ? formatDate(order.outForDeliveryDate)
          : "Pending",
        status: order.outForDeliveryDate ? "completed" : "pending",
        icon: <Home size={18} />,
      });

      // Add delivered step
      timeline.push({
        id: "delivered",
        title: "Delivered",
        description: "Your order has been delivered",
        date: order.deliveredDate ? formatDate(order.deliveredDate) : "Pending",
        status: order.status === "delivered" ? "completed" : "pending",
        icon: <Check size={18} />,
      });

      // Handle return/replacement scenarios
      if (
        order.status === "return pending" ||
        order.status === "return initiated"
      ) {
        timeline.push({
          id: "return_initiated",
          title: "Return Initiated",
          description: "Your return request has been initiated",
          date: order.returnInitiatedDate
            ? formatDate(order.returnInitiatedDate)
            : formatDate(new Date()),
          status: "pending",
          icon: <Clock size={18} />,
        });
      }

      if (order.status === "returned") {
        timeline.push({
          id: "return_initiated",
          title: "Return Initiated",
          description: "Your return request has been initiated",
          date: order.returnInitiatedDate
            ? formatDate(order.returnInitiatedDate)
            : "N/A",
          status: "completed",
          icon: <Clock size={18} />,
        });

        timeline.push({
          id: "returned",
          title: "Return Completed",
          description: "Your return has been processed",
          date: order.returnedDate
            ? formatDate(order.returnedDate)
            : formatDate(new Date()),
          status: "completed",
          icon: <Check size={18} />,
        });
      }

      // Handle replacement
      if (
        order.status === "replacement pending" ||
        order.status === "replacement initiated"
      ) {
        timeline.push({
          id: "replacement_initiated",
          title: "Replacement Initiated",
          description: "Your replacement request has been initiated",
          date: order.replacementInitiatedDate
            ? formatDate(order.replacementInitiatedDate)
            : formatDate(new Date()),
          status: "pending",
          icon: <Clock size={18} />,
        });
      }

      if (order.status === "replaced") {
        timeline.push({
          id: "replacement_initiated",
          title: "Replacement Initiated",
          description: "Your replacement request has been initiated",
          date: order.replacementInitiatedDate
            ? formatDate(order.replacementInitiatedDate)
            : "N/A",
          status: "completed",
          icon: <Clock size={18} />,
        });

        timeline.push({
          id: "replaced",
          title: "Replacement Completed",
          description: "Your replacement has been processed",
          date: order.replacedDate
            ? formatDate(order.replacedDate)
            : formatDate(new Date()),
          status: "completed",
          icon: <Check size={18} />,
        });
      }
    }

    setDeliveryTimeline(timeline);

    // Set active step based on timeline
    const completedSteps = timeline.filter(
      (step) => step.status === "completed"
    ).length;
    setActiveStep(Math.max(0, completedSteps - 1));
  };

  const fetchTrackingDetails = () => {
    // Simulated tracking details based on order status
    const trackingInfo = {
      courier_name: order.courier_name || "",
      trackingId: order.tracking_id || "",
      tracking_url: order.tracking_url || "",
      expectedDelivery:
        order.estimatedDeliveryDate ||
        formatDate(new Date(Date.now() + 86400000 * 2)), // 2 days from now
      currentLocation: "Regional Distribution Center",
    };

    if (order.tracking_id) {
      setTrackingDetails(trackingInfo);
    } else {
      // Generate mock tracking details based on status
      let mockDetails = null;

      switch (order.status) {
        case "intransit":
          mockDetails = {
            courier: order.courier_name || "Express Logistics",
            trackingId:
              order.trackingId ||
              `TR${Math.floor(1000000 + Math.random() * 9000000)}`,
            expectedDelivery:
              order.estimatedDeliveryDate ||
              formatDate(new Date(Date.now() + 86400000 * 2)), // 2 days from now
            currentLocation: "Regional Distribution Center",
            updates: [
              {
                status: "In Transit",
                location: "Regional Distribution Center",
                timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
              },
              {
                status: "Shipped",
                location: "Warehouse",
                timestamp: new Date(Date.now() - 86400000).toISOString(), // 24 hours ago
              },
            ],
          };
          break;
        case "shipped":
          mockDetails = {
            courier: order.courier_name || "Express Logistics",
            trackingId:
              order.trackingId ||
              `TR${Math.floor(1000000 + Math.random() * 9000000)}`,
            expectedDelivery:
              order.estimatedDeliveryDate ||
              formatDate(new Date(Date.now() + 86400000 * 3)), // 3 days from now
            currentLocation: "Warehouse",
            updates: [
              {
                status: "Shipped",
                location: "Warehouse",
                timestamp: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
              },
            ],
          };
          break;
        case "delivered":
          mockDetails = {
            courier: order.courier_name || "Express Logistics",
            trackingId:
              order.trackingId ||
              `TR${Math.floor(1000000 + Math.random() * 9000000)}`,
            deliveryDate:
              order.deliveredDate ||
              formatDate(new Date(Date.now() - 86400000)), // 1 day ago
            deliveredTo: "Customer Address",
            updates: [
              {
                status: "Delivered",
                location: "Customer Address",
                timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
              },
              {
                status: "Out for Delivery",
                location: "Local Distribution Center",
                timestamp: new Date(
                  Date.now() - 86400000 - 21600000
                ).toISOString(), // 1 day + 6 hours ago
              },
              {
                status: "In Transit",
                location: "Regional Distribution Center",
                timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
              },
              {
                status: "Shipped",
                location: "Warehouse",
                timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
              },
            ],
          };
          break;
        default:
          // For placed or other statuses
          mockDetails =
            order.status === "placed"
              ? {
                  message:
                    "Your order has been placed and will be shipped soon.",
                  orderDate: formatDate(order.created_at || new Date()),
                  expectedShipping: formatDate(new Date(Date.now() + 86400000)), // 1 day from now
                }
              : null;
      }

      setTrackingDetails(mockDetails);
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

  if (!isOpen) return null;

  return (
    <div className={modalClasses} onClick={onClose}>
      <div className={contentClasses} onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-black">
              Track Your Order
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Order Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg animate-fadeIn">
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="w-20 h-24 flex-shrink-0 bg-white p-2 rounded">
                <img
                  src={order.images?.[0] || ""}
                  alt={order.productName}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src = "/assets/skeleton/empty-orders.svg";
                  }}
                />
              </div>
              <div className="flex-grow">
                <h3 className="text-sm font-medium text-black line-clamp-2">
                  {order.productName}
                </h3>
                <div className="text-xs text-gray-500 mt-1">
                  <p>Order ID: {order.orderId}</p>
                  <p>Placed on: {formatDate(order.created_at)}</p>
                  {order.variations &&
                    Object.keys(order.variations).length > 0 && (
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {order.variations?.size?.variation && (
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                            Size: {order.variations.size.variation}
                          </span>
                        )}
                        {order.variations?.color?.variation && (
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs flex items-center">
                            Color: {order.variations.color.variation}
                            {order.variations.color.code && (
                              <span
                                className="ml-1 inline-block w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: order.variations.color.code,
                                }}
                              ></span>
                            )}
                          </span>
                        )}
                      </div>
                    )}
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-medium text-black">
                  ₹{order.order_total}
                </p>
                <p className="text-xs text-gray-500">Qty: {order.qty}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative pb-6 animate-fadeIn">
            <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gray-200"></div>
            {deliveryTimeline.map((step, index) => (
              <div key={step.id} className="flex items-start mb-6 relative">
                <div
                  className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center z-10 ${
                    step.status === "completed"
                      ? "bg-green-50 text-green-500 ring-2 ring-green-100"
                      : step.status === "error"
                      ? "bg-red-50 text-red-500 ring-2 ring-red-100"
                      : "bg-gray-50 text-gray-400 ring-2 ring-gray-100"
                  }`}
                >
                  {step.icon}
                </div>
                <div className="ml-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium text-black">
                        {step.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {step.description}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">{step.date}</span>
                  </div>

                  {/* Status dot indicator */}
                  <div className="flex items-center mt-2">
                    <span
                      className={`w-2 h-2 rounded-full ${getStatusColorClass(
                        step.status
                      )}`}
                    ></span>
                    <span className="ml-2 text-xs">
                      {step.status === "completed"
                        ? "Completed"
                        : step.status === "error"
                        ? "Cancelled"
                        : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tracking Details */}
          {trackingDetails && (
            <div className="mt-8 bg-gray-50 rounded-lg p-4 animate-fadeIn">
              <h3 className="text-sm font-semibold mb-3">Tracking Details</h3>

              {/* Show appropriate tracking content based on status */}
              {order.status === "placed" ? (
                <div className="text-sm">
                  <p>{trackingDetails.message}</p>
                  <p className="mt-2">
                    <span className="font-medium">Order Date:</span>{" "}
                    {trackingDetails.orderDate}
                  </p>
                  <p className="mt-1">
                    <span className="font-medium">Expected Delivery:</span>{" "}
                    {trackingDetails.expectedShipping}
                  </p>
                </div>
              ) : order.status === "delivered" ? (
                <div>
                  <div className="flex flex-col md:flex-row md:justify-between gap-2 text-sm mb-4">
                    <div>
                      <p className="font-medium">Courier</p>
                      <p className="text-gray-600">
                        {trackingDetails.courier_name}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Tracking ID</p>
                      <p className="text-gray-600">
                        {trackingDetails.trackingId}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Delivered On</p>
                      <p className="text-gray-600">
                        {trackingDetails.deliveryDate}
                      </p>
                    </div>
                  </div>

                  {/* Tracking history */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">
                      Delivery History
                    </h4>
                    <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                      {trackingDetails.updates?.map((update, idx) => (
                        <div key={idx} className="flex items-start text-sm">
                          <div className="mt-1 w-2 h-2 rounded-full bg-gray-400 flex-shrink-0"></div>
                          <div className="ml-3">
                            <p className="font-medium">{update.status}</p>
                            <div className="text-xs text-gray-500 mt-1">
                              <p>{update.location}</p>
                              <p>{formatDate(update.timestamp)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col md:flex-row md:justify-between gap-2 text-sm mb-4">
                    <div>
                      <p className="font-medium">Courier</p>
                      <p className="text-gray-600">
                        {trackingDetails.courier_name}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Tracking ID</p>
                      <p className="text-gray-600">
                        {trackingDetails.trackingId}
                      </p>
                    </div>
                    {trackingDetails.tracking_url && (
                      <div>
                        <p className="font-medium">Tracking URL</p>
                        <p className="text-gray-600">
                          <a
                            href={trackingDetails.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {trackingDetails.tracking_url}
                          </a>
                        </p>
                      </div>
                    )}
                    {/* <div>
                      <p className="font-medium">Expected Delivery</p>
                      <p className="text-gray-600">
                        {trackingDetails.expectedDelivery}
                      </p>
                    </div> */}
                  </div>

                  {/* Current tracking status */}
                  <div className="bg-gray-100 p-3 rounded-md mt-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                        <Clock size={16} />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">Current Status</p>
                        <p className="text-xs text-gray-600">
                          {trackingDetails.currentLocation} -{" "}
                          {order.status === "intransit"
                            ? "In Transit"
                            : "Shipped"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tracking history */}
                  {trackingDetails.updates &&
                    trackingDetails.updates.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">
                          Tracking History
                        </h4>
                        <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                          {trackingDetails.updates.map((update, idx) => (
                            <div key={idx} className="flex items-start text-sm">
                              <div className="mt-1 w-2 h-2 rounded-full bg-gray-400 flex-shrink-0"></div>
                              <div className="ml-3">
                                <p className="font-medium">{update.status}</p>
                                <div className="text-xs text-gray-500 mt-1">
                                  <p>{update.location}</p>
                                  <p>{formatDate(update.timestamp)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          )}

          {/* Return/Replacement Status */}
          {(order.status === "return pending" ||
            order.status === "return initiated" ||
            order.status === "returned" ||
            order.status === "replacement pending" ||
            order.status === "replacement initiated" ||
            order.status === "replaced") && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4 animate-fadeIn">
              <h3 className="text-sm font-semibold mb-3">
                {order.status.includes("return")
                  ? "Return Status"
                  : "Replacement Status"}
              </h3>

              <div className="text-sm">
                <div className="flex items-center mb-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      order.status === "returned" || order.status === "replaced"
                        ? "bg-green-100 text-green-500"
                        : "bg-blue-100 text-blue-500"
                    }`}
                  >
                    {order.status === "returned" ||
                    order.status === "replaced" ? (
                      <Check size={16} />
                    ) : (
                      <Clock size={16} />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">
                      {order.status === "returned"
                        ? "Return Completed"
                        : order.status === "replaced"
                        ? "Replacement Completed"
                        : order.status.includes("return")
                        ? "Return In Process"
                        : "Replacement In Process"}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {order.status === "returned"
                        ? `Return completed on ${
                            order.returnedDate
                              ? formatDate(order.returnedDate)
                              : "N/A"
                          }`
                        : order.status === "replaced"
                        ? `Replacement completed on ${
                            order.replacedDate
                              ? formatDate(order.replacedDate)
                              : "N/A"
                          }`
                        : `Request initiated on ${
                            order.status.includes("return")
                              ? order.returnInitiatedDate
                                ? formatDate(order.returnInitiatedDate)
                                : "N/A"
                              : order.replacementInitiatedDate
                              ? formatDate(order.replacementInitiatedDate)
                              : "N/A"
                          }`}
                    </p>
                  </div>
                </div>

                {/* Reason for return/replacement if available */}
                {order.returnReason && (
                  <div className="mt-3 p-3 bg-gray-100 rounded-md">
                    <p className="text-xs font-medium">Reason:</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {order.returnReason}
                    </p>
                  </div>
                )}

                {/* Next steps information */}
                {(order.status === "return pending" ||
                  order.status === "return initiated" ||
                  order.status === "replacement pending" ||
                  order.status === "replacement initiated") && (
                  <div className="mt-4 text-xs text-gray-600">
                    <p className="font-medium text-sm mb-2">Next Steps:</p>
                    <ul className="space-y-2 list-disc pl-5">
                      {order.status.includes("return") ? (
                        <>
                          <li>
                            Package pickup will be arranged within 2-3 business
                            days
                          </li>
                          <li>
                            Refund will be initiated after we receive and
                            inspect the item
                          </li>
                          <li>
                            Refund will be credited to your original payment
                            method
                          </li>
                        </>
                      ) : (
                        <>
                          <li>
                            Original item pickup will be arranged within 2-3
                            business days
                          </li>
                          <li>
                            Replacement will be shipped after we receive the
                            original item
                          </li>
                          <li>
                            You'll receive tracking information once the
                            replacement is shipped
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackOrderModal;
