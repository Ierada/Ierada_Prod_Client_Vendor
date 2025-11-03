import apiClient from "../axios.config";
import { notifyOnSuccess, notifyOnFail } from "../utils/notification/toast";

export const getHeaderCategories = async () => {
  try {
    const res = await apiClient.get("/header/categories");
    if (res.data.status === 1) {
      // notifyOnSuccess(res.data.message);
    } else {
      // notifyOnFail(res.data.message);
    }

    return res.data;
  } catch (error) {
    notifyOnFail("Error reaching the server");
    console.log(error);
    return error.response || error;
  }
};

export const getHeaderCartWishlistNotificationCount = async (userId) => {
  try {
    const res = await apiClient.get(`/header/get-counts/${userId}`);
    if (res.data.status === 1) {
      // notifyOnSuccess(res.data.message);
      return res.data;
    } else {
      // notifyOnFail(res.data.message);
    }
  } catch (error) {
    notifyOnFail("Error reaching the server");
    console.log(error);
  }
};
