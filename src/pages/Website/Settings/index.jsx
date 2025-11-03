import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import CommonTopBanner from "../../../components/Website/CommonTopBanner";
import { AccountInfo } from "../../../components/Website/AccountInfo";
import { changePassword } from "../../../services/api.auth";
import common_top_banner from "/assets/banners/Commen-top-banner.png";
import CustomGoogleTranslate from "../../../utils/GoogleTranslate";
import { useAppContext } from "../../../context/AppContext";
// Language options with their Google Translate codes
const languageOptions = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
];

const PasswordInput = ({
  label,
  name,
  value,
  onChange,
  showPassword,
  setShowPassword,
}) => (
  <div>
    <label className="block text-sm font-medium text-[#777777] mb-2">
      {label}
    </label>
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border  focus:outline-none focus:ring-1 focus:ring-black"
        required
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2"
        aria-label={
          showPassword ? "Hide current password" : "Show current password"
        }
      >
        {showPassword ? (
          <Eye className="w-5 h-5 text-gray-500" />
        ) : (
          <EyeOff className="w-5 h-5 text-gray-500" />
        )}
      </button>
    </div>
  </div>
);

const Settings = () => {
  const { user } = useAppContext();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [language, setLanguage] = useState("English");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [languageSuccess, setLanguageSuccess] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    Password: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let script;
    const addScript = () => {
      script = document.createElement("script");
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    };

    if (!document.querySelector('script[src*="translate.google.com"]')) {
      addScript();
    }

    return () => {
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);

    // Find and trigger Google Translate dropdown
    const googleCombo = document.querySelector(".goog-te-combo");
    if (googleCombo) {
      googleCombo.value = newLang;
      googleCombo.dispatchEvent(new Event("change"));
    }
  };

  const togglePasswordForm = () => {
    setShowPasswordForm(!showPasswordForm);
    setError("");
    setSuccess("");
    setPasswordForm({
      Password: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  const validatePassword = () => {
    const { newPassword, confirmPassword } = passwordForm;

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError("Password must include at least one uppercase letter");
      return false;
    }
    if (!/[a-z]/.test(newPassword)) {
      setError("Password must include at least one lowercase letter");
      return false;
    }
    if (!/[0-9]/.test(newPassword)) {
      setError("Password must include at least one number");
      return false;
    }
    if (!/[!@#$%^&*]/.test(newPassword)) {
      setError(
        "Password must include at least one special character (!@#$%^&*)"
      );
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!validatePassword()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await changePassword(user.id, passwordForm);

      if (response.status === 1) {
        setPasswordForm({ Password: "", newPassword: "", confirmPassword: "" });
      } else {
        // alert(response.message || "Failed to update password.");
      }
    } catch (error) {
      setError(error.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailNotificationsChange = async () => {
    try {
      //   const response = await updateEmailNotifications({ emailNotifications: !emailNotifications });
      //   if (response.success) {
      setEmailNotifications(!emailNotifications);
      //   } else {
      //     throw new Error('Failed to update email notifications');
      //   }
    } catch (error) {
      console.error("Failed to update email notifications:", error.message);
    }
  };

  return (
    <>
      <main className="">
        {/* <CommonTopBanner /> */}

        <section className="w-full">
          <div className="text-center my-10 text-[#000000]">
            <h1 className="text-2xl lg:text-4xl font-semibold mb-2 font-Playfair">
              My Account
            </h1>
            <p className="text-sm lg:text-base font-Lato font-medium">
              Home / My Settings
            </p>
          </div>

          <div className="bg-white px-4 md:px-5 lg:px-20 flex flex-col md:flex-row md:gap-10">
            <div className="w-full md:w-1/3 lg:w-1/4">
              <AccountInfo activeSection="settings" />
            </div>

            <div className="mt-10 md:w-4/5">
              <div className="w-full max-w-2xl p-6 space-y-8">
                {/* Language Section */}
                <CustomGoogleTranslate />

                {/* Email Notifications Section */}
                {/* <div className="border-b pb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-[black] mb-1">
                        Email Notifications
                      </h2>
                      <p className="text-[#777777] text-sm">
                        Receive email notifications
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={emailNotifications}
                        onChange={handleEmailNotificationsChange}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                </div> */}

                {/* Change Password Section */}
                <div>
                  {!showPasswordForm ? (
                    <button
                      onClick={togglePasswordForm}
                      className="text-xl font-semibold text-[black] hover:text-gray-900 flex items-center"
                    >
                      Change Password →
                    </button>
                  ) : (
                    <div className="bg-white rounded-lg">
                      <h2 className="text-xl font-semibold text-[#191C1F] mb-6">
                        Change Password
                      </h2>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <PasswordInput
                          label="Current Password"
                          name="Password"
                          value={passwordForm.Password}
                          onChange={handlePasswordChange}
                          showPassword={showCurrentPassword}
                          setShowPassword={setShowCurrentPassword}
                        />
                        <PasswordInput
                          label="New Password"
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          showPassword={showNewPassword}
                          setShowPassword={setShowNewPassword}
                        />
                        <PasswordInput
                          label="Confirm Password"
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          showPassword={showConfirmPassword}
                          setShowPassword={setShowConfirmPassword}
                        />

                        {error && (
                          <p className="text-red-500 text-sm">{error}</p>
                        )}

                        {success && (
                          <p className="text-green-500 text-sm">{success}</p>
                        )}

                        <div className="flex gap-4">
                          <button
                            type="submit"
                            className="px-6 py-2 bg-black text-white text-sm  transition-colors"
                          >
                            {isLoading ? "Processing..." : "CHANGE PASSWORD"}
                          </button>
                          <button
                            type="button"
                            onClick={togglePasswordForm}
                            className="px-6 py-2 border border-black text-black focus:bg-black focus:text-white hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Settings;
