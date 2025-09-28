import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaPinterest,
  FaTwitter,
} from "react-icons/fa";
import { FaCcMastercard, FaCcVisa, FaCcAmex } from "react-icons/fa";
import logoWhite from "/assets/logo/logo_white.svg";
import android_store from "/assets/download_app/android_store_footer.svg";
import apple_store from "/assets/download_app/apple_store_footer.svg";
import MasterCard from "/assets/icons/master_card.svg";
import VisaCard from "/assets/icons/visa_card.svg";
import AmericanExpress from "/assets/icons/american_express.svg";
import RupayCard from "/assets/icons/rupay_card.svg";
import UPI from "/assets/icons/upi.svg";
import Instagram from "/assets/icons/instagram.svg";
import Facebook from "/assets/icons/facebook.svg";
import Youtube from "/assets/icons/youtube.svg";
import Pinterest from "/assets/icons/pinterest.svg";
import Twitter from "/assets/icons/twitter.svg";
import Cookies from "js-cookie";
import config from "../../config/config";
import SignInModal from "./SigninModal";
import { useAppContext } from "../../context/AppContext";

const baseUrl = config.VITE_BASE_WEBSITE_URL;

const Footer = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  const handleButtonClick = (route) => {
    const userToken = Cookies.get(`${config.BRAND_NAME}userToken`);
    if (userToken) navigate(`${baseUrl}/${route}`);
    else setShowLoginModal(true);
  };

  return (
    <footer className="relative bg-[#333333] text-white py-8 md:py-12 font-poppins">
      <div className="container mx-auto px-4">
        {/* Main grid - responsive columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Logo & Social Section */}
          <div className="md:col-span-2 lg:col-span-1 flex flex-col gap-6">
            <div>
              <img
                src={logoWhite}
                alt="Brand Logo"
                className="bg-white p-2 rounded-lg w-40 md:w-auto border-b-2 border-primary-100"
              />
            </div>

            <div className="flex flex-wrap gap-2 text-2xl sm:text-3xl">
              <a href="#" aria-label="Instagram">
                <img src={Instagram} alt="Instagram" className="h-8 w-auto" />
              </a>
              <a href="#" aria-label="Facebook">
                <img src={Facebook} alt="Facebook" className="h-8 w-auto" />
              </a>
              <a href="#" aria-label="YouTube">
                <img src={Youtube} alt="YouTube" className="h-8 w-auto" />
              </a>
              <a href="#" aria-label="Pinterest">
                <img src={Pinterest} alt="Pinterest" className="h-8 w-auto" />
              </a>
              <a href="#" aria-label="Twitter">
                <img src={Twitter} alt="Twitter" className="h-8 w-auto" />
              </a>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-sm md:text-base">
                Experience our app on Mobile
              </p>
              <div className="flex gap-3">
                <button aria-label="Download on Play Store">
                  <img
                    src={android_store}
                    alt="Google Play"
                    className="h-10 w-auto"
                  />
                </button>
                <button aria-label="Download on App Store">
                  <img
                    src={apple_store}
                    alt="App Store"
                    className="h-10 w-auto"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div>
            <h3 className="text-lg text-white/70 mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={`${baseUrl}/about`} className="hover:text-gray-200">
                  About us
                </a>
              </li>
              <li>
                <a
                  href={`${baseUrl}/contact-us`}
                  className="hover:text-gray-200"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href={`${baseUrl}/become-seller`}
                  className="hover:text-gray-200"
                >
                  Become A Seller
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Services */}
          <div>
            <h3 className="text-lg text-white/70 mb-4">Customer Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => handleButtonClick("profile")}
                  className="hover:text-gray-200"
                >
                  My Account
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleButtonClick("orders")}
                  className="hover:text-gray-200"
                >
                  Track My Order
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleButtonClick("orders")}
                  className="hover:text-gray-200"
                >
                  Return My order
                </button>
              </li>
              <li>
                <a href={`${baseUrl}/faq`} className="hover:text-gray-200">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Our Information */}
          <div>
            <h3 className="text-lg text-white/70 mb-4">Our Information</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={`${baseUrl}/page/privacy-policy`}
                  className="hover:text-gray-200"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href={`${baseUrl}/page/terms-and-conditions`}
                  className="hover:text-gray-200"
                >
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg text-white/70 mb-4">Contact Information</h3>
            <ul className="space-y-2 text-sm">
              {/* <li>
                <button onClick={() => (window.location.href = "tel:+911234567890")} className="hover:text-gray-200">
                  +91-1234567890
                </button>
              </li>
              <li>
                <button onClick={() => (window.location.href = "tel:+910987654321")} className="hover:text-gray-200">
                  +91-0987654321
                </button>
              </li> */}
              <li>
                <button
                  onClick={() =>
                    (window.location.href = "mailto:info@ieradashops.com")
                  }
                  className="hover:text-gray-200"
                >
                  info@ierada.com
                </button>
              </li>
              <li>
                <button
                  // onClick={() =>
                  //   window.open(
                  //     "https://www.google.com/maps/place/B+6/1,+Safdarjung+Enclave,+Delhi+-+110029,+India",
                  //     "_blank"
                  //   )
                  // }
                  className="hover:text-gray-200 text-left"
                >
                  IERADA FASHION PRIVATE LIMITED
                  <br />
                  0 Subash Nagar Phase II,
                  <br />
                  Lucknow/Lesa, Sarojini Nagar, Lucknow, Lucknow- 226008, Uttar
                  Pradesh
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-4">
          <p className="text-sm md:text-base">Safe & Secure Payment</p>
          <div className="flex flex-wrap gap-2 text-4xl sm:text-5xl">
            <button
              aria-label="Mastercard"
              className="h-7 bg-white rounded p-1"
            >
              <img src={MasterCard} alt="Mastercard" className="h-full" />
            </button>
            <button aria-label="Visa" className="h-7 bg-white rounded p-1">
              <img src={VisaCard} alt="Visa" className="h-full" />
            </button>
            <button
              aria-label="American Express"
              className="h-7 bg-white rounded p-1"
            >
              <img
                src={AmericanExpress}
                alt="American Express"
                className="h-full"
              />
            </button>
            <button aria-label="RuPay" className="h-7 bg-white rounded p-1">
              <img src={RupayCard} alt="RuPay" className="h-full" />
            </button>
            <button aria-label="UPI" className="h-7 bg-white rounded p-1">
              <img src={UPI} alt="UPI" className="h-full" />
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between md:justify-center items-center">
            <p className="text-sm text-white text-center md:text-left mb-2 md:mb-0">
              ©️ 2024 Ierada. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>

      {showLoginModal && (
        <SignInModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </footer>
  );
};

export default Footer;
