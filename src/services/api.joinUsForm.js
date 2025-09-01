import apiClient from '../axios.config';
import { notifyOnSuccess, notifyOnFail } from '../utils/notification/toast';

export const addJoinUsForm = async (formData) => {
  try {
    const res = await apiClient.post('/joinus/addJoinUsForm', formData);
    if (res.data.status === 1) {
      notifyOnSuccess(res.data.message);
    } else {
      notifyOnFail(res.data.message);
    }
    return res.data;
  } catch (error) {
    notifyOnFail('Error reaching the server');
    console.log(error);
    return error.response || error;
  }
};



