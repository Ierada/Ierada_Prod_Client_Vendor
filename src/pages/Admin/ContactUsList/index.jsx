import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Filter } from "lucide-react";
import {
  getAllContacts,
  deleteContact,
  createContact,
  updateContact,
} from "../../../services/api.contactusform";
// import ContactUsModal from "../../../components/Admin/modals/ContactUsModal";
import DeleteConfirmationModal from "../../../components/Vendor/Models/DeleteConfirmationModal";

const ContactUsCard = ({ notification, onDelete }) => {
  const getBorderColor = () => {
    return notification.status ? "border-green-500" : "border-red-500";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`border-l-4 ${getBorderColor()} bg-white shadow-md rounded-lg p-4`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg text-gray-900">
              {notification.name}
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium text-gray-800">Email:</span>{" "}
            {notification.email}
          </p>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium text-gray-800">Phone:</span>{" "}
            {notification.phone_number}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-800">Message:</span>{" "}
            {notification.message}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDelete(notification.id)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <Trash2 className="w-5 h-5 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
const ContactUsList = () => {
  const [contacts, setContacts] = useState([]);
  const [readFilter, setReadFilter] = useState("all");
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  //   const [modalMode, setModalMode] = useState("add");
  const [selectedContact, setSelectedContact] = useState(null);
  const [mode, setMode] = useState("add");

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await getAllContacts();
      setContacts(response.data || []);
      setFilteredContacts(response.data || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!contacts || contacts.length === 0) return;
    let filtered = [...contacts];
    if (readFilter === "all") {
      setFilteredContacts(filtered);
    } else if (readFilter === "read") {
      filtered = filtered.filter((contact) => contact.status === true);
      setFilteredContacts(filtered);
    } else if (readFilter === "unread") {
      filtered = filtered.filter((contact) => contact.status === false);
      setFilteredContacts(filtered);
    }
  }, [readFilter, contacts]);

  const handleDeleteContact = async (id) => {
    try {
      await deleteContact(id);
      setContacts(contacts.filter((contact) => contact.id !== id));
      setFilteredContacts(
        filteredContacts.filter((contact) => contact.id !== id)
      );
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };
  const handleSubmit = async (formData) => {
    try {
      if (mode === "add") {
        await createContact(formData);
        // alert("FAQ created successfully!");
      } else if (mode === "edit") {
        // await updateFaq(selectedFaq.id, formData);
        // alert("FAQ updated successfully!");
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting FAQ:", error);
      //   alert("An error occurred while submitting the FAQ.");
    }
  };

  const handleOpenModal = (contact = null, mode = "add") => {
    setSelectedContact(contact);
    setMode(mode);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedContact(null);
  };

  return (
    <main className="min-h-screen px-4 md:px-14 py-8 flex flex-col gap-10">
      <section className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">
            Contact Us Form List
          </h2>
          {/* <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
            {filteredContacts.filter((contact) => !contact.status).length}{" "}
            unread
          </span> */}
        </div>
        <div className="bg-white p-4 rounded-lg space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters</span>
          </div>
          <div className="flex gap-3">
            <button
              className={`px-4 py-2 rounded ${
                readFilter === "all" ? "bg-gray-200" : ""
              }`}
              onClick={() => setReadFilter("all")}
            >
              All
            </button>
            <button
              className={`px-4 py-2 rounded ${
                readFilter === "unread" ? "bg-gray-200" : ""
              }`}
              onClick={() => setReadFilter("unread")}
            >
              Unread
            </button>
            <button
              className={`px-4 py-2 rounded ${
                readFilter === "read" ? "bg-gray-200" : ""
              }`}
              onClick={() => setReadFilter("read")}
            >
              Read
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {loading ? (
            <p>Loading...</p>
          ) : filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <ContactUsCard
                key={contact.id}
                notification={contact}
                onDelete={handleDeleteContact}
              />
            ))
          ) : (
            <p>No contacts found.</p>
          )}
        </div>
      </section>

      {/* {isModalOpen && (
        <ContactUsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          mode={mode}
          contact={selectedContact}
        />
      )} */}
    </main>
  );
};

export default ContactUsList;
