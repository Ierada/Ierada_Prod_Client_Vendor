import React, { useState, useEffect } from "react";
import { FaEnvelope, FaClock } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { MdPhoneAndroid } from "react-icons/md";
import { IoMdCart } from "react-icons/io";
import { FaDownload, FaToolbox } from "react-icons/fa6";
import { MdLocationPin } from "react-icons/md";
import { MdEmail } from "react-icons/md";
import { getAllTickets, addReply } from "../../../services/api.ticket";

const TicketCard = ({ ticket, setSelectedVendor }) => (
  <div className="p-4 bg-white border rounded-lg shadow-md">
    <div className="flex flex-wrap md:flex-nowrap items-center justify-between">
      {/* Left section (Ticket ID, Status, and Priority) */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        <span
          className={`inline-block rounded-full ${getStatusColor(
            ticket.status
          )} h-2 w-3  md:h-3 md:w-3`}
        ></span>
        <h3 className="font-semibold text-xs md:text-base text-[#2E2C34]">{`Ticket# ${ticket.id}`}</h3>
        {ticket.status === "New" && (
          <span className="ml-2 px-4 py-1 text-xs rounded-2xl text-green-500 bg-green-100">
            New
          </span>
        )}
        {ticket.status === "Escalation1" && (
          <span className="ml-2 px-4 py-1 text-xs rounded-2xl text-red-500 bg-red-100">
            Escalation 1
          </span>
        )}
        {ticket.status === "Escalation2" && (
          <span className="ml-2 px-4 py-1 text-xs rounded-2xl text-red-500 bg-red-100">
            Escalation 2
          </span>
        )}
        {(ticket.status === "In Progress" || ticket.status === "Ongoing") && (
          <span className="ml-2 px-4 py-1 text-xs rounded-2xl text-yellow-500 bg-yellow-100">
            Ongoing
          </span>
        )}
        {ticket.status === "Resolved" && (
          <span className=" ml-2 px-4 py-1 text-xs rounded-2xl text-gray-500 bg-gray-100">
            Resolved
          </span>
        )}
      </div>
      {/* Right section (Posted time) */}
      <span className="text-xs  text-[#84818A] mt-2 md:mt-0">
        {" "}
        {`Posted at ${new Date(ticket.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}`}
      </span>{" "}
    </div>

    {/* Title and Description */}
    <p className="mt-2 font-medium text-gray-900">{ticket.subject}</p>
    <p className="mt-1 text-xs text-[#84818A]">{ticket.description}</p>

    {/* Bottom section (User and Open Ticket button) */}
    <div className="mt-3 flex flex-wrap md:flex-nowrap items-center justify-between border-t pt-3">
      <div className="flex items-center gap-2 w-full md:w-auto">
        <img
          src={ticket?.user?.vendorDetails?.avatar}
          alt="avatar"
          className="h-8 w-8 rounded-full"
        />
        <span className="text-sm font-medium text-gray-700">
          {ticket?.user?.vendorDetails?.first_name}{" "}
          {ticket?.user?.vendorDetails?.last_name}
        </span>
      </div>
      <button
        onClick={() => setSelectedVendor(ticket)}
        className="text-sm   text-orange-500 hover:underline mt-2 md:mt-0"
      >
        Open Ticket
      </button>
    </div>
  </div>
);

const getStatusColor = (status) => {
  switch (status) {
    case "Resolved":
      return "bg-green-500";
    case "Escalation1":
      return "bg-red-500";
    case "Escalation2":
      return "bg-red-500";
    case "In Progress":
      return "bg-yellow-500";
    case "New":
      return "bg-blue-500";
    default:
      return "bg-gray-400";
  }
};

const VendorDetails = ({ ticket, onClose, handleSubmit }) => {
  const [message, setReplyMessage] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(
    ticket?.status || "In Progress"
  );

  if (!ticket) return null;

  // Check if ticket has replies
  const hasReplies = ticket.replies && ticket.replies.length > 0;

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg  max-w-5xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#333843] mb-4">Tickets</h2>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 ">
            <div className="p-4 bg-white border rounded-lg shadow-md">
              <div className="flex flex-wrap md:flex-nowrap items-center justify-between">
                {/* Left section (Ticket ID, Status, and Priority) */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span
                    className={`h-3 w-3 rounded-full ${getStatusColor(
                      ticket.status
                    )}`}
                  />
                  <h3 className="font-semibold text-xs md:text-base text-[#2E2C34]">
                    {`Ticket# ${ticket.id || "N/A"}`}
                  </h3>
                  {ticket.status === "New" && (
                    <span className="ml-2 px-4 py-1 text-xs rounded-2xl text-green-500 bg-green-100">
                      New
                    </span>
                  )}
                  {ticket.status === "In Progress" && (
                    <span className="ml-2 px-4 py-1 text-xs rounded-2xl text-yellow-500 bg-yellow-100">
                      Ongoing
                    </span>
                  )}
                  {ticket.status === "Escalation1" && (
                    <span className="ml-2 px-4 py-1 text-xs rounded-2xl text-red-500 bg-red-100">
                      Escalation 1
                    </span>
                  )}
                  {ticket.status === "Escalation2" && (
                    <span className="ml-2 px-4 py-1 text-xs rounded-2xl text-red-500 bg-red-100">
                      Escalation 2
                    </span>
                  )}
                  {ticket.status === "Resolved" && (
                    <span className=" ml-2 px-4 py-1 text-xs rounded-2xl text-gray-500 bg-gray-100">
                      Resolved
                    </span>
                  )}
                </div>

                {/* Right section (Posted time) */}
                <span className="text-xs text-[#84818A] mt-2 md:mt-0">
                  {`Posted at ${new Date(ticket.created_at).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    }
                  )}`}
                </span>
              </div>

              {/* Title and Description */}
              <div className="mt-2 flex justify-between items-center">
                <p className="font-medium text-gray-900 md:text-sm text-xs">
                  {ticket.subject || "No title"}
                </p>
                <span className="text-[#5088FF] md:text-sm -mt-2 hidden ">
                  Order ID: {ticket.order_number}
                </span>
              </div>

              <p className="mt-1 text-xs text-[#84818A]">
                {ticket.description || "No description available"}
              </p>

              {/* Attachments */}
              {ticket?.attachment && (
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Attachment</h4>
                  {renderAttachment(ticket.attachment, ticket.attachment_url)}
                </div>
              )}
            </div>

            {/* Ticket Reply History Section */}
            {hasReplies && (
              <div className="mt-4 p-4 bg-white border rounded-lg shadow-md">
                <h3 className="font-semibold text-base text-[#2E2C34] mb-4">
                  Conversation History
                </h3>
                <div className="space-y-4">
                  {ticket.replies?.map((reply, index) => (
                    <div
                      key={reply.id || index}
                      className={`p-3 rounded-lg ${
                        reply.user.adminDetails
                          ? "bg-blue-50 ml-8"
                          : "bg-gray-50 mr-8"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              reply.user.adminDetails
                                ? "bg-blue-100 text-blue-600"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {reply.user.adminDetails ? "A" : "V"}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-sm">
                              {reply.user.adminDetails
                                ? "Admin"
                                : ticket?.user?.vendorDetails?.first_name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(reply.created_at).toLocaleString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {reply.message}
                          </p>
                          {reply.attachment &&
                            renderAttachment(
                              reply.attachment,
                              reply.attachment_url
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 p-4 bg-white border rounded-lg shadow-md">
              <h3 className="font-semibold text-base text-[#2E2C34] mb-4">
                Reply to Ticket
              </h3>

              <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="flex-1">
                  <p className="block text-sm font-medium text-gray-700">
                    <span>Customer Email:</span> {ticket.user.email}
                  </p>
                </div>

                {/* Status Dropdown */}
                <div className="flex-1">
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Status:
                  </label>
                  <select
                    id="status"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Escalation1">Escalation 1</option>
                    <option value="Escalation2">Escalation 2</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
              <form
                className="space-y-4 mt-4"
                onSubmit={(e) =>
                  handleSubmit(e, ticket.id, message, selectedStatus)
                }
              >
                <div>
                  <label
                    htmlFor="reply"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Reply:
                  </label>
                  <textarea
                    id="message"
                    className="mt-1 block w-full p-2 border-gray-100 rounded-lg shadow-sm text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Type your reply here..."
                    rows="4"
                    required
                    value={message}
                    onChange={(e) => setReplyMessage(e.target.value)}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#F47954] text-sm text-white rounded-md hover:bg-[#F47954] focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    Submit Reply
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="md:row-span-2 bg-white border rounded-md shadow-md ">
            <div className="mt-4 flex flex-col items-center relative m-2">
              {/* Half Background */}
              <div className="absolute top-0 left-0 w-full h-1/2  md:h-[160px]  -mt-2  bg-blue-100 rounded-md"></div>

              {/* Customer Avatar */}
              <img
                src={ticket.user?.vendorDetails?.avatar}
                alt="Customer Avatar"
                className=" h-20 w-20 md:h-32 md:w-32 rounded-full relative mt-4 md:mt-8   "
              />

              {/* Customer Name */}
              <h3 className="my-2 font-medium text-[#353535] text-base">
                {ticket.user?.vendorDetails?.first_name}{" "}
                {ticket.user?.vendorDetails?.last_name}
              </h3>

              {/* Active/Inactive Status */}
              <span
                className={`text-sm px-4 py-1 rounded-md ${
                  ticket?.user?.is_active
                    ? "text-blue-600 bg-blue-100"
                    : "text-red-500 bg-red-100"
                }`}
              >
                {ticket.user.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Details */}
            <div className="mt-4 space-y-2 text-sm text-gray-700 border-t pt-4 m-6">
              <div className="flex items-center gap-4 text-center">
                <FaToolbox className="text-gray-500 text-3xl bg-gray-200 p-2 rounded-full" />

                <div className="text-start">
                  <span className="block text-start text-[#667085] text-sm">
                    Vendor ID
                  </span>
                  <span className="font-medium text-[#353535] text-sm">
                    {ticket.user?.vendorDetails?.id}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-center">
                <div className=" p-2 md:w-8 md:h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <MdEmail className="text-gray-500 text-sm md:text-xl" />
                </div>
                <div className="text-start">
                  <span className="block text-start text-[#667085] md:text-sm">
                    E-mail
                  </span>
                  <span className="font-medium text-[#353535] text-sm">
                    {ticket.user.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-center">
                <div>
                  <MdLocationPin className="text-gray-500 text-3xl bg-gray-200 p-1.5 rounded-full " />
                </div>
                <div className="text-start">
                  <span className="block text-start text-[#667085] text-sm">
                    Address
                  </span>
                  <span className="font-medium text-[#353535] text-sm">
                    {ticket.user?.vendorDetails?.address}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-center">
                <MdPhoneAndroid className="text-gray-500 text-3xl bg-gray-200 p-2 rounded-full" />
                <div className="text-start">
                  <span className="block text-start text-[#667085] text-sm">
                    Phone
                  </span>
                  <span className="font-medium text-[#353535] text-sm">
                    {ticket.user.phone}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-center">
                <MdPhoneAndroid className="text-gray-500 text-3xl bg-gray-200 p-2 rounded-full" />
                <div className="text-start">
                  <span className="block text-start text-[#667085] text-sm">
                    DOB
                  </span>
                  <span className="font-medium text-[#353535] text-sm">
                    {ticket.user?.vendorDetails?.dob}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VendorSupport = () => {
  const [tickets, setTicket] = useState([]);
  const [filter, setFilter] = useState("All Tickets");
  const [priority, setPriority] = useState("All");
  const [timeline, setTimeline] = useState("All");
  const [role, setRole] = useState("Vendor");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [filteredTicket, setFilteredTickets] = useState([]);
  const statusMapping = {
    "All Tickets": null,
    New: "New",
    Escalation1: "Escalation1",
    Escalation2: "Escalation2",
    Ongoing: "In Progress",
    Closed: "Closed",
    Resolved: "Resolved",
  };
  const fetchTicketData = async () => {
    const params = {
      status: statusMapping[filter],
      priority: priority === "All" ? null : priority,
      timeline: timeline === "All" ? null : timeline,
      role,
    };

    try {
      const res = await getAllTickets(params);
      if (res && res.data) {
        const fetchedTickets = res.data;
        setTicket(fetchedTickets);
        setFilteredTickets(fetchedTickets);
        applyFilters(fetchedTickets);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  useEffect(() => {
    fetchTicketData();
  }, [filter, role]);

  const applyFilters = (fetchedTickets) => {
    const newFilteredTickets = fetchedTickets.filter((ticket) => {
      const matchesFilter =
        filter === "All Tickets" || ticket.status === filter;
      const matchesPriority =
        priority === "All" || ticket.priority === priority;
      const matchesTimeline =
        timeline === "All" || ticket.timeline === timeline;
      return matchesFilter && matchesPriority && matchesTimeline;
    });

    setFilteredTickets(newFilteredTickets);
  };

  const clearFilters = () => {
    setFilter("All Tickets");
    setPriority("All");
    setTimeline("All");
    handleShowData();
  };

  const handleShowData = () => {
    fetchTicketData();
  };

  const handleSubmit = async (e, ticketId, message, status) => {
    e.preventDefault();

    if (!message) {
      return;
    }

    if (!selectedVendor || !selectedVendor.user || !selectedVendor.user.id) {
      return;
    }

    try {
      const data = {
        ticket_id: ticketId,
        user_id: selectedVendor.user.id,
        message,
        is_admin_reply: true,
        status: status,
      };

      const response = await addReply(data, selectedVendor.user.id);

      if (response && response.status === 1) {
        // Update the local state for the selected vendor to reflect the new status
        setSelectedVendor((prev) => ({
          ...prev,
          status: status,
          replies: [
            ...(prev.replies || []),
            {
              id: Date.now(), // temporary ID until refresh
              user: {
                adminDetails: { id: 1 }, // assuming admin reply
              },
              message: message,
              created_at: new Date().toISOString(),
            },
          ],
        }));

        // Refresh ticket data to get the updated status and replies
        fetchTicketData();
      } else {
        console.error("Unexpected response:", response);
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className=" text-lg md:text-2xl font-bold text-[#333843] mb-4">
          Vendor Support
        </h1>

        {/* Filter Tabs */}
        <div className="flex flex-wrap sm:flex-nowrap border-b mb-6">
          {[
            "All Tickets",
            "New",
            "Ongoing",
            "Escalation1",
            "Escalation2",
            "Resolved",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 font-medium ${
                filter === tab
                  ? "text-[#333843] border-b-2 border-[#333843] font-semibold"
                  : "text-gray-500"
              } sm:flex-1 text-center`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-md px-3 py-4">
          <div className="flex flex-wrap md:flex-nowrap items-center gap-4 mb-3">
            <div className="w-full md:w-auto">
              <label
                htmlFor="priority"
                className="block text-[#333843] font-semibold"
              >
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="px-4 py-2 border border-gray-100 rounded-lg bg-white text-gray-600 w-full"
              >
                <option value="All">Priority</option>
                {["Low", "Medium", "High"].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-auto">
              <label
                htmlFor="timeline"
                className="block text-[#333843] font-semibold"
              >
                Timeline
              </label>
              <select
                id="timeline"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="px-4 py-2 border border-gray-100 rounded-lg bg-white text-gray-600 w-full"
              >
                <option value="All">Timeline</option>
                {["Today", "This Week", "This Month"].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-auto flex mt-5 md:mt-0 gap-3 ml-auto">
              <button
                onClick={clearFilters}
                className=" py-1 md:px-6 md:py-2 bg-gray-300 text-[#4C4C1F] text-sm font-medium rounded-2xl w-full md:w-auto"
              >
                Clear
              </button>
              <button
                onClick={handleShowData}
                className=" py-1 md:px-6 md:py-3 bg-[#F47954] text-sm font-medium text-white rounded-2xl w-full md:w-auto"
              >
                Show Data
              </button>
            </div>
          </div>
        </div>

        {/* Ticket List */}
        <div className="grid my-8 gap-4">
          {filteredTicket.length > 0 ? (
            filteredTicket.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                setSelectedVendor={setSelectedVendor}
              />
            ))
          ) : (
            <p className="text-center text-gray-500">
              No tickets match your filters.
            </p>
          )}
        </div>
      </div>
      {selectedVendor && (
        <VendorDetails
          ticket={selectedVendor}
          onClose={() => setSelectedVendor(null)}
          handleSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default VendorSupport;
