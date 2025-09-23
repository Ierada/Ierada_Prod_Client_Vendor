import React, { useState, useRef, useEffect, useCallback } from "react";
import { RxCross2 } from "react-icons/rx";
import { IoCallOutline, IoMailOutline } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { AiFillInstagram } from "react-icons/ai";
import { FaFacebook } from "react-icons/fa";
import { setUserCookie } from "../../../utils/userIdentifier";
import { useAppContext } from "../../../context/AppContext";
import {
  sendOtp,
  verifyOtp,
  verifyGoogle,
  verifyFacebook,
  verifyInstagram,
} from "../../../services/api.auth";
import config from "../../../config/config";
import { IoArrowBack } from "react-icons/io5";
import Logo from "/assets/logo/login_logo.svg";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import FacebookLogin from "@greatsumini/react-facebook-login";

// OtpInput component remains unchanged
const OtpInput = React.memo(
  ({ otp, handleOtpChange, handleOtpKeyDown, otpRefs }) => {
    return (
      <div className="flex justify-center gap-2 sm:gap-3 md:gap-4">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (otpRefs.current[index] = el)}
            type="text"
            value={digit}
            onChange={(e) => handleOtpChange(e.target.value, index)}
            onKeyDown={(e) => handleOtpKeyDown(e, index)}
            onFocus={(e) => e.target.select()}
            className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 text-center border border-orange-500 bg-white rounded-lg shadow-sm focus:ring-0 focus:ring-offset-0 focus:outline-none focus:border-orange-500 text-xl sm:text-2xl font-bold text-orange-500"
            maxLength={1}
          />
        ))}
      </div>
    );
  }
);

// Google Button Component
const GoogleButton = ({
  isLoading,
  handleSocialSuccess,
  handleSocialError,
}) => {
  const googleLogin = useGoogleLogin({
    onSuccess: (response) => handleSocialSuccess("google", response),
    onError: () => handleSocialError("Google"),
    flow: "auth-code", // Use auth-code flow for consistency
  });

  return (
    <button
      onClick={() => googleLogin()}
      disabled={isLoading}
      className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow flex items-center justify-center"
    >
      <FcGoogle size={20} className="sm:w-6 sm:h-6" />
    </button>
  );
};

