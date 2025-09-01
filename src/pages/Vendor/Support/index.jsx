import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { RxDashboard } from "react-icons/rx";
import { IoMdArrowForward } from "react-icons/io";
import { useAppContext } from "../../../context/AppContext";
import { createTicket, getTickets } from "../../../services/api.ticket";


const SupportPage = () => {
  // Form state
  const [selectedIssue, setSelectedIssue] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [complaintHistory, setComplaintHistory] = useState([]);
    const { user } = useAppContext();
  

  
  const userId = user.id;

  const issueTypes = [
    "Product problem",
    "Shipping delay",
    "Return/Refund",
    "Order Issue",
    "Payment issue",
    "Technical Support",
    "Other",
  ];

  const fetchComplaints = async () => {
    try {
      const response = await getTickets(user.id);
      if (!response.status === 1) {
        throw new Error("Failed to fetch complaint history");
      }      
      // Assuming the API response returns tickets in a "data" field
      setComplaintHistory(response);
    } catch (error) {
      console.error("Error fetching complaint history:", error);
    }
  };

  // Fetch complaint history on component mount
  useEffect(() => {

    fetchComplaints();
  }, [userId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const ticketData = {
      category: selectedIssue,
      subject: selectedIssue,
      description: message,
      attachment: file ? [file] : [],
    };
  
    try {
      const response = await createTicket(user.id, ticketData);
  
      if (!response) {
        throw new Error("Failed to submit ticket");
      }
  
      fetchComplaints();
  
      // Reset form fields
      setSelectedIssue("");
      setMessage("");
      setFile(null);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  

  return (
    <main>
      <section className="space-y-8 p-4 md:p-6 lg:p-8">
        <h2 className="text-2xl font-semibold mb-6">Support</h2>
        <div className="flex flex-col md:flex-row gap-12 justify-around">
          <div className="w-full">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <RxDashboard />
                </div>
                <select
                  value={selectedIssue}
                  onChange={(e) => setSelectedIssue(e.target.value)}
                  className="w-full p-3 pl-10 bg-white border border-gray-300 rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-gray-500"
                  required
                >
                  <option value="">Select Complain Ticket Type</option>
                  {issueTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message Input */}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here"
                className="w-full p-3 min-h-[200px] bg-white border bg-[#56594E40] border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                required
              />

              {/* File Upload */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Media Files</p>
                <label className="flex w-full items-center cursor-pointer">
                  <span className="bg-[#0164CE] text-white px-4 py-2 rounded-l-lg">
                    Choose File
                  </span>
                  <span className="bg-gray-200 px-4 py-2 flex-grow rounded-r-lg truncate">
                    {file ? file.name : "No file chosen"}
                  </span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="w-full bg-[#0164CE] text-white px-6 py-3 rounded-lg flex text-center justify-center items-center gap-2"
                >
                  Submit Ticket
                  <IoMdArrowForward />
                </button>
              </div>
            </form>
          </div>
          {/* Complaints History Button */}
          <div className="w-full items-center flex cursor-pointer transition-colors gap-4 flex-col">
            <div className="bg-white p-6 flex flex-col items-center rounded-lg">
              <div onClick={() => setIsModalOpen(true)} className="mb-2">
                <svg
                  className="w-10 h-10 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="text-lg font-medium">My Complaints History</span>
            </div>
          </div>
        </div>
      </section>

      {/* Complaints History Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Complaints History</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {complaintHistory?.map((complaint) => (
                  <div key={complaint.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{complaint.category}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          complaint.status === "Resolved"
                            ? "bg-green-100 text-green-800"
                            : complaint.status === "In Progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {complaint.status}
                      </span>
                    </div>
                    <p className="text-gray-700">{complaint.description}</p>
                    <p className="text-sm text-gray-600 italic">
                      Response: {complaint.response || "No response yet"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default SupportPage;
