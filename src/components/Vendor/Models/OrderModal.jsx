import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import {
  formatDate,
  formatTime,
} from "../../../utils/date&Time/dateAndTimeFormatter";
import { updateOrderStatus } from "../../../services/api.order";
import { notifyOnFail } from "../../../utils/notification/toast";

const OrderModal = ({ isOpen, onClose, order, onOrderUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    order_status: "",
    tracking_id: "",
    tracking_url: "",
    courier_name: "",
    vendor_comment: "",
  });

  if (!isOpen || !order) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setFormData({
      order_status: "shipped",
      tracking_id: order.tracking_id || "",
      tracking_url: order.tracking_url || "",
      courier_name: order.courier_name || "",
      vendor_comment: order.vendor_comment || "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await updateOrderStatus(order.id, formData);

      if (response.status === 1) {
        if (onOrderUpdate) {
          onOrderUpdate({ ...order, ...formData });
          setIsEditing(false);
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

  const canUpdateToShipped =
    order.order_status === "placed" || order.order_status === "pending";

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
              <DetailItem label="Order ID" value={order.order_number} />
              <DetailItem
                label="Order Date"
                value={`${formatDate(order.created_at)} ${formatTime(
                  order.created_at
                )}`}
              />
              <DetailItem
                label="Order Status"
                value={setToUpperChars(order.order_status)}
              />
              <DetailItem
                label="Payment Status"
                value={setToUpperChars(order.payment_type)}
              />
              <DetailItem
                label="Payment ID"
                value={order.payment_id || "N/A"}
              />
            </div>
          </Section>

          {/* Shipping Address */}
          <Section title="Shipping Address">
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

          {/* Billing Address */}
          {order?.BillingAddress ? (
            <Section title="Billing Address">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <DetailItem
                  label="Customer Name"
                  value={`${order?.BillingAddress?.first_name} ${order?.BillingAddress?.last_name}`}
                />
                <DetailItem
                  label="Phone"
                  value={formatPhone(order?.BillingAddress?.phone)}
                />
                <DetailItem
                  label="Email"
                  value={order?.BillingAddress?.email}
                />
                <DetailItem
                  label="Address"
                  value={order?.BillingAddress?.street_address || "N/A"}
                />
                <DetailItem label="City" value={order?.BillingAddress?.city} />
                <DetailItem
                  label="State"
                  value={order?.BillingAddress?.state}
                />
                <DetailItem
                  label="ZIP Code"
                  value={order?.BillingAddress?.zip || "N/A"}
                />
              </div>
            </Section>
          ) : null}

          {/* Product Details */}
          <Section title="Product Details">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <DetailItem label="Quantity" value={order.qty} />
              {order.product && (
                <>
                  <DetailItem
                    label="Product"
                    value={setToUpperChars(order.product.name)}
                  />
                  {order.product.variations && (
                    <>
                      {" "}
                      <DetailItem
                        label="Color"
                        value={setToUpperChars(
                          order.product.variations.color_name
                        )}
                      />
                      <DetailItem
                        label="Size"
                        value={order.product.variations.size}
                      />
                      <DetailItem
                        label="SKU"
                        value={order.product.variations.sku || "N/A"}
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
              <DetailItem label="Base Price" value={formatPrice(order.price)} />
              <DetailItem label="Tax" value={formatPrice(order.tax)} />
              <DetailItem
                label="Shipping Charges"
                value={formatPrice(order.shipping_charges)}
              />
              <DetailItem
                label="Discount"
                value={formatPrice(order.product.total_discount)}
              />
              <DetailItem
                label="Total Amount"
                value={formatPrice(order.order_total)}
              />
              {order.coupon && (
                <DetailItem
                  label="Applied Coupon"
                  value={order.coupon.coupon_name}
                />
              )}
            </div>
          </Section>

          {/* Display Current Tracking Information if available */}
          {(order.tracking_id || order.tracking_url || order.courier_name) && (
            <Section title="Tracking Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {order.courier_name && (
                  <DetailItem label="Courier" value={order.courier_name} />
                )}
                {order.tracking_id && (
                  <DetailItem label="Tracking ID" value={order.tracking_id} />
                )}
                {order.tracking_url && (
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
                {order.vendor_comment && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Vendor Notes</p>
                    <p className="font-medium">{order.vendor_comment}</p>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Order Status Update Form */}
          {!isEditing && canUpdateToShipped && (
            <div className="mt-6">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Mark as Shipped
              </button>
            </div>
          )}

          {isEditing && (
            <form onSubmit={handleSubmit}>
              <Section title="Update Order Status">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Hidden Order Status - Always "shipped" for vendors */}
                  <input
                    type="hidden"
                    name="order_status"
                    value={formData.order_status}
                  />

                  {/* Courier Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Courier Name *
                    </label>
                    <input
                      type="text"
                      name="courier_name"
                      value={formData.courier_name}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. FedEx, DTDC, Delhivery"
                      required
                    />
                  </div>

                  {/* Tracking ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tracking ID *
                    </label>
                    <input
                      type="text"
                      name="tracking_id"
                      value={formData.tracking_id}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter tracking number"
                      required
                    />
                  </div>

                  {/* Tracking URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tracking URL *
                    </label>
                    <input
                      type="url"
                      name="tracking_url"
                      value={formData.tracking_url}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/track/..."
                      required
                    />
                  </div>
                </div>

                {/* Vendor Comment */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shipping Notes
                  </label>
                  <textarea
                    name="vendor_comment"
                    value={formData.vendor_comment}
                    onChange={handleChange}
                    rows="3"
                    className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any notes about shipping or delivery..."
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {loading ? "Updating..." : "Mark as Shipped"}
                  </button>
                </div>
              </Section>
            </form>
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
