import React from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Package,
  Clock,
  User,
  Mail,
  Phone,
  Filter,
} from "lucide-react";

const CustomerDetails = ({ customer, onClose }) => {
  if (!customer) {
    return null;
  }

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  const orderStats = [
    {
      icon: Package,
      label: "Total Orders",
      value: customer.totalOrders || "0",
      bgColor: "bg-[#FFF9F0]",
      iconBg: "bg-[#FFE7BA]",
      iconColor: "text-[#FF9F2D]",
    },
    {
      icon: Package,
      label: "Returned Order",
      value: customer.returnedOrders || "0",
      bgColor: "bg-[#FFF9F0]",
      iconBg: "bg-[#FFE7BA]",
      iconColor: "text-[#FF9F2D]",
    },
    {
      icon: Package,
      label: "Canceled Order",
      value: customer.canceledOrders || "0",
      bgColor: "bg-[#FFF9F0]",
      iconBg: "bg-[#FFE7BA]",
      iconColor: "text-[#FF9F2D]",
    },
    {
      icon: Package,
      label: "Replaced Order",
      value: customer.replacedOrders || "0",
      bgColor: "bg-[#FFF9F0]",
      iconBg: "bg-[#FFE7BA]",
      iconColor: "text-[#FF9F2D]",
    },
    {
      icon: Package,
      label: "Abundant Order",
      value: customer.pendingOrders || "0",
      bgColor: "bg-[#FFF9F0]",
      iconBg: "bg-[#FFE7BA]",
      iconColor: "text-[#FF9F2D]",
    },
    {
      icon: Package,
      label: "Wallet Balance",
      value: `₹${customer.balance || "0"}`,
      bgColor: "bg-[#FFF9F0]",
      iconBg: "bg-[#FFE7BA]",
      iconColor: "text-[#FF9F2D]",
    },
  ];

  const customerInfo = [
    {
      icon: User,
      label: "Customer ID",
      value: customer.id
        ? `ID-${customer.id.toString().padStart(6, "0")}`
        : "N/A",
    },
    {
      icon: Mail,
      label: "E-mail",
      value: customer.email,
    },
    {
      icon: MapPin,
      label: "Address",
      value: customer.addresses?.[0]?.full_address || "Not provided",
    },
    {
      icon: Phone,
      label: "Phone Number",
      value: customer.phone ? `+91 ${customer.phone}` : "Not provided",
    },
    {
      icon: Calendar,
      label: "DOB",
      value: formatDate(customer.birthday),
    },
    {
      icon: User,
      label: "Relationship Status",
      value: customer.relationshipStatus || "Not specified",
    },
    {
      icon: Package,
      label: "Last Transaction",
      value: customer.lastTransaction
        ? formatDate(customer.lastTransaction)
        : "No transactions",
    },
    // {
    //   icon: Clock,
    //   label: "Last Online",
    //   value: customer.lastOnline || "1 Day Ago",
    // },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto scrollbar-hide"
      >
        <button
          onClick={onClose}
          className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
        >
          <span className="text-2xl">×</span>
        </button>
        <div className="flex h-full">
          {/* Left Sidebar */}
          <div className="w-80 bg-white p-6 flex flex-col border-r">
            <div className="text-center mb-6">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100">
                {customer.avatar ? (
                  <img
                    src={customer.avatar}
                    alt={customer.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500 text-2xl font-semibold">
                    {customer.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <h2 className="text-xl font-semibold mb-2">{customer.name}</h2>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-600`}
              >
                {customer.status}
              </span>
            </div>

            <div className="space-y-6">
              {customerInfo.map((info, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <info.icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">{info.label}</div>
                    <div className="text-sm font-medium">{info.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {orderStats.map((stat, index) => (
                <div
                  key={index}
                  className={`${stat.bgColor} rounded-lg p-4 flex items-center gap-3`}
                >
                  <div className={`p-2 ${stat.iconBg} rounded`}>
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                    <div className="font-medium text-lg">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-lg shadow">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">Transaction History</h3>
                {/* <div className="flex gap-4">
                  <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
                    <Calendar className="w-4 h-4" />
                    Select Date
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
                    <Filter className="w-4 h-4" />
                    Filters
                  </button>
                </div> */}
              </div>

              {customer.recentTransactions?.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Order ID
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {customer.recentTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-4 py-3 text-sm text-blue-600">
                          {transaction.id}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden">
                              {transaction.image ? (
                                <img
                                  src={transaction.image}
                                  alt={transaction.product}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium">
                                {transaction.product}
                              </div>
                              {transaction.otherProducts && (
                                <div className="text-sm text-gray-500">
                                  {transaction.otherProducts}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {transaction.total}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              transaction.status.toLowerCase() === "delivered"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-orange-100 text-orange-600"
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDate(transaction.date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No transactions found for this customer
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CustomerDetails;
