import { useEffect, useState } from "react";
import { useAppContext } from "../../../context/AppContext";
import {
  editAdmin,
  getAdminByUserId,
  toggleAdmin2FA,
  verifyAdmin2FA,
} from "../../../services/api.admin";
import { Edit, X } from "lucide-react";
import { FaCheck } from "react-icons/fa";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import {
  notifyOnFail,
  notifyOnSuccess,
} from "../../../utils/notification/toast";
import { changePassword } from "../../../services/api.auth";

const INITIAL_STATE = {
  name: "",
  email: "",
  phone: "",
  address: "",
  permissions: {},
  avatar: "",
  Password: "",
  newPassword: "",
  confirmPassword: "",
};

const calculateProfileCompletion = (userData) => {
  const requiredFields = ["name", "email", "phone", "address"];
  const filledFields = requiredFields.filter((field) =>
    userData[field]?.trim()
  );
  return Math.round((filledFields.length / requiredFields.length) * 100);
};

const AdminProfile = () => {
  const { user } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(INITIAL_STATE);
  const [previews, setPreviews] = useState({});
  const [showPreviews, setShowPreviews] = useState({});
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [otp, setOtp] = useState("");
  // Password form states
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    color: "",
  });
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    Password: "",
    newPassword: [],
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePreview = (field, dataUrl) => {
    setPreviews((prev) => ({ ...prev, [field]: dataUrl }));
    setUserData((prev) => ({ ...prev, [field]: dataUrl }));
  };

  const togglePreview = (field) => {
    setShowPreviews((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    if (!password) return { score: 0, label: "", color: "bg-gray-200" };

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    const strengthMap = {
      0: { label: "", color: "bg-gray-200" },
      1: { label: "Weak", color: "bg-red-500" },
      2: { label: "Fair", color: "bg-orange-500" },
      3: { label: "Good", color: "bg-yellow-500" },
      4: { label: "Strong", color: "bg-blue-500" },
      5: { label: "Very Strong", color: "bg-green-500" },
    };

    return { score, ...strengthMap[score] };
  };

  // Password validation
  const validatePassword = (name, value) => {
    if (name === "Password" && !value) {
      setValidationErrors((prev) => ({
        ...prev,
        Password: "Current password is required",
      }));
    } else if (name === "Password" && value) {
      setValidationErrors((prev) => ({ ...prev, Password: "" }));
    }

    if (name === "newPassword") {
      const errors = [];
      if (value.length < 8) errors.push("At least 8 characters");
      if (!/[a-z]/.test(value)) errors.push("One lowercase letter");
      if (!/[A-Z]/.test(value)) errors.push("One uppercase letter");
      if (!/[0-9]/.test(value)) errors.push("One number");
      if (!/[^a-zA-Z0-9]/.test(value)) errors.push("One special character");

      setPasswordStrength(calculatePasswordStrength(value));
      setValidationErrors((prev) => ({ ...prev, newPassword: errors }));
    }

    if (name === "confirmPassword") {
      const message =
        value !== userData.newPassword ? "Passwords do not match" : "";
      setValidationErrors((prev) => ({ ...prev, confirmPassword: message }));
    }
  };

  // Re-validate confirmPassword whenever newPassword changes
  useEffect(() => {
    if (userData.confirmPassword) {
      validatePassword("confirmPassword", userData.confirmPassword);
    }
  }, [userData.newPassword]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
    validatePassword(name, value);
  };

  const handleTogglePassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const isPasswordSubmitDisabled =
    !userData.Password ||
    !userData.newPassword ||
    !userData.confirmPassword ||
    validationErrors.newPassword.length > 0 ||
    validationErrors.confirmPassword;

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (isPasswordSubmitDisabled) {
      notifyOnFail("Please fix all errors before submitting");
      return;
    }

    if (!user.id) {
      notifyOnFail(
        "User ID is missing. Please try again later or contact support."
      );
      return;
    }

    setIsSubmittingPassword(true);

    try {
      const response = await changePassword(user.id, {
        Password: userData.Password,
        newPassword: userData.newPassword,
        confirmPassword: userData.confirmPassword,
      });

      if (response.status === 1) {
        setShowSuccessModal(true);
        setUserData((prev) => ({
          ...prev,
          Password: "",
          newPassword: "",
          confirmPassword: "",
        }));
        setValidationErrors({
          Password: "",
          newPassword: [],
          confirmPassword: "",
        });
        setPasswordStrength({ score: 0, label: "", color: "bg-gray-200" });
      }
    } catch (err) {
      notifyOnFail("An error occurred. Please try again.");
      console.error("Password change error:", err);
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const checkRequirement = (requirement) => {
    switch (requirement) {
      case "length":
        return userData.newPassword.length >= 8;
      case "lowercase":
        return /[a-z]/.test(userData.newPassword);
      case "uppercase":
        return /[A-Z]/.test(userData.newPassword);
      case "number":
        return /[0-9]/.test(userData.newPassword);
      case "special":
        return /[^a-zA-Z0-9]/.test(userData.newPassword);
      default:
        return false;
    }
  };

  const fetchUserDetails = async (id) => {
    try {
      setIsLoading(true);
      const response = await getAdminByUserId(id);
      const responseData = response.data;
      if (!response) {
        notifyOnFail("Failed to fetch Admin details");
        return;
      }

      const adminData = responseData;
      const newUserData = {
        name: adminData?.name || "",
        email: adminData?.email || "",
        phone: adminData?.phone?.replace("+91", "") || "",
        address: adminData?.address || "",
        permissions: adminData?.permissions || {},
        userAvatar: adminData.avatar || "",
        is_2fa_enabled: adminData?.is_2fa_enabled || false,
        two_factor_type: adminData?.two_factor_type || "none",
        Password: "",
        newPassword: "",
        confirmPassword: "",
      };

      setUserData(newUserData);
      setPreviews(newUserData);
      setImage(adminData.avatar);
      setCompletionPercentage(calculateProfileCompletion(newUserData));
    } catch (error) {
      console.error("Error fetching admin details:", error);
      notifyOnFail("Error loading admin details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchUserDetails(user.id);
  }, [user?.id]);

  const handleProfileUpdate = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();

      Object.entries(userData).forEach(([key, value]) => {
        if (
          value &&
          ![
            "userAvatar",
            "permissions",
            "is_2fa_enabled",
            "two_factor_type",
            "Password",
            "newPassword",
            "confirmPassword",
          ].includes(key) &&
          !value.toString().includes("data:")
        ) {
          formData.append(key, value);
        }
      });

      const fileUpdates = {
        userAvatar: "avatar",
      };

      for (const [frontendKey, backendKey] of Object.entries(fileUpdates)) {
        const fileData = userData[frontendKey];

        if (fileData && fileData.toString().includes("data:")) {
          const base64Response = await fetch(fileData);
          const blob = await base64Response.blob();

          const mimeType =
            base64Response.headers.get("content-type") || blob.type;
          const extension = mimeType.split("/")[1];

          const file = new File([blob], `${backendKey}.${extension}`, {
            type: mimeType,
          });

          formData.append(frontendKey, file);
        }
      }

      const response = await editAdmin(user.id, formData);

      if (response?.status === 1) {
        await fetchUserDetails(user.id);
        setIsEditing(false);
      } else {
        notifyOnFail(response?.message || "Update failed");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      notifyOnFail("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    try {
      setIsLoading(true);
      const data = { enable: !userData.is_2fa_enabled };
      const response = await toggleAdmin2FA(user.id, data);
      if (response.status === 1) {
        if (response.requires_otp) {
          setShow2FAModal(true);
          notifyOnSuccess(response.message);
        } else {
          notifyOnSuccess(response.message);
          await fetchUserDetails(user.id);
          setOtp("");
          setShow2FAModal(false);
        }
      } else {
        notifyOnFail(response.message || "Failed to toggle 2FA");
      }
    } catch (error) {
      console.error("Error toggling 2FA:", error);
      notifyOnFail("Failed to toggle 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!otp) {
      notifyOnFail("Please enter the OTP");
      return;
    }
    try {
      setIsLoading(true);
      const response = await verifyAdmin2FA(user.id, { otp });
      if (response.status === 1) {
        notifyOnSuccess(response.message);
        await fetchUserDetails(user.id);
        setOtp("");
        setShow2FAModal(false);
      } else {
        notifyOnFail(response.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("Error verifying 2FA:", error);
      notifyOnFail("Failed to verify 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (label, name, type = "text") => {
    const value = userData[name] || "";

    if (isEditing) {
      return (
        <div className="flex flex-col text-sm w-full">
          <label className="text-gray-600 mb-1">{label}</label>
          <input
            className="border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            type={type}
            name={name}
            value={value}
            onChange={handleChange}
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col text-sm w-full">
        <label className="text-gray-600 mb-1">{label}</label>
        <p className="p-2 bg-gray-50 rounded-md text-gray-800">
          {value || "-"}
        </p>
      </div>
    );
  };

  const renderPermissions = () => {
    const permissions = userData.permissions || {};

    return (
      <div>
        <h2 className="text-xl font-semibold my-4 text-[#333843]">Roles</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="text-sm text-[#9593A0] font-extralight">
                <th className="p-4 text-left">Privileges</th>
                <th className="p-4">Add</th>
                <th className="p-4">View</th>
                <th className="p-4">Update</th>
                <th className="p-4">Delete</th>
              </tr>
            </thead>
            <tbody>
              {permissions && Object.keys(permissions).length > 0 ? (
                Object.entries(permissions).map(([moduleName, actions]) => (
                  <tr key={moduleName} className="border-t">
                    <td className="p-4 text-left text-sm font-medium text-[#23272E] capitalize">
                      {moduleName}
                    </td>
                    {["add", "view", "edit", "delete"].map((action) => (
                      <td key={action} className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={actions[action] || false}
                          readOnly
                          className="h-5 w-5 text-[#F47954] focus:ring-[#F47954] border-gray-300 checked:bg-[#F47954]"
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="p-4 text-center text-sm text-gray-500"
                  >
                    No permissions available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (isLoading && !userData.name) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 border-b pb-6 gap-4">
            <div className="flex items-center mechanography">
              <div className="flex items-center space-x-2 md:space-x-4">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                  <img
                    src={userData.userAvatar || "/images/default-avatar.png"}
                    alt="Profile"
                    className="object-cover w-full h-full"
                  />
                  {isEditing && (
                    <label
                      htmlFor="upload-avatar"
                      className="absolute bottom-2 bg-gray-100 p-1 rounded-full shadow cursor-pointer"
                    >
                      <Edit className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                    </label>
                  )}
                  <input
                    id="upload-avatar"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () =>
                          handlePreview("userAvatar", reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>

                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                    {userData.name}
                  </h2>
                  <p className="text-xs md:text-base text-gray-500">
                    Admin ID: {user?.id}
                  </p>
                </div>
              </div>
            </div>

            {isEditing ? (
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    fetchUserDetails(user.id);
                  }}
                  className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleProfileUpdate}
                  className="px-4 py-2 text-white bg-[#F47954] rounded-md flex items-center space-x-2 disabled:opacity-50"
                  disabled={isLoading}
                >
                  <span>{isLoading ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-[#F47954] rounded-md flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          <div className="space-y-8">
            <section>
              <div className="flex items-center justify-between -mt-10">
                <h3 className="text-lg font-semibold text-gray-800">
                  Personal Information
                </h3>
                <div className="relative h-24 w-24">
                  <svg className="transform -rotate-90 w-24 h-24">
                    <circle
                      cx="48"
                      cy="48"
                      r="36"
                      stroke="#E5E7EB"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="36"
                      stroke="#F47954"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${completionPercentage * 2.26}, 226`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="text-md font-semibold text-[#F47954]">
                      {completionPercentage}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField("Name", "name")}
                {renderField("Address", "address")}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {renderField("Email", "email", "email")}
                {renderField("Phone Number", "phone", "tel")}
              </div>
            </section>

            <section className="pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Change Password
              </h3>
              <div className="space-y-6">
                {/* Current Password */}
                <div className="relative">
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.current ? "text" : "password"}
                      name="Password"
                      value={userData.Password}
                      onChange={handlePasswordChange}
                      className={`block w-full rounded-md border ${
                        validationErrors.Password
                          ? "border-red-500"
                          : "border-gray-200"
                      } p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200`}
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() => handleTogglePassword("current")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword.current ? (
                        <MdVisibility size={20} />
                      ) : (
                        <MdVisibilityOff size={20} />
                      )}
                    </button>
                  </div>
                  {validationErrors.Password && (
                    <p className="text-red-600 text-sm mt-1">
                      {validationErrors.Password}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.new ? "text" : "password"}
                      name="newPassword"
                      value={userData.newPassword}
                      onChange={handlePasswordChange}
                      className={`block w-full rounded-md border ${
                        validationErrors.newPassword.length > 0
                          ? "border-red-500"
                          : "border-gray-200"
                      } p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => handleTogglePassword("new")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword.new ? (
                        <MdVisibility size={20} />
                      ) : (
                        <MdVisibilityOff size={20} />
                      )}
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  {userData.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${passwordStrength.color}`}
                            style={{
                              width: `${(passwordStrength.score / 5) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {passwordStrength.label}
                        </span>
                      </div>

                      {/* Password requirements */}
                      <div className="grid grid-cols-2 gap-1 mt-2">
                        <div
                          className={`text-xs flex items-center gap-1 ${
                            checkRequirement("length")
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          <div className="w-3 h-3 rounded-full flex items-center justify-center bg-gray-100">
                            {checkRequirement("length") && <FaCheck size={8} />}
                          </div>
                          <span>8+ characters</span>
                        </div>
                        <div
                          className={`text-xs flex items-center gap-1 ${
                            checkRequirement("lowercase")
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          <div className="w-3 h-3 rounded-full flex items-center justify-center bg-gray-100">
                            {checkRequirement("lowercase") && (
                              <FaCheck size={8} />
                            )}
                          </div>
                          <span>Lowercase letter</span>
                        </div>
                        <div
                          className={`text-xs flex items-center gap-1 ${
                            checkRequirement("uppercase")
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          <div className="w-3 h-3 rounded-full flex items-center justify-center bg-gray-100">
                            {checkRequirement("uppercase") && (
                              <FaCheck size={8} />
                            )}
                          </div>
                          <span>Uppercase letter</span>
                        </div>
                        <div
                          className={`text-xs flex items-center gap-1 ${
                            checkRequirement("number")
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          <div className="w-3 h-3 rounded-full flex items-center justify-center bg-gray-100">
                            {checkRequirement("number") && <FaCheck size={8} />}
                          </div>
                          <span>Number</span>
                        </div>
                        <div
                          className={`text-xs flex items-center gap-1 ${
                            checkRequirement("special")
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          <div className="w-3 h-3 rounded-full flex items-center justify-center bg-gray-100">
                            {checkRequirement("special") && (
                              <FaCheck size={8} />
                            )}
                          </div>
                          <span>Special character</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={userData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`block w-full rounded-md border ${
                        validationErrors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-200"
                      } p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200`}
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() => handleTogglePassword("confirm")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword.confirm ? (
                        <MdVisibility size={20} />
                      ) : (
                        <MdVisibilityOff size={20} />
                      )}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="text-red-600 text-sm mt-1">
                      {validationErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-4">
                  <button
                    type="submit"
                    disabled={isPasswordSubmitDisabled || isSubmittingPassword}
                    onClick={handlePasswordSubmit}
                    className={`${
                      isPasswordSubmitDisabled || isSubmittingPassword
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#F47954] hover:bg-[#e66c46]"
                    } text-white py-3 px-6 rounded-md font-medium transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center min-w-[200px]`}
                  >
                    {isSubmittingPassword ? "Updating..." : "Change Password"}
                  </button>
                </div>
              </div>
            </section>

            <section className="pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Two-Factor Authentication
              </h3>
              <div className="flex items-center space-x-4">
                <p className="text-sm text-gray-600">
                  Two factor authentication is currently{" "}
                  <span
                    className={
                      userData.is_2fa_enabled
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {userData.is_2fa_enabled ? "Enabled" : "Disabled"}
                  </span>
                </p>
                <button
                  onClick={handleToggle2FA}
                  className={`px-4 py-2 text-white rounded-md ${
                    userData.is_2fa_enabled
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  } disabled:opacity-50 transition-all duration-200`}
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Processing..."
                    : userData.is_2fa_enabled
                    ? "Disable 2FA"
                    : "Enable 2FA"}
                </button>
              </div>
            </section>

            {/* <section className="pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Permissions
              </h3>
              {renderPermissions()}
            </section> */}
          </div>
        </div>

        {show2FAModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {userData.is_2fa_enabled ? "Disable 2FA" : "Enable 2FA"}
                </h3>
                <button
                  onClick={() => setShow2FAModal(false)}
                  className="text-gray-500 hover:text-Gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                An OTP has been sent to your{" "}
                {userData.email ? "email" : "phone"}. Please enter the OTP
                below.
              </p>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none mb-4"
              />
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShow2FAModal(false)}
                  className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={
                    userData.is_2fa_enabled ? handleToggle2FA : handleVerify2FA
                  }
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Verify OTP"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheck className="text-green-600 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Password Changed Successfully!
                </h3>
                <p className="text-gray-600 mb-6">
                  Your password has been updated. Please use your new password
                  for future logins.
                </p>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="bg-[#F47954] text-white px-6 py-2 rounded-md hover:bg-[#e66c46] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProfile;
