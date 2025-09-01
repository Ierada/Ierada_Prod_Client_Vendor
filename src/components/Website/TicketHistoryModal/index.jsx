import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { FaCircle, FaDownload } from "react-icons/fa";
import { format } from "date-fns";

// Constants aligned with backend ENUM values
const STATUS_COLORS = {
  New: "text-yellow-500",
  Open: "text-blue-500",
  "In Progress": "text-purple-500",
  Resolved: "text-green-500",
  Closed: "text-gray-500",
};

const PRIORITY_COLORS = {
  Low: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-red-100 text-red-800",
};

const CATEGORIES = [
  "Order Issue",
  "Product Query",
  "Shipping Delay",
  "Return/Refund",
  "Payment Issue",
  "Technical Support",
  "Account Related",
  "Others",
];

export default function TicketHistoryModal({ isOpen, onClose, tickets }) {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");

  const filteredTickets = tickets?.filter((ticket) => {
    const statusMatch =
      filterStatus === "All" || ticket.status === filterStatus;
    const priorityMatch =
      filterPriority === "All" || ticket.priority === filterPriority;
    const categoryMatch =
      filterCategory === "All" || ticket.category === filterCategory;
    return statusMatch && priorityMatch && categoryMatch;
  });

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
  };

  const renderAttachment = (attachment, attachment_url) => {
    if (!attachment) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600 truncate">{attachment}</span>
          <button
            className="text-blue-600 hover:text-blue-700"
            onClick={() => window.open(attachment_url, "_blank")}
          >
            <FaDownload />
          </button>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">
                Ticket History
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <IoMdClose className="text-gray-500 text-xl" />
              </button>
            </div>

            {/* Filters */}
            <div className="p-4 border-b bg-gray-50 flex flex-wrap gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Status</option>
                {Object.keys(STATUS_COLORS).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Priority</option>
                {Object.keys(PRIORITY_COLORS).map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Modal Content */}
            <div className="flex h-[calc(90vh-200px)]">
              {/* Tickets List */}
              <div className="w-1/3 border-r overflow-y-auto">
                {filteredTickets?.map((ticket) => (
                  <motion.div
                    key={ticket.id}
                    whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                    className={`p-4 border-b cursor-pointer transition-colors ${
                      selectedTicket?.id === ticket.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => handleTicketClick(ticket)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        #{ticket.ticket_number}
                      </span>
                      <span
                        className={`text-sm ${STATUS_COLORS[ticket.status]}`}
                      >
                        <FaCircle className="inline mr-1 text-xs" />
                        {ticket.status}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1 truncate">
                      {ticket.subject}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          PRIORITY_COLORS[ticket.priority]
                        }`}
                      >
                        {ticket.priority}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(ticket.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Ticket Details */}
              <div className="flex-1 overflow-y-auto">
                {selectedTicket ? (
                  <div className="p-6">
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-2">
                        {selectedTicket.subject}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span>Category: {selectedTicket.category}</span>
                        {selectedTicket.order_number && (
                          <span>Order: #{selectedTicket.order_number}</span>
                        )}
                        <span>Status: {selectedTicket.status}</span>
                        <span
                          className={`px-2 py-1 rounded-full ${
                            PRIORITY_COLORS[selectedTicket.priority]
                          }`}
                        >
                          {selectedTicket.priority} Priority
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedTicket.description}
                      </p>
                    </div>

                    {/* Attachments */}
                    {selectedTicket?.attachment && (
                      <div className="mb-6">
                        <h4 className="font-medium mb-2">Attachment</h4>
                        {renderAttachment(
                          selectedTicket.attachment,
                          selectedTicket.attachment_url
                        )}
                      </div>
                    )}

                    {/* Replies */}
                    {selectedTicket.replies?.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium">Conversation History</h4>
                        {selectedTicket.replies?.map((reply) => (
                          <motion.div
                            key={reply.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-lg ${
                              reply.is_admin_reply
                                ? "bg-blue-50 ml-8"
                                : "bg-gray-50 mr-8"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <img
                                src={
                                  reply.User?.avatar || "/api/placeholder/32/32"
                                }
                                alt={reply.User?.name || "User"}
                                className="w-6 h-6 rounded-full"
                              />
                              <span className="font-medium">
                                {reply.User?.name || "Unknown User"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {format(
                                  new Date(reply.created_at),
                                  "MMM d, yyyy h:mm a"
                                )}
                              </span>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">
                              {reply.message}
                            </p>
                            {reply.attachment &&
                              renderAttachment(
                                reply.attachment,
                                reply.attachment_url
                              )}{" "}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    Select a ticket to view details
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
