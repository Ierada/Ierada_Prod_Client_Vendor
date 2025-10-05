import apiClient from "../axios.config";
import { notifyOnSuccess, notifyOnFail } from "../utils/notification/toast";

export const addLike = async (userId, productId) => {
  try {
    const res = await apiClient.post("/likes/add", {
      user_id: userId,
      product_id: productId,
    });

    if (res.data.status === 1) {
      notifyOnSuccess("Product liked successfully!");
      return res.data;
    } else {
      notifyOnFail(res.data.message);
      return null;
    }
  } catch (error) {
    notifyOnFail("Error liking the product");
    console.log(error);
    return null;
  }
};

export const getUserLikes = async (userId) => {
  try {
    const res = await apiClient.get(`/likes/get/${userId}`);

    if (res.data.status === 1) {
      return res.data.data;
    } else {
      return [];
    }
  } catch (error) {
    console.log(error);
    return [];
  }
};
