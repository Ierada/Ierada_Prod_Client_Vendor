import React, { useEffect, useRef, useState } from "react";
import { AccountInfo } from "../../../components/Website/AccountInfo";
import {
  getUserDetails,
  updateUserDetails,
} from "../../../services/api.customer";
import { useAppContext } from "../../../context/AppContext";
import { MdOutlineEdit } from "react-icons/md";
import CommonTopBanner from "../../../components/Website/CommonTopBanner";
import common_top_banner from "/assets/banners/Commen-top-banner.png";
import { formatDateForCalander } from "../../../utils/date&Time/dateAndTimeFormatter";
import userDefaultImage from "../../../../public/assets/user/person-circle.png";
import { CheckCircle } from "lucide-react";
import { sendOtp, verifyOtp } from "../../../services/api.auth";
import { use } from "react";

const bannerData = [
  {
    id: 1,
    image: common_top_banner,
  },
];

const ProfileProgress = ({ percentage }) => {
  const circleRadius = 50;
  const circleCircumference = 2 * Math.PI * circleRadius;

  const strokeDashoffset =
    circleCircumference - (percentage / 100) * circleCircumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-10 h-10">
        <svg
          className="w-full h-full"
          viewBox="0 0 120 120"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="text-gray-300"
            stroke="currentColor"
            strokeWidth="10"
            fill="none"
            cx="60"
            cy="60"
            r={circleRadius}
          />
          <circle
            className="text-black"
            stroke="currentColor"
            strokeWidth="15"
            fill="none"
            cx="60"
            cy="60"
            r={circleRadius}
            strokeDasharray={circleCircumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[12px] text-gray-700">{percentage}%</span>
        </div>
      </div>
      <p className="mt-4 text-sm text-[black]">Complete your profile</p>
    </div>
  );
};

