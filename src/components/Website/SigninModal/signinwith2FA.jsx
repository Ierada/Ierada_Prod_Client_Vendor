import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { RxCross2 } from "react-icons/rx";
import { setUserCookie } from "../../../utils/userIdentifier";
import { useAppContext } from "../../../context/AppContext";
import {
  sendOtp,
  customerLogin,
  customerRegister,
  verifyOtp,
} from "../../../services/api.auth";
import config from "../../../config/config";
import PasswordResetModal from "../../Vendor/Models/PasswordResetModal";

const OtpInput = React.memo(
  ({ otp, handleOtpChange, handleOtpKeyDown, otpRefs }) => {
    const handleFocus = (input) => {
      input.select();
    };

    return (
      <div className="flex justify-between gap-4">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (otpRefs.current[index] = el)}
            type="text"
            value={digit}
            onChange={(e) => handleOtpChange(e.target.value, index)}
            onKeyDown={(e) => handleOtpKeyDown(e, index)}
            onFocus={(e) => handleFocus(e.target)}
            className="w-14 h-14 text-center border rounded-lg focus:ring-2 focus:ring-black text-xl font-semibold"
            maxLength={1}
          />
        ))}
      </div>
    );
  }
);

const OtpTimer = React.memo(
  ({ timerState, isLoading, handleResendOtp, formatCountdown }) => {
    return (
      <div className="flex justify-between text-sm">
        <button
          disabled={isLoading || timerState.isResendDisabled}
          onClick={handleResendOtp}
          className={`${
            timerState.isResendDisabled ? "text-gray-400" : "text-gray-900"
          }`}
        >
          Resend OTP{" "}
          {timerState.isResendDisabled ? `(${formatCountdown()})` : ""}
        </button>
      </div>
    );
  }
);

