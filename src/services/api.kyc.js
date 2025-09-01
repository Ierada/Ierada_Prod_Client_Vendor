import apiClient from "../axios.config";
import { notifyOnSuccess, notifyOnFail } from "../utils/notification/toast";

export const initiateKYCSession = async (vendorTempId) => {
  try {
    const res = await apiClient.post("/kyc/initiate-session", { vendorTempId });
    if (res.data.status === 1) {
      notifyOnSuccess("KYC session initiated successfully");
    } else {
      notifyOnFail(res.data.message || "Failed to initiate KYC session");
      throw new Error(res.data.message);
    }
    return res.data;
  } catch (error) {
    notifyOnFail(error.message || "Error initiating KYC session");
    throw error;
  }
};

export const generateOTP = async (
  aadhaarNumber,
  captcha,
  sessionId,
  vendorTempId
) => {
  try {
    const res = await apiClient.post("/kyc/generate-otp", {
      aadhaarNumber,
      captcha,
      sessionId,
      vendorTempId,
    });
    if (res.data.status === 1) {
      notifyOnSuccess(res.data.message || "OTP sent successfully");
    } else {
      notifyOnFail(res.data.message || "Failed to generate OTP");
      throw new Error(res.data.message);
    }
    return res.data;
  } catch (error) {
    notifyOnFail(error.message || "Error generating OTP");
    throw error;
  }
};

export const verifyOTP = async (otp, sessionId, vendorTempId) => {
  try {
    const res = await apiClient.post("/kyc/verify-otp", {
      otp,
      sessionId,
      vendorTempId,
    });
    if (res.data.status === 1) {
      notifyOnSuccess("Aadhaar verified successfully");
    } else {
      notifyOnFail(res.data.message || "Failed to verify OTP");
      throw new Error(res.data.message);
    }
    return res.data;
  } catch (error) {
    notifyOnFail(error.message || "Error verifying OTP");
    throw error;
  }
};

export const reloadCaptcha = async (sessionId, vendorTempId) => {
  try {
    const res = await apiClient.get("/kyc/reload-captcha", {
      params: { sessionId, vendorTempId },
    });
    if (res.data.status === 1) {
      notifyOnSuccess("Captcha reloaded successfully");
    } else {
      notifyOnFail(res.data.message || "Failed to reload captcha");
      throw new Error(res.data.message);
    }
    return res.data;
  } catch (error) {
    notifyOnFail(error.message || "Error reloading captcha");
    throw error;
  }
};

export const verifyPAN = async (panNumber, name, vendorTempId) => {
  try {
    const res = await apiClient.post("/kyc/verify-pan", {
      panNumber,
      name,
      vendorTempId,
    });
    if (res.data.status === 1) {
      notifyOnSuccess("PAN verified successfully");
    } else {
      notifyOnFail(res.data.message || "Failed to verify PAN");
      throw new Error(res.data.message);
    }
    return res.data;
  } catch (error) {
    notifyOnFail(error.message || "Error verifying PAN");
    throw error;
  }
};

export const verifyGST = async (gstNumber, vendorTempId) => {
  try {
    const res = await apiClient.post("/kyc/verify-gst", {
      gstNumber,
      vendorTempId,
    });
    if (res.data.status === 1) {
      notifyOnSuccess("GST verified successfully");
    } else {
      notifyOnFail(res.data.message || "Failed to verify GST");
      throw new Error(res.data.message);
    }
    return res.data;
  } catch (error) {
    notifyOnFail(error.message || "Error verifying GST");
    throw error;
  }
};

export const verifyBank = async (data) => {
  try {
    const res = await apiClient.post("/kyc/verify-bank", data);
    if (res.data.status === 1) {
      notifyOnSuccess("Bank verified successfully");
    } else {
      notifyOnFail(res.data.message || "Failed to verify Bank");
      throw new Error(res.data.message);
    }
    return res.data;
  } catch (error) {
    notifyOnFail(error.message || "Error verifying Bank");
    throw error;
  }
};

export const addBankDetails = async (data) => {
  try {
    const res = await apiClient.post("/kyc/add-bank-details", data);
    if (res.data.status === 1) {
      notifyOnSuccess("Bank details added successfully");
    } else {
      notifyOnFail(res.data.message || "Failed to add bank details");
      throw new Error(res.data.message);
    }
    return res.data;
  } catch (error) {
    notifyOnFail(error.message || "Error adding bank details");
    throw error;
  }
};

export const getBankHistory = async (userId) => {
  try {
    const res = await apiClient.get(`/kyc/bank-history/${userId}`);
    if (res.data.status === 1) {
      // notifyOnSuccess("Bank history fetched successfully");
    } else {
      notifyOnFail(res.data.message || "Failed to fetch bank history");
      throw new Error(res.data.message);
    }
    return res.data;
  } catch (error) {
    notifyOnFail(error.message || "Error fetching bank history");
    throw error;
  }
};

export const adminVerifyBank = async (data) => {
  try {
    const res = await apiClient.post("/kyc/admin/verify-bank", data);
    if (res.data.status === 1) {
      notifyOnSuccess("Bank verified successfully");
    } else {
      notifyOnFail(res.data.message || "Failed to verify Bank");
      throw new Error(res.data.message);
    }
    return res.data;
  } catch (error) {
    notifyOnFail(error.message || "Error verifying Bank");
    throw error;
  }
};

export const getPendingBankVerifications = async () => {
  try {
    const res = await apiClient.get("/kyc/admin/pending-banks");
    if (res.data.status === 1) {
      notifyOnSuccess("Pending bank verifications fetched successfully");
    } else {
      notifyOnFail(
        res.data.message || "Failed to fetch pending bank verifications"
      );
      throw new Error(res.data.message);
    }
    return res.data;
  } catch (error) {
    notifyOnFail(error.message || "Error fetching pending bank verifications");
    throw error;
  }
};
