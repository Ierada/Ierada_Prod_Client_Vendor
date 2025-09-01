import apiClient from "../axios.config";
import { notifyOnSuccess, notifyOnFail } from "../utils/notification/toast";

export const getHomePageData = async (userId) => {
  try {
    const res = await apiClient.get(`/dashboard/homepage/${userId}`);
    if (res.data.status === 1) {
      notifyOnSuccess(res.data.message);
    } else {
      notifyOnFail(res.data.message);
    }
    return res.data;
  } catch (error) {
    notifyOnFail("Error reaching the server");
    console.error(error);
  }
};

export const getDesignerDashboard = async (vendor_id) => {
  try {
    const res = await apiClient.get(
      `/dashboard/designerdashboard/${vendor_id}`
    );

    if (res.data.status === 1) {
      //   notifyOnSuccess(res.data.message);
      return res.data;
    } else {
      notifyOnFail(res.data.message);
    }
  } catch (error) {
    notifyOnFail("Error reaching the server");
    console.error(error);
  }
};

export const getAdminDashboardData = async ({ startDate, endDate }) => {
  try {
    const res = await apiClient.post(`/dashboard/admindashboard`, {
      startDate,
      endDate,
    });
    if (res.data.status === 1) {
      //   notifyOnSuccess(res.data.message);
      return res.data;
    } else {
      notifyOnFail(res.data.message);
    }
  } catch (error) {
    notifyOnFail("Error reaching the server");
    console.error(error);
  }
};
