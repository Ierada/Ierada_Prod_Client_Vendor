import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useToast } from "../../../context/ToastProvider";
import { FaArrowRightLong } from "react-icons/fa6";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import {
  generateOTP,
  resetPassword,
  verifyOTP,
} from "../../../services/api.user";
import {
  notifyOnSuccess,
  notifyOnFail,
} from "../../../utils/notification/toast";

const PasswordResetModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: Identifier Input, 2: OTP, 3: New Password
  const [identifier, setIdentifier] = useState("");
  const [identifierType, setIdentifierType] = useState(""); // "email" or "mobile"
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [counter, setCounter] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [otpExpiry, setOtpExpiry] = useState(null);
  const [tempToken, setTempToken] = useState("");

  const otpRefs = useRef(
    Array(4)
      .fill()
      .map(() => React.createRef())
  );

  useEffect(() => {
    if (step === 2 && counter > 0) {
      const timer = setTimeout(() => setCounter(counter - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [counter, step]);

  // Detect identifier type (email or mobile)
  useEffect(() => {
    if (identifier) {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
        setIdentifierType("email");
      } else if (/^\d{10}$/.test(identifier)) {
        setIdentifierType("mobile");
      } else {
        setIdentifierType("");
      }
    } else {
      setIdentifierType("");
    }
  }, [identifier]);

  useEffect(() => {
    setOtp(["", "", "", ""]);
    setNewPassword("");
    setConfirmPassword("");
    setIdentifier("");
    setTempToken("");
    setStep(1);
  }, [isOpen]);

  if (!isOpen) return null;

  const isIdentifierValid = identifierType !== "";
  const isOtpValid = otp.every((digit) => digit !== "");
  const isPasswordValid =
    newPassword.length >= 8 && newPassword === confirmPassword;

  const handleIdentifierSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await generateOTP(identifier);
      if (res.status === 1) {
        setStep(2);
        setOtpExpiry(new Date(res.otpExpiry));
        notifyOnSuccess(`OTP sent to your ${identifierType}`);
      } else {
        setError(res.message || "Failed to send OTP");
        notifyOnFail(res.message || "Failed to send OTP");
      }
    } catch (err) {
      setError(err.message || `Failed to send OTP to ${identifierType}`);
      notifyOnFail(err.message || `Failed to send OTP to ${identifierType}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 3) {
        otpRefs.current[index + 1].current.focus();
      } else if (!value && index > 0) {
        otpRefs.current[index - 1].current.focus();
      }
    }
  };

  const handleOtpSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await verifyOTP(identifier, otp.join(""));
      if (res.status === 1) {
        setTempToken(res.token);
        setEmail(res.email);
        setStep(3);
        notifyOnSuccess(`${identifierType} verified successfully`);
      } else {
        setError(res.message || "Invalid OTP");
        notifyOnFail(res.message || "Invalid OTP");
      }
    } catch (err) {
      setError(err.message || "Failed to verify OTP");
      notifyOnFail(err.message || "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await resetPassword(
        identifier,
        newPassword,
        identifierType,
        tempToken
      );
      if (res.status === 1) {
        notifyOnSuccess("Password reset successfully");
        onClose();
      } else {
        setError(res.message || "Failed to reset password");
        notifyOnFail(res.message || "Failed to reset password");
      }
    } catch (err) {
      setError(err.message || "Failed to reset password");
      notifyOnFail(err.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    if (counter > 0) return;

    setIsLoading(true);
    setError("");
    setOtp(["", "", "", ""]);

    try {
      const res = await generateOTP(identifier);
      if (res.status === 1) {
        setCounter(60);
        setOtpExpiry(new Date(res.otpExpiry));
        notifyOnSuccess(`New OTP sent to your ${identifierType}`);
      } else {
        setError(res.message || "Failed to resend OTP");
        notifyOnFail(res.message || "Failed to resend OTP");
      }
    } catch (err) {
      setError(err.message || "Failed to resend OTP");
      notifyOnFail(err.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative bg-white w-[90%] max-w-md p-8 rounded-lg shadow-xl animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Step 1: Identifier Input */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center text-gray-800">
              Reset Password
            </h2>
            <p className="text-center text-gray-600">
              Enter your email or mobile number to reset your password
            </p>
            <div>
              <label
                htmlFor="identifier"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                Email or Mobile Number*
              </label>
              <input
                type="text"
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value.trim())}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="Enter email or 10-digit mobile number"
                autoFocus
              />
              {identifier && !identifierType && (
                <p className="mt-1 text-red-600 text-sm">
                  Please enter a valid email or 10-digit mobile number
                </p>
              )}
              {identifierType && (
                <p className="mt-1 text-green-600 text-sm">
                  {identifierType === "email"
                    ? "We'll send an OTP to this email"
                    : "We'll send an OTP to this mobile number"}
                </p>
              )}
            </div>
            <button
              onClick={handleIdentifierSubmit}
              disabled={!isIdentifierValid || isLoading}
              className={`w-full py-3 px-4 rounded-md text-white font-semibold transition-colors flex items-center justify-center ${
                isIdentifierValid
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-red-400 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <span className="animate-spin">↻</span>
              ) : (
                <>
                  Send OTP <FaArrowRightLong className="ml-2" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center text-gray-800">
              Verify OTP
            </h2>
            <p className="text-center text-gray-600">
              We sent a code to{" "}
              <span className="font-medium">
                {identifierType === "email" ? identifier : `+91 ${identifier}`}
              </span>
              <button
                onClick={() => setStep(1)}
                className="ml-2 text-blue-600 hover:underline"
              >
                Change
              </button>
            </p>

            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={otpRefs.current[index]}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !digit && index > 0) {
                      otpRefs.current[index - 1].current.focus();
                    }
                  }}
                  className="w-14 h-14 text-center text-xl font-semibold border-2 border-gray-300 rounded-md focus:outline-none focus:border-red-500 transition-all"
                  maxLength="1"
                  inputMode="numeric"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <div className="flex justify-between items-center text-sm">
              <button
                onClick={resendOTP}
                disabled={counter > 0}
                className={`${
                  counter > 0
                    ? "text-gray-400"
                    : "text-blue-600 hover:underline"
                }`}
              >
                Resend OTP
              </button>
              {counter > 0 && (
                <span className="text-gray-600">
                  {`${Math.floor(counter / 60)}:${(counter % 60)
                    .toString()
                    .padStart(2, "0")}`}
                </span>
              )}
            </div>

            <button
              onClick={handleOtpSubmit}
              disabled={!isOtpValid || isLoading}
              className={`w-full py-3 px-4 rounded-md text-white font-semibold transition-colors flex items-center justify-center ${
                isOtpValid
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-red-400 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <span className="animate-spin">↻</span>
              ) : (
                <>
                  Verify OTP <FaArrowRightLong className="ml-2" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center text-gray-800">
              Set New Password
            </h2>
            <p className="text-center text-gray-600">
              Create a strong, unique password
            </p>
            <p className="text-center font-bold text-black-2">
              Email Id: {email}
            </p>

            <div className="space-y-4">
              <div className="relative">
                <label
                  htmlFor="newPassword"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  New Password*
                </label>
                <input
                  id="newPassword"
                  type={isPasswordVisible ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="At least 8 characters"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="absolute right-3 top-10 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {isPasswordVisible ? (
                    <AiFillEye size={20} />
                  ) : (
                    <AiFillEyeInvisible size={20} />
                  )}
                </button>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Confirm Password*
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="Confirm your password"
                />
              </div>

              {newPassword && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">
                    Password requirements:
                  </p>
                  <ul className="text-xs space-y-1">
                    <li
                      className={`flex items-center ${
                        newPassword.length >= 8
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      <span className="mr-1">
                        {newPassword.length >= 8 ? "✓" : "○"}
                      </span>
                      At least 8 characters
                    </li>
                  </ul>
                </div>
              )}

              {newPassword &&
                confirmPassword &&
                newPassword !== confirmPassword && (
                  <p className="text-red-600 text-sm">Passwords don't match</p>
                )}

              <button
                onClick={handlePasswordReset}
                disabled={!isPasswordValid || isLoading}
                className={`w-full py-3 px-4 rounded-md text-white font-semibold transition-colors ${
                  isPasswordValid
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-400 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <span className="animate-spin">↻</span>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordResetModal;