const AuthModal = ({ onClose, isOpen, mode }) => {
  const [step, setStep] = useState("login");
  const [inputType, setInputType] = useState("phone");
  const [formData, setFormData] = useState({ identifier: "" });
  const [errors, setErrors] = useState({});
  const { user, setUser } = useAppContext();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timerState, setTimerState] = useState({
    countdown: 30,
    isResendDisabled: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [verificationInProgress, setVerificationInProgress] = useState("");
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  const validateEmail = useCallback(
    (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    []
  );
  const validateMobile = useCallback((mobile) => /^\d{10}$/.test(mobile), []);

  const startOtpTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerState({ countdown: 30, isResendDisabled: true });
    timerRef.current = setInterval(() => {
      setTimerState((prev) => {
        if (prev.countdown <= 1) {
          clearInterval(timerRef.current);
          return { countdown: 0, isResendDisabled: false };
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);
  }, []);

  const formatCountdown = useCallback(
    () =>
      `00:${
        timerState.countdown < 10
          ? "0" + timerState.countdown
          : timerState.countdown
      }`,
    [timerState.countdown]
  );

  const handleInputChange = useCallback(
    (e) => {
      const { value } = e.target;
      if (inputType === "phone" && !/^\d*$/.test(value)) return;
      setFormData({ identifier: value });
      setErrors({});
    },
    [inputType]
  );

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.identifier) {
      newErrors.identifier =
        "Please enter your " +
        (inputType === "phone" ? "mobile number" : "email");
    } else if (inputType === "phone" && !validateMobile(formData.identifier)) {
      newErrors.identifier = "Invalid mobile number (10 digits)";
    } else if (inputType === "email" && !validateEmail(formData.identifier)) {
      newErrors.identifier = "Invalid email format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.identifier, inputType, validateEmail, validateMobile]);

  const handleSendOtp = async () => {
    setIsLoading(true);
    setErrors({});
    setOtp(["", "", "", ""]);
    const type = inputType === "phone" ? "mobile" : "email";
    setVerificationInProgress(type);

    try {
      const payload = { type, value: formData.identifier };
      const res = await sendOtp(payload);
      if (res.status === 1) {
        setStep("otp");
        startOtpTimer();
      } else {
        setErrors({ identifier: res.message || "Failed to send OTP" });
      }
    } catch (error) {
      setErrors({
        identifier:
          error.response?.data?.message ||
          "Failed to send OTP. Please try again.",
      });
    }
    setIsLoading(false);
  };

  const handleContinue = () => {
    if (validateForm()) handleSendOtp();
  };

  const handleVerifyOtp = useCallback(
    async (otpCode) => {
      setIsLoading(true);
      try {
        const res = await verifyOtp({
          type: verificationInProgress,
          value: formData.identifier,
          otp: otpCode,
        });
        if (res?.status === 1) {
          setUserCookie(res.token, res.data, res.data?.role);
          setUser(res.data);
          setStep("login");
          onClose();
        } else {
          throw new Error(res?.message || "Verification failed");
        }
      } catch (error) {
        setErrors({
          otp: error.message || "Verification failed. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [verificationInProgress, formData.identifier, onClose]
  );

  const handleOtpChange = useCallback(
    (value, index) => {
      if (/^\d*$/.test(value)) {
        setOtp((prevOtp) => {
          const newOtp = [...prevOtp];
          newOtp[index] = value;
          if (value && index < 3) otpRefs.current[index + 1]?.focus();
          if (value && index === 3) {
            const otpCode = newOtp.join("");
            handleVerifyOtp(otpCode);
          }
          return newOtp;
        });
      }
    },
    [handleVerifyOtp]
  );

  const handleOtpKeyDown = useCallback(
    (e, index) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  const handleResendOtp = () => {
    handleSendOtp();
  };

  const handleBackToLogin = () => {
    setStep("login");
    setOtp(["", "", "", ""]);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleSocialSuccess = async (provider, response) => {
    setIsLoading(true);
    setErrors({});
    try {
      let res;
      if (provider === "google") {
        res = await verifyGoogle({ code: response.code }); // Updated to use code
      } else if (provider === "facebook") {
        res = await verifyFacebook({ accessToken: response.accessToken });
      } else if (provider === "instagram") {
        res = await verifyInstagram({ accessToken: response.accessToken });
      }
      if (res?.status === 1) {
        setUserCookie(res.token, res.data, res.data?.role);
        setUser(res.data);
        setStep("login");
        onClose();
      } else {
        throw new Error(res?.message || `${provider} login failed`);
      }
    } catch (error) {
      setErrors({
        social: error.message || `${provider} login failed. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialError = (provider) => {
    setErrors({ social: `${provider} login failed. Please try again.` });
  };

  useEffect(() => {
    if (step === "otp") {
      startOtpTimer();
      otpRefs.current[0]?.focus();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, startOtpTimer]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <button
        onClick={onClose}
        className={`${
          step === "otp" ? "hidden" : "block"
        } absolute top-4 right-4 sm:top-6 sm:right-6 text-black`}
      >
        <RxCross2 size={20} className="sm:w-6 sm:h-6" />
      </button>
      <div className="max-w-md w-full relative flex flex-col items-center p-4 sm:p-6">
        <div className="flex justify-center my-3 sm:my-4">
          <img src={Logo} alt="Logo" className="w-20 sm:w-24 md:w-28" />
        </div>
        <div className="relative bg-button-gradient rounded-2xl p-4 sm:p-5 max-w-sm w-full text-center space-y-3 sm:space-y-4">
          <button
            onClick={handleBackToLogin}
            className={`${
              step === "otp" ? "block" : "hidden"
            } absolute top-3 left-3 bg-white rounded-full p-2`}
          >
            <IoArrowBack size={16} className="text-orange-500 sm:w-4 sm:h-4" />
          </button>
          {step === "login" ? (
            <>
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white uppercase">
                Sign In / Sign Up
              </h2>
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-lg space-y-3">
                <div className="flex bg-white rounded-full space-x-2 p-1">
                  <button
                    onClick={() => setInputType("phone")}
                    className={`${
                      inputType === "phone"
                        ? "border border-orange-500 text-orange-500"
                        : "bg-gray-100"
                    } flex items-center px-3 py-1 sm:px-4 sm:py-2 rounded-lg font-medium text-sm sm:text-base`}
                  >
                    <IoCallOutline className="mr-1 sm:mr-2" /> Phone
                  </button>
                  <button
                    onClick={() => setInputType("email")}
                    className={`${
                      inputType === "email"
                        ? "border border-orange-500 text-orange-500"
                        : "bg-gray-100"
                    } flex items-center px-3 py-1 sm:px-4 sm:py-2 rounded-lg font-medium text-sm sm:text-base`}
                  >
                    <IoMailOutline className="mr-1 sm:mr-2" /> Email
                  </button>
                </div>
                <label className="block text-left text-xs sm:text-sm mt-2">
                  {inputType === "phone" ? "Mobile" : "Email"}
                </label>
                <input
                  type={inputType === "phone" ? "tel" : "email"}
                  value={formData.identifier}
                  onChange={handleInputChange}
                  className="w-full bg-white/80 rounded-lg px-3 sm:px-4 py-2 sm:py-3 placeholder-gray-400 focus:outline-none text-sm sm:text-base"
                  placeholder={`Enter your ${
                    inputType === "phone" ? "phone number" : "email"
                  }`}
                  maxLength={inputType === "phone" ? 10 : undefined}
                />
                {errors.identifier && (
                  <p className="text-red-300 text-xs sm:text-sm">
                    {errors.identifier}
                  </p>
                )}
                <button
                  onClick={handleContinue}
                  disabled={isLoading}
                  className="w-full bg-button-gradient text-white rounded-full py-2 sm:py-3 font-medium text-sm sm:text-base disabled:bg-orange-300"
                >
                  {isLoading ? "Please wait..." : "Continue →"}
                </button>
              </div>
              <div className="flex items-center">
                <hr className="flex-1 border-white/50" />
                <span className="mx-2 text-white text-xs sm:text-sm">Or</span>
                <hr className="flex-1 border-white/50" />
              </div>
              <p className="text-center text-xs text-white">
                By clicking Continue to join or sign in, you agree to Ierada's{" "}
                <a href="#" className="underline">
                  User Agreement
                </a>
                , and{" "}
                <a href="#" className="underline">
                  Privacy Policy
                </a>
                .
              </p>
              <div className="flex justify-center gap-4">
                <GoogleOAuthProvider clientId={config.VITE_GOOGLE_CLIENT_ID}>
                  <GoogleButton
                    isLoading={isLoading}
                    handleSocialSuccess={handleSocialSuccess}
                    handleSocialError={handleSocialError}
                  />
                </GoogleOAuthProvider>
                <FacebookLogin
                  appId={config.VITE_FACEBOOK_APP_ID}
                  scope="public_profile,email"
                  onSuccess={(response) =>
                    handleSocialSuccess("facebook", response)
                  }
                  onFail={(error) => handleSocialError("Facebook")}
                  render={(renderProps) => (
                    <button
                      onClick={renderProps.onClick}
                      disabled={isLoading}
                      className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow flex items-center justify-center"
                    >
                      <FaFacebook
                        size={20}
                        className="sm:w-6 sm:h-6 text-blue-600"
                      />
                    </button>
                  )}
                />
                <FacebookLogin
                  appId={config.VITE_FACEBOOK_APP_ID}
                  scope="public_profile,email,instagram_basic"
                  onSuccess={(response) =>
                    handleSocialSuccess("instagram", response)
                  }
                  onFail={(error) => handleSocialError("Instagram")}
                  render={(renderProps) => (
                    <button
                      onClick={renderProps.onClick}
                      disabled={isLoading}
                      className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow flex items-center justify-center"
                    >
                      <AiFillInstagram
                        size={20}
                        className="sm:w-6 sm:h-6 text-pink-500"
                      />
                    </button>
                  )}
                />
              </div>
              {errors.social && (
                <p className="text-red-300 text-xs sm:text-sm">
                  {errors.social}
                </p>
              )}
            </>
          ) : (
            <>
              <div className="relative text-center space-y-3 sm:space-y-4 mt-6 sm:mt-8">
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white">
                  Enter verification code
                </h2>
                <div className="bg-white rounded-lg p-3 sm:p-4 text-gray-600 text-xs sm:text-sm space-y-2 sm:space-y-3">
                  <p>
                    We sent a 4-digit code to <br />{" "}
                    {verificationInProgress === "email"
                      ? formData.identifier
                      : formData.identifier.replace(
                          /(\d{4})(\d{3})(\d{3})/,
                          "$1***$3"
                        )}
                  </p>
                  <OtpInput
                    otp={otp}
                    handleOtpChange={handleOtpChange}
                    handleOtpKeyDown={handleOtpKeyDown}
                    otpRefs={otpRefs}
                  />
                  {errors.otp && (
                    <p className="text-red-500 text-xs sm:text-sm">
                      {errors.otp}
                    </p>
                  )}
                </div>
                <p className="text-white text-xs sm:text-sm">
                  <span>Haven't received your code?</span>
                  <button
                    disabled={isLoading || timerState.isResendDisabled}
                    onClick={handleResendOtp}
                    className={`${
                      timerState.isResendDisabled
                        ? "text-gray-300"
                        : "text-white underline"
                    }`}
                  >
                    Request a New Code{" "}
                    {timerState.isResendDisabled
                      ? `(${formatCountdown()})`
                      : ""}
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
