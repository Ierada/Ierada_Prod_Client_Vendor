import React, { useState, useEffect, useRef, memo } from "react";
import { Camera, Upload, Eye, X, Check, CheckCircle } from "lucide-react";
import { registerVendor, verifyVendorMobile } from "../../../services/api.auth";
import {
  initiateKYCSession,
  generateOTP,
  verifyOTP,
  reloadCaptcha,
  verifyPAN,
  verifyGST,
} from "../../../services/api.kyc";
import config from "../../../config/config";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { formatCaptchaImage } from "../../../utils/captcha";
import { notifyOnFail } from "../../../utils/notification/toast";

const OtpModal = memo(
  ({
    phone,
    otp,
    setOtp,
    errors,
    setErrors,
    isLoading,
    otpTimerActive,
    counter,
    handleSendOtp,
    handleVerifyOtp,
    setShowOtpModal,
    otpRefs,
    digitCount,
  }) => {
    const focusedOtpIndex = useRef(null);

    const handleOtpChange = (value, index) => {
      if (/^\d*$/.test(value)) {
        focusedOtpIndex.current = index;
        const newOtp = [...otp];
        if (value.length > 1) {
          const digits = value.split("");
          for (let i = 0; i < digits.length; i++) {
            if (index + i < newOtp.length) newOtp[index + i] = digits[i];
          }
          setOtp(newOtp);
          const nextIndex = Math.min(index + digits.length, newOtp.length - 1);
          focusedOtpIndex.current = nextIndex;
          setTimeout(() => otpRefs.current[nextIndex]?.focus(), 0);
        } else {
          newOtp[index] = value;
          setOtp(newOtp);
          if (value && index < newOtp.length - 1) {
            focusedOtpIndex.current = index + 1;
            setTimeout(() => otpRefs.current[index + 1]?.focus(), 0);
          }
        }
      }
    };

    const handleOtpKeyDown = (e, index) => {
      focusedOtpIndex.current = index;
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        focusedOtpIndex.current = index - 1;
        setTimeout(() => otpRefs.current[index - 1]?.focus(), 0);
      }
    };

    useEffect(() => {
      if (focusedOtpIndex.current !== null) {
        otpRefs.current[focusedOtpIndex.current]?.focus();
      }
    }, [otp, otpRefs]);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold">Enter OTP</h2>
              <p className="text-gray-600 mt-2">OTP sent to +91 {phone}</p>
            </div>
            <div className="flex justify-center gap-4">
              {Array.from({ length: digitCount }).map((_, index) => (
                <input
                  key={index}
                  ref={(el) => (otpRefs.current[index] = el)}
                  type="tel"
                  value={otp[index]}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  onFocus={() => (focusedOtpIndex.current = index)}
                  className="w-14 h-14 text-center border rounded-lg text-xl focus:ring-2 focus:ring-black [appearance:textfield]"
                  maxLength="1"
                />
              ))}
            </div>
            {errors.otp && (
              <p className="text-red-500 text-sm text-center">{errors.otp}</p>
            )}
            {digitCount === 4 ? (
              <div className="flex justify-between text-sm">
                <button
                  onClick={handleSendOtp}
                  className={`text-blue-600 ${
                    otpTimerActive ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={otpTimerActive}
                >
                  Resend OTP
                </button>
                <span>{`00:${counter < 10 ? "0" + counter : counter}`}</span>
              </div>
            ) : null}
            <div className="flex gap-4">
              <button
                onClick={() => setShowOtpModal(false)}
                className="w-1/2 border border-gray-300 text-gray-700 py-3 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOtp}
                className="w-1/2 bg-black text-white py-3 rounded-lg disabled:bg-gray-300"
                disabled={otp.some((digit) => !digit) || isLoading}
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

const CaptchaModal = memo(
  ({
    captcha,
    aadhaarNumber,
    setAadhaarNumber,
    errors,
    setErrors,
    initiateKYC,
    reloadCaptcha,
    sessionId,
    vendorTempId,
    setShowCaptchaModal,
    handleGenerateOtp,
  }) => {
    const [captchaInput, setCaptchaInput] = useState("");

    const handleSubmitCaptcha = async () => {
      if (!aadhaarNumber || !captchaInput) {
        setErrors((prev) => ({
          ...prev,
          aadhaarNumber: !aadhaarNumber ? "Aadhaar number is required" : "",
          captcha: !captchaInput ? "Captcha is required" : "",
        }));
        return;
      }

      try {
        await handleGenerateOtp(aadhaarNumber, captchaInput, sessionId);
        setShowCaptchaModal(false);
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          captcha: error.message || "Invalid captcha or Aadhaar number",
        }));
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold">Verify Aadhaar</h2>
              <p className="text-gray-600 mt-2">
                Enter your Aadhaar number and captcha
              </p>
            </div>
            <div className="relative">
              <input
                type="text"
                value={aadhaarNumber}
                onChange={(e) => {
                  if (/^\d*$/.test(e.target.value)) {
                    setAadhaarNumber(e.target.value);
                    setErrors((prev) => ({ ...prev, aadhaarNumber: "" }));
                  }
                }}
                maxLength="12"
                className="block px-4 py-3 w-full text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                placeholder="Enter 12-digit Aadhaar number"
              />
              {errors.aadhaarNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.aadhaarNumber}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <img src={captcha} alt="Captcha" className="h-12" />
              <button
                onClick={() => reloadCaptcha(sessionId, vendorTempId)}
                className="text-blue-600 hover:underline"
              >
                Reload
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={captchaInput}
                onChange={(e) => {
                  setCaptchaInput(e.target.value);
                  setErrors((prev) => ({ ...prev, captcha: "" }));
                }}
                className="block px-4 py-3 w-full text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                placeholder="Enter captcha"
              />
              {errors.captcha && (
                <p className="text-red-500 text-xs mt-1">{errors.captcha}</p>
              )}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCaptchaModal(false)}
                className="w-1/2 border border-gray-300 text-gray-700 py-3 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCaptcha}
                className="w-1/2 bg-black text-white py-3 rounded-lg"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

const BecomeSellerForm = ({ seller_terms_condition_link }) => {
  const [step, setStep] = useState("mobile");
  const [vendorTempId, setVendorTempId] = useState(uuidv4());
  const [mobileVerified, setMobileVerified] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [panVerified, setPanVerified] = useState(false);
  const [gstVerified, setGstVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showCaptchaModal, setShowCaptchaModal] = useState(false);
  const [otp, setOtp] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [otpTimerActive, setOtpTimerActive] = useState(false);
  const [counter, setCounter] = useState(60);
  const [sessionId, setSessionId] = useState("");
  const [captcha, setCaptcha] = useState("");
  const otpRefs = useRef([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    birthday: "",
    shopName: "",
    shopAddress: "",
    panNumber: "",
    adhaarNumber: "",
    gstin: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [files, setFiles] = useState({
    panCardFile: null,
    adhaarCardFile: null,
    gstFile: null,
  });

  const [filePreview, setFilePreview] = useState({
    isOpen: false,
    file: null,
    type: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOver18, setIsOver18] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setOtp(step === "mobile" ? ["", "", "", ""] : ["", "", "", "", "", ""]);
  }, [step, showOtpModal]);

  useEffect(() => {
    const age = calculateAge(formData.birthday);
    setIsOver18(age !== null && age >= 18);
  }, [formData.birthday]);

  useEffect(() => {
    if (showOtpModal && otpTimerActive) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      setCounter(60);

      timerRef.current = setInterval(() => {
        setCounter((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setOtpTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [showOtpModal, otpTimerActive]);

  const calculateAge = (birthday) => {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const validateMobile = (phone) => {
    if (!phone.trim()) return "Phone number is required";
    if (!/^\d{10}$/.test(phone)) return "Phone must be 10 digits";
    return "";
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    // if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    const phoneError = validateMobile(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    if (!formData.shopName.trim()) newErrors.shopName = "Shop name is required";
    if (!formData.shopAddress.trim())
      newErrors.shopAddress = "Shop address is required";

    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "Zip code is required";

    if (!files.panCardFile) newErrors.panCardFile = "PAN card file is required";
    if (!files.adhaarCardFile)
      newErrors.adhaarCardFile = "Aadhaar card file is required";
    if (!files.gstFile) newErrors.gstFile = "GST file is required";

    if (!mobileVerified) newErrors.phone = "Mobile number must be verified";
    if (!aadhaarVerified) newErrors.adhaarNumber = "Aadhaar must be verified";
    if (!panVerified) newErrors.panNumber = "PAN must be verified";
    if (!gstVerified) newErrors.gstin = "GST must be verified";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;

    if (id === "panNumber" || id === "gstin") {
      setFormData((prev) => ({ ...prev, [id]: value.toUpperCase() }));
    } else if (id === "phone" || id === "zipCode") {
      if (/^\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [id]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }

    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: "" }));
    if (id === "phone") setMobileVerified(false);
    if (id === "gstin") setGstVerified(false);
  };

  const handleFileChange = (fieldName, file) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: "File size should not exceed 5MB",
        }));
        return;
      }

      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: "Only JPEG, PNG and PDF files are allowed",
        }));
        return;
      }

      setFiles((prev) => ({ ...prev, [fieldName]: file }));
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  const handleFilePreview = (fieldName) => {
    const file = files[fieldName];
    if (file) {
      setFilePreview({
        isOpen: true,
        file: URL.createObjectURL(file),
        type: file.type,
      });
    }
  };

  const initiateKYC = async () => {
    try {
      const response = await initiateKYCSession(vendorTempId);
      setSessionId(response.data.sessionId);
      const formattedCaptcha = formatCaptchaImage(response.data.captcha);
      setCaptcha(formattedCaptcha);
      setShowCaptchaModal(true);
    } catch (error) {
      notifyOnFail(error.message || "Failed to initiate KYC");
    }
  };

  const handleGenerateOtp = async (aadhaarNumber, captchaInput, sessionId) => {
    setIsLoading(true);
    try {
      const response = await generateOTP(
        aadhaarNumber,
        captchaInput,
        sessionId,
        vendorTempId
      );
      setFormData((prev) => ({ ...prev, adhaarNumber: aadhaarNumber }));
      setShowOtpModal(true);
      setOtp(["", "", "", "", "", ""]);
      setOtpTimerActive(true);
      setCounter(60);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReloadCaptcha = async (sessionId, vendorTempId) => {
    try {
      const response = await reloadCaptcha(sessionId, vendorTempId);
      const formattedCaptcha = formatCaptchaImage(response.data.captcha);
      setCaptcha(formattedCaptcha);
    } catch (error) {
      notifyOnFail(error.message || "Failed to reload captcha");
    }
  };

  const handleVerifyAadhaarOtp = async () => {
    setIsLoading(true);
    try {
      const otpCode = otp.join("");
      const response = await verifyOTP(otpCode, sessionId, vendorTempId);
      const { data } = response;

      setFormData((prev) => ({
        ...prev,
        firstName: data.name.split(" ")[0] || prev.firstName,
        lastName: data.name.split(" ").slice(1).join(" ") || prev.lastName,
        gender:
          data.gender === "M"
            ? "male"
            : data.gender === "F"
            ? "female"
            : "other",
        birthday: data.dateOfBirth
          ? data.dateOfBirth.split("-").reverse().join("-")
          : prev.birthday,
        address:
          [
            data.address.house,
            data.address.street,
            data.address.locality,
            data.address.landmark,
          ]
            .filter(Boolean)
            .join(", ") || prev.address,
        city: data.address.district || prev.city,
        state: data.address.state || prev.state,
        zipCode: data.address.pin || prev.zipCode,
      }));

      setAadhaarVerified(true);
      setShowOtpModal(false);
      setErrors((prev) => ({ ...prev, otp: "" }));
      setStep("form");
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        otp: error.message || "Invalid OTP",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPan = async () => {
    if (!formData.panNumber) {
      setErrors((prev) => ({
        ...prev,
        panNumber: "PAN number is required",
      }));
      return;
    }

    setIsLoading(true);
    try {
      const name = `${formData.firstName} ${formData.lastName}`;
      await verifyPAN(formData.panNumber, name, vendorTempId);
      setPanVerified(true);
      setErrors((prev) => ({ ...prev, panNumber: "" }));
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        panNumber: error.message || "Failed to verify PAN. Name may not match",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyGst = async () => {
    if (!formData.gstin) {
      setErrors((prev) => ({
        ...prev,
        gstin: "GSTIN is required",
      }));
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifyGST(formData.gstin, vendorTempId);
      setFormData((prev) => ({
        ...prev,
        shopName: response.data.tradeNam || prev.shopName,
        shopAddress:
          [
            response.data.pradr?.addr?.locality,
            response.data.pradr?.addr?.dst,
            response.data.pradr?.addr?.stcd,
            response.data.pradr?.addr?.pncd,
          ]
            .filter(Boolean)
            .join(", ") || prev.shopAddress,
      }));
      setErrors((prev) => ({ ...prev, gstin: "" }));
      setGstVerified(true);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        gstin: error.message || "Failed to verify GST",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    const phoneError = validateMobile(formData.phone);
    if (phoneError) {
      setErrors((prev) => ({ ...prev, phone: phoneError }));
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifyVendorMobile({ phone: formData.phone });
      if (response.status === 1) {
        setShowOtpModal(true);
        setOtp(["", "", "", ""]);
        setOtpTimerActive(true);
        setCounter(60);
      } else {
        setErrors((prev) => ({
          ...prev,
          phone: response.message || "Failed to send OTP",
        }));
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        phone: error.message || "Failed to send OTP",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyMobileOtp = async () => {
    setIsLoading(true);
    try {
      const otpCode = otp.join("");
      const response = await verifyVendorMobile({
        phone: formData.phone,
        otp: otpCode,
      });
      if (response.status === 1 && response.data?.verified) {
        setMobileVerified(true);
        setShowOtpModal(false);
        setStep("aadhaar");
        initiateKYC();
      } else {
        setErrors((prev) => ({
          ...prev,
          otp: response.message || "Invalid OTP",
        }));
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        otp: error.message || "Verification failed",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      notifyOnFail("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      Object.entries(files).forEach(([key, file]) => {
        if (file) formDataToSend.append(key, file);
      });
      formDataToSend.append("vendorTempId", vendorTempId);

      const response = await registerVendor(formDataToSend);

      if (response.status === 1) {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          gender: "",
          birthday: "",
          shopName: "",
          shopAddress: "",
          panNumber: "",
          adhaarNumber: "",
          gstin: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
        });
        setFiles({ panCardFile: null, adhaarCardFile: null, gstFile: null });
        setMobileVerified(false);
        setAadhaarVerified(false);
        setPanVerified(false);
        setGstVerified(false);
        setVendorTempId(uuidv4());
        setStep("mobile");
      } else {
        notifyOnFail(response.message || "Error submitting registration");
      }
    } catch (error) {
      notifyOnFail("Error submitting registration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFileInputs = () => {
    const fileFields = [
      { id: "panCardFile", label: "PAN Card" },
      { id: "adhaarCardFile", label: "Aadhaar Card" },
      { id: "gstFile", label: "GST" },
    ];

    return fileFields.map((field) => (
      <div className="w-full sm:w-1/2 lg:w-1/3 px-2 mb-4" key={field.id}>
        <div className="relative flex items-center">
          <input
            type="text"
            value={files[field.id]?.name || ""}
            className="block w-full px-3 py-3 text-sm text-gray-900 bg-transparent border border-gray-300 rounded focus:outline-none focus:ring-0"
            readOnly
            placeholder={`Upload ${field.label}`}
          />
          <label className="absolute text-base text-gray-500 bg-white px-2 -top-3 left-2">
            {field.label}
          </label>
          <div className="absolute inset-y-0 right-3 flex items-center space-x-2">
            <button
              type="button"
              onClick={() =>
                document.getElementById(`${field.id}Input`).click()
              }
              className="text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              <Camera className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() =>
                document.getElementById(`${field.id}Input`).click()
              }
              className="text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              <Upload className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => handleFilePreview(field.id)}
              className="text-gray-600 hover:text-gray-800 focus:outline-none"
              disabled={!files[field.id]}
            >
              <Eye className="h-5 w-5" />
            </button>
          </div>
          <input
            id={`${field.id}Input`}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            className="hidden"
            onChange={(e) => handleFileChange(field.id, e.target.files[0])}
          />
        </div>
        {errors[field.id] && (
          <p className="text-red-500 text-xs mt-1">{errors[field.id]}</p>
        )}
      </div>
    ));
  };

  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded-lg max-w-2xl w-full mx-4 relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    );
  };

  const renderInputWithVerify = (id, label, value, verified, onVerify) => (
    <div className="relative">
      <input
        type="text"
        id={id}
        value={value}
        onChange={handleInputChange}
        className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray peer"
        required
        maxLength={
          id === "panNumber" ? "10" : id === "adhaarNumber" ? "12" : "15"
        }
        readOnly={verified}
      />
      <label className="absolute text-base text-gray-500 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-gray peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">
        {label}
      </label>
      <div className="absolute inset-y-0 right-3 flex items-center space-x-2">
        {verified ? (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-5 w-5 mr-1" />
            <span className="text-sm">Verified</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onVerify}
            disabled={isLoading || !value}
            className="bg-black text-white py-1 px-3 rounded-lg disabled:bg-gray-300"
          >
            {isLoading ? "Verifying..." : "Verify"}
          </button>
        )}
      </div>
      {errors[id] && <p className="text-red-500 text-xs mt-1">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-4xl w-full p-6">
        <h1 className="text-2xl lg:text-4xl font-semibold font-Playfair text-[black] text-center mb-10">
          Ready To Come Onboard With Us?
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === "mobile" && (
            <div className="flex flex-col space-y-4 max-w-md mx-auto">
              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold">
                  Verify Your Mobile Number
                </h2>
                <p className="text-gray-600 mt-1">
                  Please enter your mobile number to start the registration
                  process
                </p>
              </div>
              <div className="relative">
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  maxLength="10"
                  placeholder="Enter 10-digit mobile number"
                  className="block px-4 py-3 w-full text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                  readOnly={mobileVerified}
                />
                {mobileVerified && (
                  <div className="absolute inset-y-0 right-3 flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-1" />
                    <span className="text-sm">Verified</span>
                  </div>
                )}
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                By proceeding, you agree to our{" "}
                <a
                  href={seller_terms_condition_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Terms and Conditions
                </a>
                .
              </div>
              {!mobileVerified && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={
                    !formData.phone || formData.phone.length !== 10 || isLoading
                  }
                  className="bg-black text-white py-3 px-6 rounded-lg disabled:bg-gray-300 w-full"
                >
                  {isLoading ? "Sending OTP..." : "Send OTP"}
                </button>
              )}
              <div className="text-center mt-4">
                <Link
                  to={`${config.VITE_BASE_WEBSITE_URL}/signin-vendor`}
                  className="text-blue-600 hover:underline"
                >
                  Already registered? Sign in
                </Link>
              </div>
            </div>
          )}

          {step === "aadhaar" && (
            <div className="flex flex-col space-y-4 max-w-md mx-auto">
              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold">Verify Your Aadhaar</h2>
                <p className="text-gray-600 mt-1">
                  Please verify your Aadhaar number to proceed
                </p>
              </div>
              <button
                type="button"
                onClick={initiateKYC}
                className="bg-black text-white py-3 px-6 rounded-lg"
              >
                Start Aadhaar Verification
              </button>
            </div>
          )}

          {step === "form" && (
            <>
              <div className="flex items-center justify-between mb-4 bg-green-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-green-800">
                    Mobile and Aadhaar verified successfully
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileVerified(false);
                    setAadhaarVerified(false);
                    setPanVerified(false);
                    setGstVerified(false);
                    setFormData((prev) => ({
                      ...prev,
                      phone: "",
                      adhaarNumber: "",
                      panNumber: "",
                      gstin: "",
                      shopName: "",
                      shopAddress: "",
                    }));
                    setVendorTempId(uuidv4());
                    setStep("mobile");
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Start Over
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray peer"
                    required
                    readOnly
                  />
                  <label className="absolute text-base text-gray-500 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-gray peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">
                    First Name
                  </label>
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray peer"
                    required
                    readOnly
                  />
                  <label className="absolute text-base text-gray-500 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-gray peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">
                    Last Name
                  </label>
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray peer"
                  required
                />
                <label className="absolute text-base text-gray-500 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-gray peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">
                  Email Address
                </label>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="relative">
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray peer"
                    disabled
                  >
                    <option value="" disabled selected hidden></option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <label className="absolute text-base text-gray-500 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-gray peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">
                    Gender
                  </label>
                  {errors.gender && (
                    <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="date"
                    id="birthday"
                    required
                    value={formData.birthday}
                    onChange={handleInputChange}
                    onBlur={() => {
                      const age = calculateAge(formData.birthday);
                      if (age !== null && age < 18) {
                        setErrors((prev) => ({
                          ...prev,
                          birthday:
                            "You must be at least 18 years old to register",
                        }));
                      } else if (formData.birthday && errors.birthday) {
                        setErrors((prev) => ({ ...prev, birthday: "" }));
                      }
                    }}
                    onClick={(e) =>
                      e.target.showPicker && e.target.showPicker()
                    }
                    max={
                      new Date(
                        new Date().setFullYear(new Date().getFullYear() - 18)
                      )
                        .toISOString()
                        .split("T")[0]
                    }
                    className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray peer"
                    readOnly
                  />
                  <label className="absolute text-base text-gray-500 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-gray peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">
                    Date of Birth
                  </label>
                  {errors.birthday && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.birthday}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    id="shopName"
                    value={formData.shopName}
                    onChange={handleInputChange}
                    className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray peer"
                    required
                    readOnly={gstVerified}
                  />
                  <label className="absolute text-base text-gray-500 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-gray peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">
                    Shop Name
                  </label>
                  {gstVerified && (
                    <div className="absolute inset-y-0 right-3 flex items-center text-green-600">
                      <CheckCircle className="h-5 w-5 mr-1" />
                      <span className="text-sm">Verified</span>
                    </div>
                  )}
                  {errors.shopName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.shopName}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    id="shopAddress"
                    value={formData.shopAddress}
                    onChange={handleInputChange}
                    className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray peer"
                    required
                    readOnly={gstVerified}
                  />
                  <label className="absolute text-base text-gray-500 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-gray peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">
                    Shop Address
                  </label>
                  {gstVerified && (
                    <div className="absolute inset-y-0 right-3 flex items-center text-green-600">
                      <CheckCircle className="h-5 w-5 mr-1" />
                      <span className="text-sm">Verified</span>
                    </div>
                  )}
                  {errors.shopAddress && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.shopAddress}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    id="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray peer"
                    required
                    readOnly
                  />
                  <label className="absolute text-base text-gray-500 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-gray peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">
                    Address
                  </label>
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray peer"
                    required
                    readOnly
                  />
                  <label className="absolute text-base text-gray-500 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-gray peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">
                    City
                  </label>
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    id="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray peer"
                    required
                    readOnly
                  />
                  <label className="absolute text-base text-gray-500 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-gray peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">
                    State
                  </label>
                  {errors.state && (
                    <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    maxLength="6"
                    className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray peer"
                    required
                    readOnly
                  />
                  <label className="absolute text-base text-gray-500 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-gray peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">
                    Zip Code
                  </label>
                  {errors.zipCode && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.zipCode}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {renderInputWithVerify(
                  "adhaarNumber",
                  "Aadhaar Number",
                  formData.adhaarNumber,
                  aadhaarVerified,
                  () => {}
                )}
                {renderInputWithVerify(
                  "panNumber",
                  "PAN Number",
                  formData.panNumber,
                  panVerified,
                  handleVerifyPan
                )}
                {renderInputWithVerify(
                  "gstin",
                  "GSTIN",
                  formData.gstin,
                  gstVerified,
                  handleVerifyGst
                )}
              </div>

              <div className="my-8">
                <h3 className="text-lg font-semibold mb-4">Upload Documents</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Please upload clear copies of the following documents.
                  Accepted formats: JPG, PNG, PDF (Max 5MB)
                </p>
                <div className="flex flex-wrap -mx-2">{renderFileInputs()}</div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center">
                  <input
                    id="termsCheck"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    required
                  />
                  <label
                    htmlFor="termsCheck"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    I agree to the{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      Privacy Policy and I can receive emails, SMS and Whatsapp
                      messages from Ierada.
                    </a>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !isOver18 ||
                    !mobileVerified ||
                    !aadhaarVerified ||
                    !panVerified ||
                    !gstVerified
                  }
                  className="w-full bg-black text-white py-3 rounded-lg disabled:bg-gray-300"
                >
                  {isSubmitting ? "Submitting..." : "Submit Registration"}
                </button>

                <div className="text-center mt-4">
                  <Link
                    to={`${config.VITE_BASE_WEBSITE_URL}/signin-vendor`}
                    className="text-blue-600 hover:underline"
                  >
                    Already registered? Sign in
                  </Link>
                </div>
              </div>
            </>
          )}
        </form>

        {showOtpModal && (
          <OtpModal
            phone={formData.phone}
            otp={otp}
            setOtp={setOtp}
            errors={errors}
            setErrors={setErrors}
            isLoading={isLoading}
            otpTimerActive={otpTimerActive}
            counter={counter}
            handleSendOtp={handleSendOtp}
            handleVerifyOtp={
              step === "mobile" ? handleVerifyMobileOtp : handleVerifyAadhaarOtp
            }
            setShowOtpModal={setShowOtpModal}
            otpRefs={otpRefs}
            digitCount={step === "mobile" ? 4 : 6}
          />
        )}

        {showCaptchaModal && (
          <CaptchaModal
            captcha={captcha}
            aadhaarNumber={formData.adhaarNumber}
            setAadhaarNumber={(value) =>
              setFormData((prev) => ({ ...prev, adhaarNumber: value }))
            }
            errors={errors}
            setErrors={setErrors}
            initiateKYC={initiateKYC}
            reloadCaptcha={handleReloadCaptcha}
            sessionId={sessionId}
            vendorTempId={vendorTempId}
            setShowCaptchaModal={setShowCaptchaModal}
            handleGenerateOtp={handleGenerateOtp}
          />
        )}

        <Modal
          isOpen={filePreview.isOpen}
          onClose={() =>
            setFilePreview({ isOpen: false, file: null, type: "" })
          }
        >
          {filePreview.file &&
            (filePreview.type === "application/pdf" ? (
              <object
                data={filePreview.file}
                type="application/pdf"
                width="100%"
                height="500px"
              >
                <p>
                  It appears you don't have a PDF plugin for this browser. You
                  can{" "}
                  <a href={filePreview.file} target="_blank" rel="noreferrer">
                    click here to download the PDF file
                  </a>
                  .
                </p>
              </object>
            ) : (
              <img
                src={filePreview.file}
                alt="Document preview"
                className="max-w-full max-h-[70vh] mx-auto"
              />
            ))}
        </Modal>
      </div>
    </div>
  );
};

export default BecomeSellerForm;
