import React, { useEffect, useState } from "react";
import {
  Eye,
  CheckCircle,
  XCircle,
  MapPin,
  X,
  Check,
  Ban,
  AlertCircle,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  updateVendorStatus,
  getVendorById,
} from "../../../services/api.vendor";
import {
  getProductsByVendorId,
  updateProductVisibility,
} from "../../../services/api.product";
import { adminVerifyBank, getBankHistory } from "../../../services/api.kyc";
import ProductModal from "../../../components/Vendor/Models/ProductModal";
import { AiOutlineMail } from "react-icons/ai";
import { CiLocationOn } from "react-icons/ci";
import { IoFlagOutline } from "react-icons/io5";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import DefaultProfile from "/assets/user/person-circle.png";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "verified":
        return {
          bg: "bg-green-100",
          text: "text-green-600",
          icon: <Check className="w-4 h-4" />,
          label: status.charAt(0).toUpperCase() + status.slice(1),
        };
      case "pending":
        return {
          bg: "bg-blue-100",
          text: "text-blue-600",
          icon: <AlertCircle className="w-4 h-4" />,
          label: "Pending",
        };
      case "rejected":
      case "failed":
        return {
          bg: "bg-red-100",
          text: "text-red-600",
          icon: <X className="w-4 h-4" />,
          label: status.charAt(0).toUpperCase() + status.slice(1),
        };
      case "blocked":
        return {
          bg: "bg-red-100",
          text: "text-red-600",
          icon: <Ban className="w-4 h-4" />,
          label: "Blocked",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-600",
          icon: null,
          label: status,
        };
    }
  };

  const config = getStatusConfig();
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${config.bg} ${config.text}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[...Array(5)].map((_, idx) => (
      <div key={idx} className="h-16 bg-gray-100 rounded" />
    ))}
  </div>
);

const EmptyState = ({ message }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <Package className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900">No Data Found</h3>
    <p className="text-gray-500 mt-2">{message}</p>
  </div>
);

const ProductsTable = ({ products, onStatusChange, isLoading }) => {
  if (isLoading) return <LoadingSkeleton />;
  if (!products?.length)
    return <EmptyState message="This vendor hasn't added any products yet." />;

  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const openModal = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              SL
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              Product Name
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              Category
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              Sub Category
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              Status
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              Price
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              Stock
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product, index) => (
            <motion.tr
              key={product.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {product.name}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {product.Category?.title}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {product.SubCategory?.title}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <button
                    onClick={() =>
                      onStatusChange(product.id, product.visibility)
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      product.visibility === "Published"
                        ? "bg-green-500"
                        : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        product.visibility === "Published"
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                <p className="line-through">₹{product.original_price}</p>
                <p className="">₹{product.discounted_price}</p>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {product.stock}
              </td>
              <td className="px-4 py-3">
                <button
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => openModal(product)}
                >
                  <Eye className="w-4 h-4" />
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      <ProductModal
        isOpen={showModal}
        onClose={closeModal}
        product={selectedProduct}
      />
    </div>
  );
};

