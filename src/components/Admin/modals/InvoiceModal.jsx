import React, { useState } from "react";

const Modal = ({ isOpen, onClose, data, onApprove }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-lg">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-800">View Details</h3>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            <strong>Brand:</strong> {data.brand || "N/A"}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Amount Without GST:</strong>{" "}
            {data.total_without_gst || "N/A"}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Amount With GST:</strong> {data.total_with_gst || "N/A"}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Bill From:</strong> {data.bill_date_from || "N/A"}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Bill To:</strong> {data.bill_date_to || "N/A"}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Status:</strong> {data.payment_status || "N/A"}
          </p>
        </div>
        <div className="px-6 py-4 border-t flex justify-end">
          {data.payment_status === "Pending" && (
            <button
              onClick={onApprove}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Approve
            </button>
          )}
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 ml-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState("Bills");
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = (data) => {
    setModalData(data);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalData(null);
    setModalOpen(false);
  };

  const approveAction = () => {
    alert("Approved!");
    closeModal();
  };

  const invoices = [
    {
      id: 1,
      brand: "Brand A",
      total_without_gst: "1000",
      total_with_gst: "1180",
      bill_date_from: "2024-01-01",
      bill_date_to: "2024-01-31",
      payment_status: "Pending",
    },
    // Add more data as needed
  ];

  return (
    <div className="p-6">
      <div className="flex flex-wrap sm:flex-nowrap border-b mb-6">
        {["Bills", "Invoices", "Pending for approval"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab
                ? "text-[#333843] border-b-2 border-[#333843] font-semibold"
                : "text-gray-500"
            } sm:flex-1 text-center`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Pending for approval" && (
        <div className="bg-white rounded-lg overflow-x-auto shadow-sm border border-gray-200">
          <table className="w-full">
            <thead className="bg-[#F8F8F8]">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#4A5154] border-b">
                  Brand
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#4A5154] border-b">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-100">
                  <td className="px-4 py-4 text-sm text-[#4A5154] border-b">
                    {invoice.brand}
                  </td>
                  <td className="px-4 py-4 text-sm text-[#4A5154] border-b">
                    <button
                      onClick={() => openModal(invoice)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        data={modalData}
        onApprove={approveAction}
      />
    </div>
  );
};

export default App;
