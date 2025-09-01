import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import {
  formatDate,
  formatTime,
} from "../../../utils/date&Time/dateAndTimeFormatter";
import axios from "axios";
import { updateOrderStatus } from "../../../services/api.order";
import { notifyOnFail } from "../../../utils/notification/toast";

const OrderModal = ({ isOpen, onClose, order, onOrderUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    order_status: "",
    tracking_id: "",
    tracking_url: "",
    courier_name: "",
    vendor_comment: "",
  });

  useEffect(() => {
    if (order) {
      setFormData({
        order_status: order.order_status || "",
        tracking_id: order.tracking_id || "",
        tracking_url: order.tracking_url || "",
        courier_name: order.courier_name || "",
        vendor_comment: order.vendor_comment || "",
      });
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await updateOrderStatus(order.id, formData);

      if (response.status === 1) {
        if (onOrderUpdate) {
          onOrderUpdate({ ...order, ...formData });
          onClose();
        }
      } else {
        notifyOnFail("Failed to update order");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      notifyOnFail(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const setToUpperChars = (str) => {
    if (!str || typeof str !== "string") {
      return "N/A";
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const formatPhone = (phone) => {
    if (!phone) return "N/A";
    return phone.startsWith("+") ? phone : `+91 ${phone}`;
  };

  const orderStatusOptions = [
    "placed",
    "shipped",
    "intransit",
    "delivered",
    "cancelled",
    "rejected",
    "return pending",
    "return initiated",
    "returned",
    "replacement pending",
    "replacement initiated",
    "replaced",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl h-[90%] p-6 relative overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-semibold mb-6">Order Details</h2>

        <div className="space-y-6">
          {/* Order Information */}
          <Section title="Order Information">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <DetailItem label="Order ID" value={order?.order_number} />
              <DetailItem
                label="Order Date"
                value={`${formatDate(order?.created_at)} ${formatTime(
                  order?.created_at
                )}`}
              />
              <DetailItem
                label="Order Status"
                value={setToUpperChars(order?.order_status)}
              />
              <DetailItem
                label="Payment Status"
                value={setToUpperChars(order?.payment_type)}
              />
              <DetailItem
                label="Payment ID"
                value={order?.payment_id || "N/A"}
              />
            </div>
          </Section>

          {/* Customer Information */}
          <Section title="Customer Information">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <DetailItem
                label="Customer Name"
                value={`${order?.Address?.first_name} ${order?.Address?.last_name}`}
              />
              <DetailItem
                label="Phone"
                value={formatPhone(order?.Address?.phone)}
              />
              <DetailItem label="Email" value={order?.Address?.email} />
            </div>
          </Section>

          {/* Shipping Address */}
          <Section title="Shipping Address">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <DetailItem
                label="Address"
                value={order?.Address?.street_address || "N/A"}
              />
              <DetailItem label="City" value={order?.Address?.city} />
              <DetailItem label="State" value={order?.Address?.state} />
              <DetailItem
                label="ZIP Code"
                value={order?.Address?.zip || "N/A"}
              />
            </div>
          </Section>

          {/* Product Details */}
          <Section title="Product Details">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <DetailItem label="Quantity" value={order?.qty} />
              {order?.product && (
                <>
                  <DetailItem
                    label="Product"
                    value={setToUpperChars(order?.product?.name)}
                  />
                  {order?.product?.variations && (
                    <>
                      {" "}
                      <DetailItem
                        label="Color"
                        value={setToUpperChars(
                          order?.product?.variations?.color_name
                        )}
                      />
                      <DetailItem
                        label="Size"
                        value={order?.product?.variations?.size}
                      />
                      <DetailItem
                        label="SKU"
                        value={order?.product?.variations.sku || "N/A"}
                      />
                    </>
                  )}
                  {order.product.images?.length > 0 && (
                    <div className="col-span-2 md:col-span-3">
                      <img
                        src={order.product.images[0]}
                        alt={order.product.name}
                        className="w-full h-auto object-cover rounded-md"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </Section>

          {/* Price Breakdown */}
          <Section title="Price Breakdown">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <DetailItem
                label="Base Price"
                value={formatPrice(order?.price)}
              />
              <DetailItem label="Tax" value={formatPrice(order?.tax)} />
              <DetailItem
                label="Shipping Charges"
                value={formatPrice(order?.shipping_charges)}
              />
              <DetailItem
                label="Discount"
                value={formatPrice(order?.product_discount_amount)}
              />
              <DetailItem
                label="Total Amount"
                value={formatPrice(order?.order_total)}
              />
              {order?.coupon && (
                <DetailItem label="Applied Coupon" value={order?.coupon_id} />
              )}
            </div>
          </Section>

          {/* Tracking & Status Update Form */}
          <form onSubmit={handleSubmit}>
            <Section title="Update Order Status & Tracking">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Order Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Status *
                  </label>
                  <select
                    name="order_status"
                    value={formData.order_status}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Status</option>
                    {orderStatusOptions.map((status, index) => (
                      <option key={index} value={status}>
                        {setToUpperChars(status)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Courier Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Courier Name
                  </label>
                  <input
                    type="text"
                    name="courier_name"
                    value={formData.courier_name}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. FedEx, DTDC, Delhivery"
                  />
                </div>

                {/* Tracking ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tracking ID
                  </label>
                  <input
                    type="text"
                    name="tracking_id"
                    value={formData.tracking_id}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter tracking number"
                  />
                </div>

                {/* Tracking URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tracking URL
                  </label>
                  <input
                    type="url"
                    name="tracking_url"
                    value={formData.tracking_url}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/track/..."
                  />
                </div>
              </div>

              {/* Vendor Comment */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor Comment
                </label>
                <textarea
                  name="vendor_comment"
                  value={formData.vendor_comment}
                  onChange={handleChange}
                  rows="3"
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any notes or comments about this order..."
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Updating..." : "Update Order"}
                </button>
              </div>
            </Section>
          </form>

          {/* Display Current Tracking Information if available */}
          {(order?.tracking_id ||
            order?.tracking_url ||
            order?.courier_name) && (
            <Section title="Current Tracking Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {order?.courier_name && (
                  <DetailItem label="Courier" value={order.courier_name} />
                )}
                {order?.tracking_id && (
                  <DetailItem label="Tracking ID" value={order.tracking_id} />
                )}
                {order?.tracking_url && (
                  <div>
                    <p className="text-sm text-gray-600">Tracking Link</p>
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      Track Package
                    </a>
                  </div>
                )}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="border rounded-lg p-4">
    <h3 className="text-lg font-medium mb-4">{title}</h3>
    {children}
  </div>
);

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-600">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

export default OrderModal;