const BankHistoryTable = ({ bankHistory, onVerify, isLoading }) => {
  if (isLoading) return <LoadingSkeleton />;
  if (!bankHistory?.length)
    return <EmptyState message="No bank history available for this vendor." />;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              SL
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              Bank Name
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              Account Number
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              IFSC Code
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              Name at Bank
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              Status
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              Created At
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bankHistory.map((record, index) => (
            <motion.tr
              key={record.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {record.bank_name}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {record.account_number}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {record.ifsc_code}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {record.name_at_bank}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={record.status} />
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {new Date(record.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                {record.status === "pending" && (
                  <button
                    onClick={() => onVerify(record.id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Verify
                  </button>
                )}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const VendorDetails = ({ vendorId, onClose, changeStatus }) => {
  const [vendor, setVendor] = useState(null);
  const [activeTab, setActiveTab] = useState("VendorDetail");
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState({
    title: "",
    message: "",
    action: null,
  });
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [bankHistory, setBankHistory] = useState([]);
  const [bankHistoryLoading, setBankHistoryLoading] = useState(false);

  const fetchVendorDetails = async () => {
    try {
      const response = await getVendorById(vendorId);
      if (response.status === 1) {
        setVendor(response.data);
      }
    } catch (error) {
      console.error("Error fetching vendor:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendorId) {
      fetchVendorDetails();
    }
  }, [vendorId]);

  const fetchProducts = async () => {
    if (!vendor?.id) return;

    setProductsLoading(true);
    try {
      const response = await getProductsByVendorId(vendor.id);
      if (response.status === 1) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchBankHistory = async () => {
    if (!vendor?.id) return;

    setBankHistoryLoading(true);
    try {
      const response = await getBankHistory(vendor.id);
      if (response.status === 1) {
        setBankHistory(response.data);
      }
    } catch (error) {
      console.error("Error fetching bank history:", error);
      setBankHistory([]);
    } finally {
      setBankHistoryLoading(false);
    }
  };

  const handleTabChange = async (tab) => {
    setActiveTab(tab);

    if (tab === "Product") {
      await fetchProducts();
    } else if (tab === "BankHistory") {
      await fetchBankHistory();
    }
  };

  const handleStatusChange = async (status) => {
    const messages = {
      approved: {
        title: "Approve Vendor",
        message: "Are you sure you want to approve this vendor?",
      },
      rejected: {
        title: "Reject Vendor",
        message: "Are you sure you want to reject this vendor?",
      },
      blocked: {
        title: "Block Vendor",
        message: "Are you sure you want to block this vendor?",
      },
    };

    setConfirmationData({
      title: messages[status].title,
      message: messages[status].message,
      action: async () => {
        try {
          const response = await updateVendorStatus(vendor.id, { status });
          if (response.status === 1) {
            const updatedActiveState = status === "approved";
            setVendor({ ...vendor, status, is_active: updatedActiveState });
            changeStatus();
          }
        } catch (error) {
          console.error("Failed to update vendor status:", error);
        }
        setShowConfirmation(false);
      },
    });
    setShowConfirmation(true);
  };

  const handleBankVerify = async (bankHistoryId) => {
    setConfirmationData({
      title: "Verify Bank Details",
      message: "Are you sure you want to verify these bank details?",
      action: async () => {
        try {
          const response = await adminVerifyBank({
            bank_history_id: bankHistoryId,
          });
          if (response.status === 1) {
            await fetchVendorDetails();
            await fetchBankHistory();
          }
        } catch (error) {
          console.error("Failed to verify bank details:", error);
        }
        setShowConfirmation(false);
      },
    });
    setShowConfirmation(true);
  };

  const renderStatusButtons = (status) => {
    switch (status) {
      case "pending":
        return (
          <div className="space-y-3">
            <button
              onClick={() => handleStatusChange("approved")}
              className="w-full bg-[#F47954] text-white py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Approve Vendor
            </button>
            <button
              onClick={() => handleStatusChange("rejected")}
              className="w-full bg-[#FF5959] text-white py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Reject Vendor
            </button>
          </div>
        );
      case "approved":
        return (
          <button
            onClick={() => handleStatusChange("blocked")}
            className="w-full bg-[#FF5959] text-red-600 py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <Ban className="w-4 h-4" />
            Block Vendor
          </button>
        );
      case "blocked":
        return (
          <button
            onClick={() => handleStatusChange("approved")}
            className="w-full bg-[#939699] text-green-600 py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Unblock Vendor
          </button>
        );
      case "rejected":
        return (
          <button
            onClick={() => handleStatusChange("approved")}
            className="w-full bg-[#F47954] text-white py-2 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Approve Vendor
          </button>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-4"></div>
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`px-6 py-3 ${
              activeTab === "VendorDetail"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => handleTabChange("VendorDetail")}
          >
            Brand Details
          </button>
          <button
            className={`px-6 py-3 ${
              activeTab === "Product"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => handleTabChange("Product")}
          >
            Products
          </button>
          <button
            className={`px-6 py-3 ${
              activeTab === "BankHistory"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => handleTabChange("BankHistory")}
          >
            Bank History
          </button>
        </div>

        {/* Content */}
        <div
          className="p-6 overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 180px)" }}
        >
          <AnimatePresence mode="wait">
            {activeTab === "VendorDetail" ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {/* Left Column */}
                <div>
                  <h3 className="text-lg text-[#333843] font-semibold mb-4">
                    Brand Details
                  </h3>
                  <div className="border shadow-md p-4 rounded-lg bg-white">
                    <div className="space-y-4 ">
                      <div className="flex justify-center">
                        <img
                          src={vendor?.vendor?.avatar || DefaultProfile}
                          alt="Vendor"
                          className="w-30 h-30 rounded-full object-cover"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-[#333843] font-semibold text-lg -my-3">{`${vendor?.vendor?.shop_name} `}</p>
                      </div>

                      <div className="text-center">
                        <StatusBadge status={vendor?.status} />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <HiOutlineBuildingOffice2 className="text-xl text-[#00000040]" />
                          <p className="text-[#00000040]">{`${vendor?.vendor?.first_name} ${vendor?.vendor?.last_name}`}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <CiLocationOn className="text-xl text-[#00000040]" />
                          <p className="text-[#00000040]">
                            {vendor?.vendor?.address}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <IoFlagOutline className="text-xl text-[#00000040]" />
                          <p className="text-[#00000040]">
                            {vendor?.vendor?.shop_city}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <AiOutlineMail className="text-xl text-[#00000040]" />
                          <p className="text-[#00000040]">{vendor?.email}</p>
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="flex items-center justify-between mb-4"></div>
                        {renderStatusButtons(vendor?.status)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border shadow-md p-8 rounded-lg bg-white md:mt-10 md:mb-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                    {[
                      { label: "Shop Name", value: vendor?.vendor?.shop_name },
                      { label: "Shop GST", value: vendor?.vendor?.gstin },
                      {
                        label: "Vendor Aadhaar Card",
                        value: vendor?.vendor?.aadhaar_number,
                      },
                      {
                        label: "Company PAN",
                        value: vendor?.vendor?.pan_number,
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col justify-between "
                      >
                        <label className="text-[#00000040] font-medium">
                          {item.label}
                        </label>
                        <p className="text-[#333843]">{item.value || "N/A"}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mt-8 mb-4 text-[#333843]">
                    Bank Details
                  </h3>
                  <div>
                    <label className="text-[#00000040]">Bank Name</label>
                    <p className="text-[#333843]">
                      {vendor?.vendor?.bank?.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-[#00000040]">Account Number</label>
                    <p className="text-[#333843]">
                      {vendor?.vendor?.bank?.account}
                    </p>
                  </div>
                  <div>
                    <label className="text-[#00000040]">IFSC Code</label>
                    <p className="text-[#333843]">
                      {vendor?.vendor?.bank?.ifsc}
                    </p>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-4 text-[#333843]">
                    Company Documents
                  </h3>
                  <div className="bg-[#FFA3A3] p-4 rounded-md">
                    <h2 className="text-white font-semibold text-xl mb-4">
                      Documents
                    </h2>

                    <div className="space-y-4">
                      {vendor?.vendor?.documents?.gstFile && (
                        <div className="p-3   flex items-center space-x-3 ">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium text-[#353535]">
                              Company GST Certificate
                            </p>
                            <a
                              href={vendor.vendor.documents.gstFile}
                              target="_blank"
                              className="text-white text-sm hover:underline"
                            >
                              Click to See
                            </a>
                          </div>
                        </div>
                      )}

                      {vendor?.vendor?.documents?.adhaarCardFile && (
                        <div className="p-3   flex items-center space-x-3 ">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium text-[#353535]">
                              Aadhaar Card
                            </p>
                            <a
                              href={vendor.vendor.documents.adhaarCardFile}
                              target="_blank"
                              className="text-white text-sm hover:underline"
                            >
                              Click to See
                            </a>
                          </div>
                        </div>
                      )}

                      {vendor?.vendor?.documents?.panCardFile && (
                        <div className="p-3 flex items-center space-x-3 ">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium text-[#353535]">
                              PAN Card
                            </p>
                            <a
                              href={vendor.vendor.documents.panCardFile}
                              target="_blank"
                              className="text-white text-sm hover:underline"
                            >
                              Click to See
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : activeTab === "Product" ? (
              <motion.div
                key="products"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ProductsTable
                  vendorId={vendorId}
                  products={products}
                  onStatusChange={handleProductStatusChange}
                  isLoading={productsLoading}
                />
              </motion.div>
            ) : (
              <motion.div
                key="bankHistory"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <BankHistoryTable
                  bankHistory={bankHistory}
                  onVerify={handleBankVerify}
                  isLoading={bankHistoryLoading}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={confirmationData.action}
          title={confirmationData.title}
          message={confirmationData.message}
        />
      </motion.div>
    </div>
  );
};

export default VendorDetails;
