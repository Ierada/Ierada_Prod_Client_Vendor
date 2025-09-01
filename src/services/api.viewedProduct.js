import apiClient from "../axios.config";
import { notifyOnSuccess, notifyOnFail } from "../utils/notification/toast";

export const recentlyViewedProducts = async (id) => {
    try {
        const response = await apiClient.get(`/viewedproducts/recently-viewed/${id}`);

        if(response.data.status === 1){
            // notifyOnSuccess(response.data.message)
            return response.data
        }
        else {
            notifyOnFail(response.data.message)
        }
    } catch (error) {
        notifyOnFail('Error fetching Sliders')
        console.error(error);
        
    }
}

export const setTrackProductView = async (data) => {
    try {
        const response = await apiClient.post(`/viewedproducts/track-view`, data )
        if (response.data.status === 1) {
            // notifyOnSuccess(response.data.message);
            return response.data;
          } else {
            notifyOnFail(response.data.message);
          }
    } catch (error) {
        notifyOnFail('Error fetching Sliders')
        console.error(error);

    }
}

