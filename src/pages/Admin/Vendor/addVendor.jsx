import React, { useState, useEffect } from "react";
import { Camera, Upload, Eye, X, CheckCircle } from "lucide-react";
import { registerVendorByAdmin } from "../../../services/api.auth";
import { v4 as uuidv4 } from "uuid";
import { notifyOnFail } from "../../../utils/notification/toast";
import { useNavigate, useParams } from "react-router";
import { getVendorById, updateVendor } from "../../../services/api.vendor";
import {
  initiateKYCSession,
  adminVerifyPAN,
  adminVerifyGST,
} from "../../../services/api.kyc";
import config from "../../../config/config";
import { formatCaptchaImage } from "../../../utils/captcha";

const AdminVendorForm = () => {
  const vendorId = useParams().id;
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
  const [isLoading, setIsLoading] = useState(false);
  const [isOver18, setIsOver18] = useState(false);
  const [panVerified, setPanVerified] = useState(false);
  const [gstVerified, setGstVerified] = useState(false);
  const [vendorTempId, setVendorTempId] = useState(uuidv4());
  const [sessionId, setSessionId] = useState(null);
  const [captcha, setCaptcha] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (vendorId) {
      fetchVendor();
    } else {
      const tempId = uuidv4();
      setVendorTempId(tempId);
      initiateKYC(tempId);
    }
  }, [vendorId]);

  useEffect(() => {
    const age = calculateAge(formData.birthday);
    setIsOver18(age !== null && age >= 18);
  }, [formData.birthday]);

  const initiateKYC = async (tempId) => {
    try {
      const response = await initiateKYCSession(tempId);
      setSessionId(response.data.sessionId);
      const formattedCaptcha = formatCaptchaImage(response.data.captcha);
      setCaptcha(formattedCaptcha);
      // setShowCaptchaModal(true);
    } catch (error) {
      notifyOnFail(error.message || "Failed to initiate KYC");
    }
  };

  const fetchVendor = async () => {
    try {
      setIsLoading(true);
      const { data } = await getVendorById(vendorId);
      setFormData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phone: data.phone || "",
        gender: data.gender || "",
        birthday: data.birthday || "",
        shopName: data.shopName || "",
        shopAddress: data.shopAddress || "",
        panNumber: data.panNumber || "",
        adhaarNumber: data.adhaarNumber || "",
        gstin: data.gstin || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        zipCode: data.zipCode || "",
      });
      setPanVerified(!!data.panNumber);
      setGstVerified(!!data.gstin);
    } catch (error) {
      notifyOnFail(error.message || "Failed to fetch vendor");
    } finally {
      setIsLoading(false);
    }
  };

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
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    const phoneError = validateMobile(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    if (!formData.gender) newErrors.gender = "Gender is required";

    if (!formData.birthday) {
      newErrors.birthday = "Date of birth is required";
    } else {
      const age = calculateAge(formData.birthday);
      if (age !== null && age < 18) {
        newErrors.birthday = "You must be at least 18 years old to register";
      }
    }

    if (!formData.shopName.trim()) newErrors.shopName = "Shop name is required";
    if (!formData.shopAddress.trim())
      newErrors.shopAddress = "Shop address is required";

    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "Zip code is required";

    if (!formData.panNumber.trim()) {
      newErrors.panNumber = "PAN number is required";
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber.trim())) {
      newErrors.panNumber = "Invalid PAN format";
    }
    if (!panVerified)
      newErrors.panNumber =
        (newErrors.panNumber ? newErrors.panNumber + ". " : "") +
        "PAN must be verified";

    if (!formData.adhaarNumber.trim()) {
      newErrors.adhaarNumber = "Aadhaar number is required";
    } else if (
      formData.adhaarNumber.length !== 12 ||
      !/^\d{12}$/.test(formData.adhaarNumber)
    ) {
      newErrors.adhaarNumber = "Valid 12-digit Aadhaar number is required";
    }

    if (!formData.gstin.trim()) {
      newErrors.gstin = "GSTIN is required";
    }
    if (!gstVerified)
      newErrors.gstin =
        (newErrors.gstin ? newErrors.gstin + ". " : "") +
        "GST must be verified";

    const requireFiles = !vendorId;
    if (requireFiles) {
      if (!files.panCardFile)
        newErrors.panCardFile = "PAN card file is required";
      if (!files.adhaarCardFile)
        newErrors.adhaarCardFile = "Aadhaar card file is required";
      if (!files.gstFile) newErrors.gstFile = "GST file is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;

    if (id === "panNumber" || id === "gstin") {
      setFormData((prev) => ({ ...prev, [id]: value.toUpperCase() }));
      if (id === "panNumber") setPanVerified(false);
      if (id === "gstin") setGstVerified(false);
    } else if (id === "phone" || id === "zipCode" || id === "adhaarNumber") {
      if (/^\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [id]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }

    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: "" }));
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
      const name = `${formData.firstName} ${formData.lastName}`.trim();
      if (!name) {
        throw new Error("Full name is required for PAN verification");
      }
      await adminVerifyPAN(formData.panNumber, name, vendorTempId);
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
      const response = await adminVerifyGST(formData.gstin, vendorTempId);
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

      if (vendorId) {
        formDataToSend.append("vendorId", vendorId);
        await updateVendor(formDataToSend);
        // notifyOnSuccess("Vendor updated successfully");
      } else {
        formDataToSend.append("vendorTempId", vendorTempId);
        await registerVendorByAdmin(formDataToSend);
        navigate(`${config.VITE_BASE_ADMIN_URL}/vendors`);
      }
    } catch (error) {
      notifyOnFail(error.message || "Error submitting vendor");
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

  const renderInput = (
    id,
    label,
    value,
    type = "text",
    maxLength = undefined
  ) => (
    <div className="relative">
      <input
        type={type}
        id={id}
        value={value}
        onChange={handleInputChange}
        maxLength={maxLength}
        className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray peer"
      />
      <label className="absolute text-base text-gray-500 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-gray peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">
        {label}
      </label>
      {errors[id] && <p className="text-red-500 text-xs mt-1">{errors[id]}</p>}
    </div>
  );

  const renderVerifiableInput = (id, label, value, verified, onVerify) => (
    <div className="relative">
      <input
        type="text"
        id={id}
        value={value}
        onChange={handleInputChange}
        className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray peer"
        readOnly={verified}
        maxLength={id === "panNumber" ? "10" : "15"}
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

  if (vendorId && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading vendor details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-4xl w-full p-6">
        <h1 className="text-2xl lg:text-4xl font-semibold text-center mb-10">
          {vendorId ? "Edit Vendor" : "Add New Vendor"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray peer"
                required
              />
              <label className="absolute text-base text-gray-500 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-gray peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">
                First Name
              </label>
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
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
              />
              <label className="absolute text-base text-gray-500 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-gray peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">
                Last Name
              </label>
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
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
              >
                <option value="" disabled></option>
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
                value={formData.birthday}
                onChange={handleInputChange}
                max={
                  new Date(
                    new Date().setFullYear(new Date().getFullYear() - 18)
                  )
                    .toISOString()
                    .split("T")[0]
                }
                className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray peer"
                required
              />
              <label className="absolute text-base text-gray-500 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-gray peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">
                Date of Birth
              </label>
              {errors.birthday && (
                <p className="text-red-500 text-xs mt-1">{errors.birthday}</p>
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
                <p className="text-red-500 text-xs mt-1">{errors.shopName}</p>
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
              />
              <label className="absolute text-base text-gray-500 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-gray peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">
                Address
              </label>
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
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
              />
              <label className="absolute text-base text-gray-500 duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-gray peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">
                Zip Code
              </label>
              {errors.zipCode && (
                <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {renderInput("phone", "Phone Number", formData.phone, "tel", 10)}
            {renderInput(
              "adhaarNumber",
              "Aadhaar Number",
              formData.adhaarNumber,
              "text",
              12
            )}
            {renderVerifiableInput(
              "panNumber",
              "PAN Number",
              formData.panNumber,
              panVerified,
              handleVerifyPan
            )}
            {renderVerifiableInput(
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
              Please upload clear copies of the following documents. Accepted
              formats: JPG, PNG, PDF (Max 5MB)
            </p>
            <div className="flex flex-wrap -mx-2">{renderFileInputs()}</div>
          </div>

          <div className="space-y-6">
            <button
              type="submit"
              disabled={isSubmitting || !isOver18 || isLoading}
              className="w-full bg-black text-white py-3 rounded-lg disabled:bg-gray-300"
            >
              {isSubmitting
                ? "Submitting..."
                : vendorId
                ? "Update Vendor"
                : "Add Vendor"}
            </button>
          </div>
        </form>

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

export default AdminVendorForm;
