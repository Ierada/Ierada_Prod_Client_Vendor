import apiClient from "../axios.config";
import { notifyOnSuccess, notifyOnFail } from "../utils/notification/toast";

export const addToWishlist = async (userId, productId) => {
  try {
    const res = await apiClient.post("/wishlist/add", {
      user_id: userId,
      product_id: productId,
    });

    if (res.data.status === 1) {
      notifyOnSuccess(res.data.message);
      return res.data;
    } else {
      notifyOnFail(res.data.message);
    }
  } catch (error) {
    notifyOnFail("Error reaching the server");
    console.log(error);
  }
};

export const removeFromWishlist = async (wishlist_id) => {
  try {
    const res = await apiClient.delete(`/wishlist/remove`, {
      data: { wishlist_id },
    });

    if (res.data.status === 1) {
      // notifyOnSuccess(res.data.message);
      return res.data;
    } else {
      notifyOnFail(res.data.message);
    }
  } catch (error) {
    notifyOnFail("Error reaching the server");
    console.log(error);
    return null;
  }
};

export const getWishlist = async (userId) => {
  try {
    const res = await apiClient.get(`/wishlist/get/${userId}`);

    if (res.data.status === 1) {
      return res.data;
    } else {
      notifyOnFail(res.data.message);
      return null;
    }
  } catch (error) {
    notifyOnFail("Error reaching the server");
    console.log(error);
    return null;
  }
};
