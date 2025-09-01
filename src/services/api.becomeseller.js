import apiClient from "../axios.config";
import { notifyOnSuccess, notifyOnFail } from "../utils/notification/toast";

export const registerSeller = async (formData) => {
  try {
    const res = await apiClient.post("/seller/register", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    if (res.data.status === 1) {
      notifyOnSuccess(res.data.message);
      return res.data;
    } else {
      notifyOnFail(res.data.message);
    }
  } catch (error) {
    notifyOnFail(error.response?.data?.message || "Error reaching the server");
    console.error("Error uploading seller documents:", error);
  }
};