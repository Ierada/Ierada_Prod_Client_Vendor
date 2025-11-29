import apiClient from "../axios.config.js";
import { notifyOnSuccess, notifyOnFail } from "../utils/notification/toast.js";

export const getAllAttributes = async () => {
  try {
    const result = await apiClient.get("/attributes/getAll");
    return result.data;
  } catch (err) {
    notifyOnFail(err.message);
  }
};

export const getAttributeById = async (id) => {
  try {
    const result = await apiClient.get(`/attributes/getById/${id}`);
    return result.data;
  } catch (err) {
    notifyOnFail(err.message);
  }
};

export const createAttribute = async (data) => {
  try {
    const result = await apiClient.post("/attributes/create", data);
    return result.data;
  } catch (err) {
    notifyOnFail(err.message);
  }
};

export const updateAttribute = async (id, data) => {
  try {
    const result = await apiClient.put(`/attributes/update/${id}`, data);
    return result.data;
  } catch (err) {
    notifyOnFail(err.message);
  }
};

export const deleteAttribute = async (id) => {
  try {
    const result = await apiClient.delete(`/attributes/delete/${id}`);
    return result.data;
  } catch (err) {
    notifyOnFail(err.message);
  }
};
