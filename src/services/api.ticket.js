import apiClient from "../axios.config";
import { notifyOnSuccess, notifyOnFail } from "../utils/notification/toast";

export const createTicket = async (userId, ticketData) => {
  try {
    const formData = new FormData();
    Object.keys(ticketData).forEach((key) => {
      if (key === "attachments" && ticketData[key]) {
        Array.from(ticketData[key]).forEach((file) => {
          formData.append("attachments", file);
        });
      } else {
        formData.append(key, ticketData[key]);
      }
    });

    const res = await apiClient.post(
      `/tickets/createTicket/${userId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    if (res.data.status === 1) {
      notifyOnSuccess(res.data.message);
      return res.data;
    } else {
      notifyOnFail(res.data.message);
      return null;
    }
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

export const getTickets = async (userId, filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const res = await apiClient.get(
      `/tickets/getTickets/${userId}/?${queryParams}`
    );

    if (res.data.status === 1) {
      return res.data.data;
    } else {
      notifyOnFail(res.data.message);
      return [];
    }
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

export const getAllTickets = async (params = {}) => {
  try {
    const res = await apiClient.get(`/tickets/getAllTicket`, { params }); // Pass dynamic params
    if (res.data.status === 1) {
      // notifyOnSuccess(res.data.message);
    } else {
      notifyOnFail(res.data.message || "Something went wrong");
    }
    return res.data;
  } catch (error) {
    notifyOnFail(error.response?.data?.message || "Error reaching the server");
    console.error("Error fetching orders:", error);
  }
};

export const updateTicket = async (userId, ticketId, updateData) => {
  try {
    const res = await apiClient.put(
      `/tickets/updateTicket/${userId}/${ticketId}`,
      updateData
    );

    if (res.data.status === 1) {
      notifyOnSuccess(res.data.message);
      return res.data.data;
    } else {
      notifyOnFail(res.data.message);
      return null;
    }
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

export const addReply = async (data, userId) => {
  try {
    const res = await apiClient.post(`/tickets/addReply/${userId}`, data);

    if (res.data.status === 1) {
      notifyOnSuccess(res.data.message);
      return res.data;
    } else {
      notifyOnFail(res.data.message || "Something went wrong");
    }
  } catch (error) {
    notifyOnFail(error.response?.data?.message || "Error reaching the server");
    console.error("Error adding reply:", error);
  }
};

// Helper function to handle API errors
const handleApiError = (error) => {
  const errorMessage =
    error.response?.data?.message ||
    "Error connecting to the server. Please try again later.";
  notifyOnFail(errorMessage);
  console.error("API Error:", error);
};
