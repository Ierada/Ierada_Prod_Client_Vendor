import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getOrderByOrderId } from "../../../services/api.order";

const SharedOrderPage = () => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { orderId } = useParams();

  useEffect(() => {
    fetchOrderData();
  }, [orderId]);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      const response = await getOrderByOrderId(orderId);
      if (response && response.status === 1) {
        setOrderData(response.data);
      }
    } catch (err) {
      setError("Order not found or access denied");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      placed: "bg-blue-100 text-blue-600",
      shipped: "bg-purple-100 text-purple-600",
      intransit: "bg-yellow-100 text-yellow-600",
      delivered: "bg-green-100 text-green-600",
      cancelled: "bg-red-100 text-red-600",
      rejected: "bg-red-100 text-red-600",
      "return pending": "bg-orange-100 text-orange-600",
      returned: "bg-gray-100 text-gray-600",
    };
    return statusColors[status] || "bg-gray-100 text-gray-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
          <p className="text-gray-600">
            Please check the order ID and try again
          </p>
        </div>
      </div>
    );
  }

  if (!orderData) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden"
      >
        <div className="px-6 py-8">
          <div className="border-b pb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Order Details
            </h1>
            <p className="text-sm text-gray-600">
              Order ID: {orderData.orderNumber}
            </p>
          </div>

          <div className="py-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="w-full md:w-2/3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-lg p-6 border"
                >
                  <h2 className="text-lg font-semibold mb-4">
                    Product Information
                  </h2>
                  <div className="flex gap-4">
                    <div className="w-24 h-24">
                      <img
                        src={orderData.products[0]?.images || ""}
                        alt={orderData.products[0]?.productName}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {orderData.products[0]?.productName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Quantity: {orderData.qty}
                      </p>
                      <p className="text-sm text-gray-600">
                        Size:{" "}
                        {orderData.products[0]?.variations?.size?.variation ||
                          "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Color:{" "}
                        {orderData.products[0]?.variations?.color?.variation ||
                          "N/A"}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 bg-white rounded-lg p-6 border"
                >
                  <h2 className="text-lg font-semibold mb-4">Order Status</h2>
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      orderData.order_status
                    )}`}
                  >
                    {orderData.order_status?.charAt(0).toUpperCase() +
                      orderData.order_status?.slice(1)}
                  </div>

                  <div className="mt-6">
                    <div className="relative">
                      {["placed", "shipped", "intransit", "delivered"].map(
                        (status, index) => {
                          const isCompleted =
                            [
                              "placed",
                              "shipped",
                              "intransit",
                              "delivered",
                            ].indexOf(orderData.order_status) >= index;
                          const isCurrent = orderData.order_status === status;

                          return (
                            <div
                              key={status}
                              className="flex items-center mb-8 last:mb-0"
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  isCompleted ? "bg-green-500" : "bg-gray-200"
                                }`}
                              >
                                <span
                                  className={`text-sm ${
                                    isCompleted ? "text-white" : "text-gray-500"
                                  }`}
                                >
                                  {index + 1}
                                </span>
                              </div>
                              <div className="ml-4">
                                <p
                                  className={`font-medium ${
                                    isCurrent
                                      ? "text-green-500"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {status.charAt(0).toUpperCase() +
                                    status.slice(1)}
                                </p>
                                {status === "placed" &&
                                  orderData.created_at && (
                                    <p className="text-sm text-gray-500">
                                      {new Date(
                                        orderData.created_at
                                      ).toLocaleDateString()}
                                    </p>
                                  )}
                                {status === "shipped" &&
                                  orderData.shipped_at && (
                                    <p className="text-sm text-gray-500">
                                      {new Date(
                                        orderData.shipped_at
                                      ).toLocaleDateString()}
                                    </p>
                                  )}
                                {status === "delivered" &&
                                  orderData.delivered_at && (
                                    <p className="text-sm text-gray-500">
                                      {new Date(
                                        orderData.delivered_at
                                      ).toLocaleDateString()}
                                    </p>
                                  )}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full md:w-1/3 bg-white rounded-lg p-6 border"
              >
                <h2 className="text-lg font-semibold mb-4">Price Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price</span>
                    <span>₹{orderData.price}</span>
                  </div>
                  {orderData.product_discount_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-green-600">
                        -₹{orderData.product_discount_amount}
                      </span>
                    </div>
                  )}
                  {orderData.shipping_charges > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span>₹{orderData.shipping_charges}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t">
                    <div className="flex justify-between font-medium">
                      <span>Total Amount</span>
                      <span>₹{orderData.order_total}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SharedOrderPage;
