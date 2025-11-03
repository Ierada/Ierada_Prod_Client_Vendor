import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { createTicket, getTickets } from "../../../services/api.ticket";
import CommonTopBanner from "../../../components/Website/CommonTopBanner";
import { AccountInfo } from "../../../components/Website/AccountInfo";
import { RxDashboard } from "react-icons/rx";
import { IoMdArrowForward } from "react-icons/io";
import { FaFileUpload, FaTimes } from "react-icons/fa";
import TicketHistoryModal from "../../../components/Website/TicketHistoryModal";
import CommonBanner from "/assets/banners/Commen-top-banner.png";
import { useAppContext } from "../../../context/AppContext";
import { notifyOnSuccess } from "../../../utils/notification/toast";

const bannerData = [
  {
    id: 1,
    image: CommonBanner,
  },
];

// Updated supportCategories with priority assignments
const supportCategories = [
  {
    id: "Order Issue",
    label: "Order Issue",
    description: "Problems with your order status, delivery, or items received",
    priority: "Medium",
  },
  {
    id: "Product Query",
    label: "Product Query",
    description:
      "Questions about product specifications, availability, or usage",
    priority: "Low",
  },
  {
    id: "Shipping Delay",
    label: "Shipping Delay",
    description: "Concerns about delayed or missing shipments",
    priority: "High",
  },
  {
    id: "Return/Refund",
    label: "Return/Refund",
    description: "Assistance with returns, exchanges, or refund requests",
    priority: "High",
  },
  {
    id: "Payment Issue",
    label: "Payment Issue",
    description: "Problems with payments, transactions, or billing",
    priority: "High",
  },
  {
    id: "Technical Support",
    label: "Technical Support",
    description: "Help with website, account, or app-related issues",
    priority: "Medium",
  },
  {
    id: "Account Related",
    label: "Account Related",
    description: "Questions about your account settings or preferences",
    priority: "Medium",
  },
  {
    id: "Others",
    label: "Others",
    description: "Any other inquiries not covered by the categories above",
    priority: "Low",
  },
];

const Support = () => {
  const { user } = useAppContext();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const selectedCategory = watch("category");
  const selectedPriority =
    supportCategories.find((cat) => cat.id === selectedCategory)?.priority ||
    "Medium";

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const fetchedTickets = await getTickets(user.id);

      setTickets(fetchedTickets || []);
    } catch (error) {
      console.error("Error loading tickets:", error);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = {
        category: data.category,
        subject: data.subject,
        description: data.message,
        order_number: data.order_number || null,
        priority: selectedPriority,
        attachment: selectedFile,
      };

      const result = await createTicket(user.id, formData);
      if (result?.status === 1) {
        reset();
        setSelectedFile(null);
        loadTickets();
        notifyOnSuccess("Ticket created successfully");
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <main className="min-h-screen pb-20">
      {/* <CommonTopBanner bannerData={bannerData} /> */}

      <section className="w-full">
        <div className="text-center my-10 text-[#000000]">
          <h1 className="text-2xl lg:text-4xl font-semibold mb-2 font-Playfair">
            Customer Support
          </h1>
          <p className="text-sm lg:text-base font-Lato font-medium">
            We're here to help. How can we assist you today?
          </p>
        </div>

        <div className="px-4 md:px-5 lg:px-20 flex flex-col md:flex-row gap-10">
          <div className="w-full md:w-1/3 lg:w-1/4">
            <AccountInfo activeSection="support" />
          </div>

          <div className="md:w-4/5 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Category Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {supportCategories.map((category) => (
                    <motion.label
                      key={category.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative flex flex-col p-4 border rounded-lg cursor-pointer hover:border-blue-500 transition-colors
                        ${
                          watch("category") === category.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200"
                        }`}
                    >
                      <input
                        type="radio"
                        value={category.id}
                        className="hidden"
                        {...register("category", {
                          required: "Please select a category",
                        })}
                      />
                      <span className="font-medium text-gray-900">
                        {category.label}
                      </span>
                      <span className="text-sm text-gray-500 mt-1">
                        {category.description}
                      </span>
                      {watch("category") === category.id && (
                        <span
                          className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs ${
                            category.priority === "High"
                              ? "bg-red-100 text-red-700"
                              : category.priority === "Medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {category.priority} Priority
                        </span>
                      )}
                    </motion.label>
                  ))}
                </div>
                {errors.category && (
                  <p className="text-red-500 text-sm">
                    {errors.category.message}
                  </p>
                )}

                {/* Subject Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of your issue"
                    {...register("subject", {
                      required: "Subject is required",
                      minLength: {
                        value: 5,
                        message: "Subject must be at least 5 characters",
                      },
                    })}
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                {/* Order Number Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Number (Optional)
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="If related to an order, enter the order number"
                    {...register("order_number")}
                  />
                </div>

                {/* Message Input (maps to description in backend) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[200px]"
                    placeholder="Please describe your issue in detail"
                    {...register("message", {
                      required: "Description is required",
                      minLength: {
                        value: 20,
                        message: "Description must be at least 20 characters",
                      },
                    })}
                  />
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {/* File Attachment Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachment
                  </label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FaFileUpload className="w-10 h-10 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, PDF up to 10MB
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept=".jpg,.jpeg,.png,.pdf"
                        />
                      </label>
                    </div>

                    {/* File Preview */}
                    <AnimatePresence>
                      {selectedFile && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2"
                        >
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                          >
                            <span className="text-sm text-gray-600 truncate">
                              {selectedFile.name}
                            </span>
                            <button
                              type="button"
                              onClick={removeFile}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FaTimes />
                            </button>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                    className={`
                      flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin">↻</span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Ticket
                        <IoMdArrowForward />
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>

            {/* Ticket History Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6"
            >
              <button
                onClick={() => setShowHistory(true)}
                className="w-full p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <RxDashboard className="text-gray-600 text-xl" />
                  </div>
                  <span className="font-medium text-gray-900">
                    View Ticket History
                  </span>
                </div>
                <IoMdArrowForward className="text-gray-600" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Ticket History Modal */}
      <TicketHistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        tickets={tickets}
      />
    </main>
  );
};

export default Support;