const OtpVerificationModal = React.memo(
  ({
    otp,
    modalRef,
    verificationInProgress,
    inputType,
    formData,
    errors,
    isLoading,
    handleVerifyOtp,
    timerState,
    handleOtpChange,
    handleOtpKeyDown,
    formatCountdown,
    handleSendOtp,
    handleCloseOtpModal,
    otpRefs,
    is2FA,
  }) => {
    const handleResendOtp = () => handleSendOtp(verificationInProgress, is2FA);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
        <div ref={modalRef} className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-semibold">Enter OTP</h2>
              <p className="text-base text-gray-600">
                OTP sent to{" "}
                {verificationInProgress === "email"
                  ? formData.email || formData.identifier
                  : `+91${formData.mobile || formData.identifier}`}
              </p>
            </div>

            <OtpInput
              otp={otp}
              handleOtpChange={handleOtpChange}
              handleOtpKeyDown={handleOtpKeyDown}
              otpRefs={otpRefs}
            />

            <OtpTimer
              timerState={timerState}
              isLoading={isLoading}
              handleResendOtp={handleResendOtp}
              formatCountdown={formatCountdown}
            />

            {errors.otp && (
              <p className="text-red-500 text-sm text-center">{errors.otp}</p>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleCloseOtpModal}
                className="w-1/2 border border-gray-300 text-gray-700 py-3 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerifyOtp(otp.join(""), is2FA)}
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
  }
);

const AuthModal = ({ onClose, isOpen }) => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { user, setUser } = useAppContext();
  const [inputType, setInputType] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    email: "",
    mobile: "",
    first_name: "",
    last_name: "",
    password: "",
    confirmPassword: "",
    two_factor_code: "",
  });
  const [emailVerified, setEmailVerified] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [is2FA, setIs2FA] = useState(false);
  const [verificationInProgress, setVerificationInProgress] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timerState, setTimerState] = useState({
    countdown: 60,
    isResendDisabled: true,
  });
  const [showOptionalEmail, setShowOptionalEmail] = useState(false);
  const [showRequiredMobile, setShowRequiredMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const otpRefs = useRef([]);
  const modalRef = useRef(null);

  useEffect(() => {
    if (showOtpModal) {
      startOtpTimer();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [showOtpModal]);

  const timerRef = useRef(null);

  const startOtpTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setTimerState({
      countdown: 60,
      isResendDisabled: true,
    });

    timerRef.current = setInterval(() => {
      setTimerState((prevState) => {
        if (prevState.countdown <= 1) {
          clearInterval(timerRef.current);
          return {
            countdown: 0,
            isResendDisabled: false,
          };
        }
        return {
          ...prevState,
          countdown: prevState.countdown - 1,
        };
      });
    }, 1000);
  }, []);

  const formatCountdown = useCallback(() => {
    return `00:${
      timerState.countdown < 10
        ? "0" + timerState.countdown
        : timerState.countdown
    }`;
  }, [timerState.countdown]);

  const validateEmail = useCallback(
    (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    []
  );
  const validateMobile = useCallback((mobile) => /^\d{10}$/.test(mobile), []);

  const validatePassword = useCallback((password) => {
    const errors = [];
    if (password.length < 6)
      errors.push("Password must be at least 6 characters");
    if (!/[A-Z]/.test(password))
      errors.push("Password must contain at least one uppercase letter");
    if (!/[a-z]/.test(password))
      errors.push("Password must contain at least one lowercase letter");
    if (!/\d/.test(password))
      errors.push("Password must contain at least one number");
    return { isValid: errors.length === 0, errors };
  }, []);

  const detectInputType = useCallback(
    (value) => {
      if (value.includes("@")) {
        setInputType("email");
        setFormData((prev) => ({
          ...prev,
          identifier: value,
          email: value,
          mobile: "",
        }));
        if (!isSignIn) {
          setShowRequiredMobile(true);
          setShowOptionalEmail(false);
          setEmailVerified(false);
        }
      } else if (/^\d+$/.test(value)) {
        setInputType("mobile");
        setFormData((prev) => ({
          ...prev,
          identifier: value,
          mobile: value,
          email: "",
        }));
        if (!isSignIn) {
          setShowOptionalEmail(true);
          setShowRequiredMobile(false);
          setMobileVerified(false);
        }
      }
    },
    [isSignIn]
  );

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.identifier) {
      newErrors.identifier = "Please enter email or mobile number";
      return newErrors;
    }
    if (!isSignIn) {
      if (inputType === "email") {
        if (!validateEmail(formData.identifier)) {
          newErrors.identifier = "Invalid email format";
        }
        if (!formData.mobile || !validateMobile(formData.mobile)) {
          newErrors.mobile = "Valid mobile number is required";
        }
      } else if (inputType === "mobile") {
        if (!validateMobile(formData.identifier)) {
          newErrors.identifier = "Invalid mobile number";
        }
        if (formData.email && !validateEmail(formData.email)) {
          newErrors.email = "Invalid email format";
        }
      }
      if (!formData.first_name) newErrors.first_name = "First name is required";
      if (!formData.last_name) newErrors.last_name = "Last name is required";

      if (!formData.password) {
        newErrors.password = "Password is required";
      } else {
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
          newErrors.password = passwordValidation.errors[0];
        }
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    formData,
    inputType,
    isSignIn,
    validateEmail,
    validateMobile,
    validatePassword,
  ]);

  const handleSendOtp = async (type, is2FA = false) => {
    setIsLoading(true);
    setErrors({});
    setVerificationInProgress(type);
    setOtp(["", "", "", ""]);
    setIs2FA(is2FA);

    try {
      let value =
        type === "email"
          ? type === inputType
            ? formData.identifier
            : formData.email
          : type === inputType
          ? formData.identifier
          : formData.mobile;

      const payload = is2FA
        ? {
            type,
            value,
            password: formData.password,
          }
        : {
            type,
            value,
            verifiedValue: mobileVerified
              ? formData.mobile
              : emailVerified
              ? formData.email
              : null,
            tempToken: tempToken,
          };

      const res = await (is2FA ? customerLogin : sendOtp)(payload);
      if (res.status === 1 || res.status === 2) {
        if (res.status === 1 && !is2FA) {
          if (res.data?.verified) {
            type === "email" ? setEmailVerified(true) : setMobileVerified(true);
          } else {
            setShowOtpModal(true);
            startOtpTimer();
          }
        } else if (res.status === 2) {
          setShowOtpModal(true);
          startOtpTimer();
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          [type]: res.message || "Failed to send OTP",
        }));
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        [type]:
          error.response?.data?.message ||
          "Failed to send OTP. Please try again.",
      }));
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = useCallback(
    async (otpCode, is2FA = false) => {
      setIsLoading(true);
      try {
        const value =
          verificationInProgress === "email"
            ? inputType === "email"
              ? formData.identifier
              : formData.email
            : inputType === "mobile"
            ? formData.identifier
            : formData.mobile;

        const payload = is2FA
          ? {
              type: verificationInProgress,
              value,
              password: formData.password,
              two_factor_code: otpCode,
            }
          : {
              type: verificationInProgress,
              value,
              otp: otpCode,
            };

        const res = is2FA
          ? await customerLogin(payload)
          : await verifyOtp(payload);

        if (res?.status === 1) {
          if (is2FA) {
            setUserCookie(res.token, res.data);
            setUser(res.data);
            onClose();
          } else {
            setTempToken(res.tempToken);
            verificationInProgress === "email"
              ? setEmailVerified(true)
              : setMobileVerified(true);
            setShowOtpModal(false);
          }
        } else {
          throw new Error(
            res?.message || `${verificationInProgress} verification failed`
          );
        }
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          otp: error.message || "Verification failed. Please try again.",
        }));
      } finally {
        setOtp(["", "", "", ""]);
        setIsLoading(false);
      }
    },
    [verificationInProgress, inputType, formData, tempToken, setUser, onClose]
  );

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      if (isSignIn) {
        const res = await customerLogin({
          type: inputType,
          value: formData.identifier,
          password: formData.password,
        });

        if (res?.status === 1) {
          setUserCookie(res.token, res.data);
          setUser(res.data);
          onClose();
        } else if (res?.status === 2) {
          setShowOtpModal(true);
          setVerificationInProgress(inputType);
          startOtpTimer();
        }
      } else {
        const payload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          password: formData.password,
          email:
            inputType === "email"
              ? formData.identifier
              : formData.email || null,
          mobile:
            inputType === "mobile"
              ? `+91${formData.identifier}`
              : `+91${formData.mobile}`,
          referral_code: formData.referral_code || null,
        };

        const res = await customerRegister(payload);
        if (res?.status === 1) {
          setIsSignIn(true);
          resetForm();
        }
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: error.response?.data?.message || error.message,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData({
      identifier: "",
      email: "",
      mobile: "",
      first_name: "",
      last_name: "",
      password: "",
      confirmPassword: "",
      two_factor_code: "",
    });
    setErrors({});
    setEmailVerified(false);
    setMobileVerified(false);
    setInputType("");
    setShowOptionalEmail(false);
    setShowRequiredMobile(false);
    setIs2FA(false);
  }, []);

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      if (name === "identifier") {
        detectInputType(value);
        setEmailVerified(false);
        setMobileVerified(false);
      }
      if (
        (name === "mobile" ||
          (name === "identifier" && inputType === "mobile")) &&
        !/^\d*$/.test(value)
      ) {
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (name === "email") setEmailVerified(false);
      if (name === "mobile") setMobileVerified(false);
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [detectInputType, errors, inputType]
  );

  const handleOtpChange = useCallback(
    (value, index) => {
      if (/^\d*$/.test(value)) {
        setOtp((prevOtp) => {
          const newOtp = [...prevOtp];
          if (value.length > 1) {
            const digits = value.split("");
            for (let i = 0; i < digits.length; i++) {
              if (index + i < newOtp.length) {
                newOtp[index + i] = digits[i];
              }
            }
            const nextIndex = Math.min(
              index + digits.length,
              newOtp.length - 1
            );
            setTimeout(() => {
              otpRefs.current[nextIndex]?.focus();
              if (
                nextIndex === newOtp.length - 1 &&
                digits.length === newOtp.length
              ) {
                const otpCode = newOtp.join("");
                handleVerifyOtp(otpCode, is2FA);
              }
            }, 0);
            return newOtp;
          } else {
            newOtp[index] = value;
            if (value && index < newOtp.length - 1) {
              setTimeout(() => {
                otpRefs.current[index + 1]?.focus();
              }, 0);
            }
            if (value && index === newOtp.length - 1) {
              const otpCode = [...newOtp].join("");
              setTimeout(() => {
                handleVerifyOtp(otpCode, is2FA);
              }, 100);
            }
            return newOtp;
          }
        });
      }
    },
    [handleVerifyOtp, is2FA]
  );

  const handleOtpKeyDown = useCallback(
    (e, index) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        setOtp((prevOtp) => {
          const newOtp = [...prevOtp];
          newOtp[index - 1] = "";
          return newOtp;
        });
        setTimeout(() => {
          otpRefs.current[index - 1]?.focus();
        }, 0);
      }
    },
    [otp]
  );

  const isSubmitDisabled = useCallback(() => {
    if (isLoading) return true;
    if (isSignIn) return false;
    if (inputType === "email") {
      return !emailVerified || !mobileVerified;
    } else if (inputType === "mobile") {
      return !mobileVerified || (formData.email && !emailVerified);
    }
    return true;
  }, [
    isLoading,
    isSignIn,
    inputType,
    emailVerified,
    mobileVerified,
    formData.email,
  ]);

  const renderVerificationButton = useCallback(
    (type) => {
      const isEmail = type === "email";
      const value = isEmail ? formData.email : formData.mobile;
      const isValid = isEmail ? validateEmail(value) : validateMobile(value);
      const isVerified = isEmail ? emailVerified : mobileVerified;
      if (!value || !isValid || isVerified) return null;
      return (
        <button
          onClick={() => handleSendOtp(type)}
          disabled={isLoading}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          Verify {isEmail ? "Email" : "Mobile"}
        </button>
      );
    },
    [
      formData.email,
      formData.mobile,
      validateEmail,
      validateMobile,
      emailVerified,
      mobileVerified,
      isLoading,
      handleSendOtp,
    ]
  );

  const handleCloseOtpModal = useCallback(() => {
    setShowOtpModal(false);
    setOtp(["", "", "", ""]);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  const renderOtpModal = useMemo(() => {
    if (!showOtpModal) return null;

    return (
      <OtpVerificationModal
        otp={otp}
        modalRef={modalRef}
        verificationInProgress={verificationInProgress}
        inputType={inputType}
        formData={formData}
        errors={errors}
        isLoading={isLoading}
        handleVerifyOtp={handleVerifyOtp}
        timerState={timerState}
        handleOtpChange={handleOtpChange}
        handleOtpKeyDown={handleOtpKeyDown}
        formatCountdown={formatCountdown}
        handleSendOtp={handleSendOtp}
        handleCloseOtpModal={handleCloseOtpModal}
        otpRefs={otpRefs}
        is2FA={is2FA}
      />
    );
  }, [
    showOtpModal,
    otp,
    verificationInProgress,
    inputType,
    formData,
    errors,
    isLoading,
    timerState,
    is2FA,
  ]);

  if (!isOpen) return null;

  const PasswordRequirements = ({ password }) => {
    if (!password || isSignIn) return null;

    const requirements = [
      { met: password.length >= 6, text: "At least 6 characters" },
      { met: /[A-Z]/.test(password), text: "At least one uppercase letter" },
      { met: /[a-z]/.test(password), text: "At least one lowercase letter" },
      { met: /\d/.test(password), text: "At least one number" },
    ];

    return (
      <div className="mt-2 text-xs space-y-1">
        <p className="font-medium text-gray-700">Password requirements:</p>
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center">
            <span className={req.met ? "text-green-500" : "text-gray-400"}>
              {req.met ? "✓" : "○"}
            </span>
            <span className="ml-2 text-gray-600">{req.text}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-[black] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-4xl flex rounded-lg relative h-[90%]">
        <div className="hidden md:flex w-1/2 relative">
          <img
            src="/assets/banners/signinnew.png"
            alt="Promotional"
            className="w-full h-full object-cover rounded-l-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-l-lg">
            <div className="absolute bottom-8 left-8 text-white">
              <h2 className="text-3xl font-semibold mb-2">
                Now Celebrate every Occasion with style!
              </h2>
              <p className="text-xl">
                Sign Up and Get 25% Off your First Order
              </p>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div
            className={`space-y-6 ${
              !isSignIn && "h-full overflow-y-auto scrollbar-hide"
            }`}
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-semibold">
                {isSignIn ? "Sign In" : "Sign Up"}
              </h2>
              <p className="text-base text-gray-600">
                {isSignIn
                  ? "Welcome back! Please sign in to your account"
                  : "Welcome to Ierada Shop! Create your account"}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="Email or Mobile Number"
                />
                {!isSignIn &&
                  inputType === "email" &&
                  renderVerificationButton("email")}
                {!isSignIn &&
                  inputType === "mobile" &&
                  renderVerificationButton("mobile")}
                {errors.identifier && (
                  <p className="text-red-500 text-sm">{errors.identifier}</p>
                )}
                {inputType === "email" && emailVerified && (
                  <p className="text-green-500 text-sm mt-1">Email verified</p>
                )}
                {inputType === "mobile" && mobileVerified && (
                  <p className="text-green-500 text-sm mt-1">Mobile verified</p>
                )}
              </div>
              {!isSignIn && (
                <>
                  {showOptionalEmail && (
                    <div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border rounded-lg"
                        placeholder="Email (Optional)"
                      />
                      {renderVerificationButton("email")}
                      {emailVerified && (
                        <p className="text-green-500 text-sm mt-1">
                          Email verified
                        </p>
                      )}
                      {errors.email && (
                        <p className="text-red-500 text-sm">{errors.email}</p>
                      )}
                    </div>
                  )}
                  {showRequiredMobile && (
                    <div>
                      <input
                        type="text"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border rounded-lg"
                        placeholder="Mobile Number *"
                        maxLength={10}
                      />
                      {renderVerificationButton("mobile")}
                      {mobileVerified && (
                        <p className="text-green-500 text-sm mt-1">
                          Mobile verified
                        </p>
                      )}
                      {errors.mobile && (
                        <p className="text-red-500 text-sm">{errors.mobile}</p>
                      )}
                    </div>
                  )}
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg"
                    placeholder="First Name"
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-sm">{errors.first_name}</p>
                  )}
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg"
                    placeholder="Last Name"
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-sm">{errors.last_name}</p>
                  )}
                  <div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-lg"
                      placeholder="Password"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm">{errors.password}</p>
                    )}
                    <PasswordRequirements password={formData.password} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg"
                    placeholder="Confirm Password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm">
                      {errors.confirmPassword}
                    </p>
                  )}
                </>
              )}
              {isSignIn && (
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>
            {errors.submit && (
              <p className="text-red-500 text-sm text-center">
                {errors.submit}
              </p>
            )}
            <button
              onClick={handleSubmit}
              disabled={isSubmitDisabled()}
              className="w-full bg-[#737A6C] text-white py-3 rounded-lg disabled:bg-gray-300"
            >
              {isLoading ? "Please wait..." : isSignIn ? "Sign In" : "Register"}
            </button>
            {isSignIn && (
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="text-sm font-medium text-[black] hover:text-[#6B705C]"
              >
                Forgot password?
              </button>
            )}
            <div className="text-center text-sm text-gray-500">
              {isSignIn ? (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      setIsSignIn(false);
                      resetForm();
                    }}
                    className="text-gray-900 font-medium"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setIsSignIn(true);
                      resetForm();
                    }}
                    className="text-gray-900 font-medium"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
            <div className="flex justify-center space-x-4 text-sm">
              <a
                href={`${config.VITE_BASE_WEBSITE_URL}/signin-vendor`}
                class
                breadcr="border border-[#737A6C] text-[#737A6C] hover:bg-[#737A6C] hover:text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Sign in as Vendor
              </a>
              {!isSignIn && (
                <a
                  href={`${config.VITE_BASE_WEBSITE_URL}/become-seller`}
                  className="border border-[#737A6C] text-[#737A6C] hover:bg-[#737A6C] hover:text-white px-4 py-2 rounded-lg transition duration-200"
                >
                  Register as Vendor
                </a>
              )}
            </div>
            {!isSignIn && (
              <div className="text-xs text-gray-500 text-center px-4">
                <p>
                  By continuing, I agree to the{" "}
                  <a
                    href={`${config.VITE_BASE_WEBSITE_URL}/page/terms-and-conditions`}
                    className="text-[#737A6C] hover:underline"
                  >
                    Terms of Use
                  </a>{" "}
                  and{" "}
                  <a
                    href={`${config.VITE_BASE_WEBSITE_URL}/page/privacy-policy`}
                    className="text-[#737A6C] hover:underline"
                  >
                    Privacy Policy
                  </a>{" "}
                  and I can receive emails, SMS and Whatsapp messages from
                  Ierada.
                </p>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
        >
          <RxCross2 size={24} />
        </button>
      </div>
      {renderOtpModal}
      <PasswordResetModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

export default AuthModal;