const RenderOtpModal = ({
  editableFields,
  setShowOtpModal,
  isLoading,
  setIsLoading,
  fetchUserDetails,
  user,
}) => {
  // if (!showOtpModal) return null;

  const [otp, setOtp] = useState(["", "", "", ""]);
  const otpRefs = useRef([]);

  const handleVerifyOtp = async () => {
    setIsLoading(true);

    const value = editableFields.email;

    const res = await verifyOtp(user.id, {
      type: "email",
      value,
      otp: parseInt(otp.join(""), 10),
    });

    if (res) {
      fetchUserDetails();
      setShowOtpModal(false);
    }

    setOtp(["", "", "", ""]);
    setIsLoading(false);
  };

  // OTP handling functions
  const handleOtpChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < otp.length - 1) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-semibold">Enter OTP</h2>
            <p className="text-base text-gray-600">
              OTP sent to {editableFields.email}
            </p>
          </div>

          <div className="flex justify-between gap-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (otpRefs.current[index] = el)}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                onKeyDown={(e) => handleOtpKeyDown(e, index)}
                className="w-14 h-14 text-center border rounded-lg focus:ring-2 focus:ring-black text-xl font-semibold"
                maxLength={1}
              />
            ))}
          </div>

          {/* <div className='flex justify-between text-sm'>
              <button
                disabled={counter > 0 || isLoading}
                onClick={() => {
                  setCounter(60);
                  handleSendOtp(verificationInProgress);
                }}
                className='text-gray-900 disabled:text-gray-400'
              >
                Resend OTP
              </button>
              <span>{`00:${counter < 10 ? `0${counter}` : counter}`}</span>
            </div> */}

          <div className="flex gap-4">
            <button
              onClick={() => {
                setShowOtpModal(false);
                setOtp(["", "", "", ""]);
              }}
              disabled={isLoading}
              className={`${
                isLoading && "opacity-50"
              } w-1/2 border border-gray-300 text-gray-700 py-3 rounded-lg`}
            >
              Cancel
            </button>
            <button
              onClick={handleVerifyOtp}
              disabled={otp.some((digit) => !digit) || isLoading}
              className="w-1/2 bg-[#737A6C] text-white py-3 rounded-lg disabled:bg-gray-300"
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { user } = useAppContext();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    birthday: "",
    phone: "",
    gender: "",
    status: "",
  });

  const [editableFields, setEditableFields] = useState({});

  const [image, setImage] = useState("");
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserDetails = async () => {
    const res = await getUserDetails(user.id);
    if (!res) return;

    const data = res.data;
    const updatedData = {
      first_name: data.customerDetails.first_name || "",
      last_name: data.customerDetails.last_name || "",
      email: data.email || "",
      birthday: data.customerDetails.birthday
        ? formatDateForCalander(data.customerDetails.birthday)
        : "",
      phone: data.phone || "",
      gender: data.customerDetails.gender || "",
      marital_status: data.customerDetails.marital_status || "",
      marital_anniversary: data.customerDetails.marital_anniversary
        ? formatDateForCalander(data.customerDetails.marital_anniversary)
        : "",
      isEmailVerified: data.isEmailVerified,
      isMobileVerified: data.isMobileVerified,
    };

    setFormData(updatedData);
    setEditableFields(updatedData);
    setImage(data.customerDetails.avatar || userDefaultImage);
    calculateCompletionPercentage({ ...updatedData });
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const [errors, setErrors] = useState({});

  const calculateCompletionPercentage = (data) => {
    const fields = Object.keys(data).filter((field) => field !== "avatar");

    const filledFields = fields.filter((field) => {
      if (typeof data[field] === "string") {
        return data[field].trim() !== "";
      }
      return data[field] !== null && data[field] !== undefined;
    });

    const percentage = Math.round((filledFields.length / fields.length) * 100);

    setCompletionPercentage(percentage);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableFields((prevFormData) => {
      const updatedData = { ...prevFormData, [name]: value };
      calculateCompletionPercentage({ ...updatedData, image });
      return updatedData;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size should be less than 5MB",
        }));
        return;
      }
      const imageURL = URL.createObjectURL(file);
      setImage(imageURL);
      setEditableFields((prevFormData) => {
        const updatedData = { ...prevFormData, userAvatar: { file } };
        calculateCompletionPercentage({ ...updatedData, image: imageURL });
        return updatedData;
      });
    }
  };

  const handleUpdateProfile = async () => {
    const formatDate = (savedDate) => {
      const date = new Date(savedDate);
      const formattedDate = date.toISOString().slice(0, 10);
      return formattedDate;
    };
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      const submitData = new FormData();
      Object.keys(editableFields).forEach((key) => {
        if (
          key !== "userAvatar" &&
          key !== "birthday" &&
          key !== "marital_anniversary"
        ) {
          submitData.append(key, editableFields[key]);
        }
      });

      if (editableFields.userAvatar && editableFields.userAvatar.file) {
        submitData.append("userAvatar", editableFields.userAvatar.file);
      }

      if (editableFields.birthday !== formData.birthday) {
        submitData.append("birthday", formatDate(editableFields.birthday));
      }

      if (
        editableFields.marital_status === "married" &&
        editableFields.marital_anniversary &&
        editableFields.marital_anniversary !== formData.marital_anniversary
      ) {
        submitData.append(
          "marital_anniversary",
          formatDate(editableFields.marital_anniversary)
        );
      }

      const res = await updateUserDetails(user.id, submitData);
      if (res) {
        fetchUserDetails();
        setIsEditMode(false);
      }
    }
  };

  const validateForm = () => {
    const validationErrors = {};

    if (!editableFields.first_name.trim()) {
      validationErrors.first_name = "First Name is required";
    }

    if (!editableFields.last_name.trim()) {
      validationErrors.last_name = "Last Name is required";
    }

    if (
      editableFields.birthday === "Invalid date" ||
      !editableFields.birthday.trim()
    )
      if (
        editableFields.marital_status === "married" &&
        (!editableFields.marital_anniversary ||
          editableFields.marital_anniversary === "Invalid date")
      )
        // {
        //   validationErrors.birthday = "Birthday is required";
        // }

        if (!image) {
          // {
          //   validationErrors.marital_anniversary = "Marital Anniversary is required";
          // }

          validationErrors.image = "Profile image is required";
        }

    if (editableFields.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editableFields.email)) {
        validationErrors.email = "Invalid email format";
      }
    }

    setErrors(validationErrors); // Update errors in state
    return validationErrors; // Return errors for further use
  };

  const handleSendOtp = async (type = "email") => {
    setIsLoading(true);
    setErrors({});
    // setVerificationInProgress(type);

    const payload = {
      type,
      value: editableFields.email,
      verifiedValue: formData.phone,
    };

    const res = await sendOtp(payload);

    if (res) {
      setShowOtpModal(true);
    }

    setIsLoading(false);
  };

  // Validation functions
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const renderVerificationButton = () => {
    const value = editableFields.email;
    const isValid = validateEmail(value);
    const isVerified = formData.isEmailVerified;

    if (
      (!value || !isValid || isVerified) &&
      formData.email === editableFields.email
    )
      return null;

    return (
      <button
        onClick={() => handleSendOtp("email")}
        // disabled={isLoading}
        className="mt-2 text-sm text-blue-600 hover:underline"
      >
        Verify Email
      </button>
    );
  };

  return (
    <>
      <main>
        {/* <CommonTopBanner bannerData={bannerData} /> */}

        <section className="w-full">
          <div className="text-center my-10 text-[#000000]">
            <h1 className="text-2xl lg:text-4xl font-semibold mb-2 font-Playfair">
              My Account
            </h1>
            <p className=" text-sm lg:text-base font-Lato font-medium ">
              Home / My Account
            </p>
          </div>
          <div className="bg-white px-4 md:px-5 lg:px-20 flex flex-col md:flex-row gap-10">
            <div className="w-full md:w-1/3 lg:w-1/4">
              <AccountInfo activeSection="profile" />
            </div>
            <div className="mt-10 md:w-4/5">
              <div className="flex justify-between mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden">
                    <img
                      src={image}
                      alt="Profile"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  {isEditMode && (
                    <label
                      htmlFor="fileInput"
                      className="absolute right-0 bottom-2 w-6 h-6 bg-black text-white flex items-center justify-center rounded-full cursor-pointer"
                    >
                      <MdOutlineEdit className="text-lg" />
                    </label>
                  )}
                  <input
                    id="fileInput"
                    type="file"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                    accept="image/*"
                  />
                </div>
                <div className="flex items-center justify-center">
                  <ProfileProgress percentage={completionPercentage} />
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Profile Details</h2>
                <button
                  className="text-black bg-gray-200 px-4 py-2 rounded"
                  onClick={() => {
                    isEditMode
                      ? (() => {
                          setIsEditMode(false);
                          setErrors({});
                        })()
                      : setIsEditMode(true);
                  }}
                >
                  {isEditMode ? "Cancel" : "Edit"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(formData).map((key) => {
                  if (
                    key === "userAvatar" ||
                    (key === "marital_anniversary" &&
                      (formData.marital_status === "single" ||
                        !formData.marital_status)) ||
                    key === "isEmailVerified" ||
                    key === "isMobileVerified"
                  ) {
                    return null;
                  }

                  return isEditMode &&
                    (key === "birthday" ||
                      key === "marital_status" ||
                      key === "marital_anniversary" ||
                      key === "gender") ? null : (
                    <div className="relative w-full" key={key}>
                      <input
                        type="text"
                        name={key}
                        className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border ${
                          isEditMode ? "border-gray-300" : "border-transparent"
                        } appearance-none focus:outline-gray-300 focus:ring-0 focus:border-none ${
                          key === "phone"
                            ? "cursor-not-allowed bg-gray-600"
                            : ""
                        } `}
                        value={
                          isEditMode ? editableFields[key] : formData[key] || ""
                        }
                        onChange={handleInputChange}
                        readOnly={!isEditMode || key === "phone"}
                        placeholder=" "
                      />
                      <label
                        htmlFor={key}
                        className="absolute flex items-center gap-1 text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75"
                      >
                        {key.replace("_", " ").toUpperCase()}
                        {/* Show green check for email or phone verification */}
                        {((key === "email" && formData.isEmailVerified) ||
                          (key === "phone" && formData.isMobileVerified)) && (
                          <CheckCircle className="text-green-500 w-4 h-4" />
                        )}
                      </label>
                      {isEditMode &&
                        key === "email" &&
                        editableFields.email !== "" &&
                        renderVerificationButton()}
                      {errors[key] && (
                        <span className="text-sm text-red-500">
                          {errors[key]}
                        </span>
                      )}
                    </div>
                  );
                })}
                {isEditMode && (
                  <>
                    <div className="relative w-full">
                      <input
                        type="date"
                        name="birthday"
                        id="birthday"
                        value={editableFields.birthday || ""}
                        onChange={handleInputChange}
                        className="peer block w-full px-3 py-3 border border-gray-300 shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                      />
                      <label
                        htmlFor="birthday"
                        className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75"
                      >
                        BIRTHDAY
                      </label>
                      {errors.birthday && (
                        <span className="text-sm text-red-500">
                          {errors.birthday}
                        </span>
                      )}
                    </div>
                    <div className="relative w-full">
                      <select
                        name="gender"
                        value={editableFields.gender || ""}
                        onChange={handleInputChange}
                        className="peer block w-full px-3 py-3 border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                      >
                        <option value="" disabled>
                          Select Gender
                        </option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>

                      <label
                        htmlFor="gender"
                        className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75"
                      >
                        GENDER
                      </label>
                      {errors.gender && (
                        <span className="text-sm text-red-500">
                          {errors.gender}
                        </span>
                      )}
                    </div>
                    <div className="relative w-full">
                      <select
                        name="marital_status"
                        value={editableFields.marital_status || ""}
                        onChange={handleInputChange}
                        className="peer block w-full px-3 py-3 border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                      >
                        <option value="" disabled>
                          Select Marital Status
                        </option>
                        <option value="married">Married</option>
                        <option value="single">Single</option>
                      </select>

                      <label
                        htmlFor="gender"
                        className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75"
                      >
                        Marital Status
                      </label>
                    </div>
                    {editableFields.marital_status === "married" && (
                      <div className="relative w-full">
                        <input
                          type="date"
                          name="marital_anniversary"
                          id="marital_anniversary"
                          value={editableFields.marital_anniversary || ""}
                          onChange={handleInputChange}
                          className="peer  block w-full px-3 py-3 border border-gray-300  shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                          placeholder=" " // This placeholder is necessary for the label to function properly
                        />
                        <label
                          htmlFor="birthday"
                          className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75"
                        >
                          MARITAL ANNIVERSARY
                        </label>
                        {errors.marital_anniversary && (
                          <span className="text-sm text-red-500">
                            {errors.marital_anniversary}
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {isEditMode && (
                <div className="my-6 flex justify-end">
                  <button
                    className="bg-black text-white px-6 py-2 rounded"
                    onClick={handleUpdateProfile}
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
        {showOtpModal && (
          <RenderOtpModal
            editableFields={editableFields}
            setShowOtpModal={setShowOtpModal}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            fetchUserDetails={fetchUserDetails}
            user={user}
          />
        )}
      </main>
    </>
  );
};

export default ProfilePage;
