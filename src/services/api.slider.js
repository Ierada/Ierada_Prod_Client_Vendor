import apiClient from "../axios.config";
import { notifyOnSuccess, notifyOnFail } from "../utils/notification/toast";

export const getAllSliders = async () => {
    try {
        const response = await apiClient.get('/slider/getAll');

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

export const updateSlider = async (id, SliderData) => {
    try {
        const response = await apiClient.put(`/slider/edit/${id}`, SliderData )
        if (response.data.status === 1) {
            notifyOnSuccess(response.data.message);
            return response.data;
          } else {
            notifyOnFail(response.data.message);
          }
    } catch (error) {
        notifyOnFail('Error fetching Sliders')
        console.error(error);

    }
}

export const addSlider = async (SliderData) => {
    try {
        const response = await apiClient.post('/slider/add', SliderData)
        if (response.data.status === 1) {
            notifyOnSuccess(response.data.message);
            return response.data;
          } else {
            notifyOnFail(response.data.message);
          }
    } catch (error) {
        notifyOnFail('Error fetching Sliders')
        console.error(error);
    }
}

export const deleteSlider = async (id) => {
    try {
        const response = await apiClient.delete(`/slider/delete/${id}`);
        if (response.data.status === 1) {
            notifyOnSuccess(response.data.message);
            return response.data;
          } else {
            notifyOnFail(response.data.message);
          }
    } catch (error) {
        notifyOnFail('Error fetching Sliders')
        console.error(error);
    }
}