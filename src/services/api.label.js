import apiClient from "../axios.config";
import { notifyOnSuccess, notifyOnFail } from "../utils/notification/toast";

export const getAllLabels = async () => {
    try {
        const response = await apiClient.get('/label/getAll');

        if(response.data.status === 1){
            // notifyOnSuccess(response.data.message)
            return response.data
        }
        else {
            notifyOnFail(response.data.message)
        }
    } catch (error) {
        notifyOnFail('Error fetching labels')
        console.error(error);
        
    }
}

export const updateLabel = async (id, LabelData) => {
    try {
        const response = await apiClient.put(`/label/edit/${id}`, LabelData )
        if (response.data.status === 1) {
            notifyOnSuccess(response.data.message);
            return response.data;
          } else {
            notifyOnFail(response.data.message);
          }
    } catch (error) {
        notifyOnFail('Error fetching labels')
        console.error(error);

    }
}

export const addLabel = async (LabelData) => {
    try {
        const response = await apiClient.post('/label/add', LabelData)
        if (response.data.status === 1) {
            notifyOnSuccess(response.data.message);
            return response.data;
          } else {
            notifyOnFail(response.data.message);
          }
    } catch (error) {
        notifyOnFail('Error fetching labels')
        console.error(error);
    }
}

export const deleteLabel = async (id) => {
    try {
        const response = await apiClient.delete(`/label/delete/${id}`);
        if (response.data.status === 1) {
            notifyOnSuccess(response.data.message);
            return response.data;
          } else {
            notifyOnFail(response.data.message);
          }
    } catch (error) {
        notifyOnFail('Error fetching labels')
        console.error(error);
    }
}