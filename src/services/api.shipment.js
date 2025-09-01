import apiClient from '../axios.config';
import { notifyOnSuccess, notifyOnFail } from '../utils/notification/toast';

export const getAllShipments = async () => {
  try {
    const res = await apiClient.get('/shipment/get');
    if (res.data.status === 1) {
      return res.data;
    } else {
      notifyOnFail(res.data.message);
      return null;
    }
  } catch (error) {
    notifyOnFail('Error reaching the Server');
    console.log(error);
    return null;
  }
};

export const updateShipment = async (id, data) => {
  try {
    const res = await apiClient.put(`/shipment/updated/${id}`, data);
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

export const getActiveShipment = async (shipmentId) => {
  try {
    const res = await apiClient.get(`/shipment/active-shipment/${shipmentId}`);
    // console.log('Raw API Response:', res);
    if (res.data.status === 1) {
      return res.data;
    } else {
      notifyOnFail(res.data.message);
      return null;
    }
  } catch (error) {
    notifyOnFail('Error reaching the Server');
    console.log(error);
    return null;
  }
};

export const createShipment = async () => {
  try {
    const res = await apiClient.post('/shipment/add');
    if (res.data.status === 1) {
      return res.data;
    } else {
      notifyOnFail(res.data.message);
      return null;
    }
  } catch (error) {
    notifyOnFail('Error reaching the Server');
    console.log(error);
    return null;
  }
};

export const deleteShipment = async (id) => {
  try {
    const response = await apiClient.delete(`/address/delete/${id}`);
    if (response.data.status === 1) {
      notifyOnSuccess(response.data.message);
      return response.data.message;
    } else {
      notifyOnFail(response.data.message);
    }
  } catch (error) {
    notifyOnFail('Error deleting the attribute');
    console.error(error);
    return error.response || error;
  }
};
