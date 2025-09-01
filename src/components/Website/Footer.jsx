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
import upi_icon from "/assets/icons/upi_icon.svg";
import rupay_icon from "/assets/icons/rupay_icon.svg";
import Cookies from "js-cookie";
import config from "../../config/config";
import SignInModal from "./SigninModal";
import { useAppContext } from "../../context/AppContext";

const baseUrl = config.VITE_BASE_WEBSITE_URL;

export const popular_search = [
  {
    id: 1,
    name: "Jeans",
    slug: "Jeans",
  },
  {
    id: 2,
    name: "Tops",
    slug: "TOps",
  },
  {
    id: 3,
    name: "Sweat Shirts",
    slug: "Sweat Shirts",
  },
  {
    id: 4,
    name: "Jacket",
    slug: "Jacket",
  },
  {
    id: 5,
    name: "Salwar Suit",
    slug: "Salwar Suit",
  },
  {
    id: 6,
    name: "Sherwani",
    slug: "Sherwani",
  },
  {
    id: 7,
    name: "Nehru Jackets",
    slug: "Nehru Jackets",
  },
  {
    id: 8,
    name: "Saree",
    slug: "Saree",
  },
  {
    id: 9,
    name: "Lehanga",
    slug: "Lehanga",
  },
  {
    id: 10,
    name: "Crop Top",
    slug: "Crop Top",
  },
  {
    id: 11,
    name: "Cotton Shirt",
    slug: "Cotton Shirt",
  },
  {
    id: 12,
    name: "Nehru Jacket",
    slug: "Nehru Jacket",
  },
  {
    id: 13,
    name: "Jeans",
    slug: "Jeans",
  },
  {
    id: 14,
    name: "Tops",
    slug: "TOps",
  },
  {
    id: 15,
    name: "Sweat Shirts",
    slug: "Sweat Shirts",
  },
  {
    id: 16,
    name: "Jacket",
    slug: "Jacket",
  },
  {
    id: 17,
    name: "Salwar Suit",
    slug: "Salwar Suit",
  },
];

const Footer = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  const handleButtonClick = (route) => {
    const userToken = Cookies.get(`${config.BRAND_NAME}userToken`);
    if (userToken) navigate(`${baseUrl}/${route}`);
    else setShowLoginModal(true);
  };

  return (
    <footer className="relative bg-black text-white py-8 md:py-12 font-poppins">
      <div className="container mx-auto px-4">
        {/* Main grid - responsive columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Logo & Social Section */}
          <div className="md:col-span-2 lg:col-span-1 flex flex-col gap-6">
            <div>
              <img
                src={logoWhite}
                alt="Brand Logo"
                className="bg-white p-2 rounded-lg w-40 md:w-auto"
              />
            </div>

            <div className="flex flex-wrap gap-4 text-2xl sm:text-3xl">
              <a href="#" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#" aria-label="Facebook">
                <FaFacebook />
              </a>
              <a href="#" aria-label="YouTube">
                <FaYoutube />
              </a>
              <a href="#" aria-label="Pinterest">
                <FaPinterest />
              </a>
              <a href="#" aria-label="Twitter">
                <FaTwitter />
              </a>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-sm md:text-base">Safe & Secure Payment</p>
              <div className="flex flex-wrap gap-2 text-4xl sm:text-5xl">
                <button aria-label="Mastercard">
                  <FaCcMastercard />
                </button>
                <button aria-label="Visa">
                  <FaCcVisa />
                </button>
                <button aria-label="American Express">
                  <FaCcAmex />
                </button>
                <button aria-label="RuPay">
                  <img src={rupay_icon} alt="RuPay" className="w-10 h-10" />
                </button>
                <button aria-label="UPI">
                  <img src={upi_icon} alt="UPI" className="w-10 h-10" />
                </button>
              </div>
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
            <h3 className="text-lg mb-4">Company</h3>
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
            <h3 className="text-lg mb-4">Customer Services</h3>
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
            <h3 className="text-lg mb-4">Our Information</h3>
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
            <h3 className="text-lg mb-4">Contact Info</h3>
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

        {/* Popular Searches - improved responsiveness */}
        <div className="mt-8 pt-4 border-t border-white/20">
          <h3 className="text-sm font-medium mb-2">Popular Search:</h3>
          <div className="flex flex-wrap gap-1 text-xs">
            {popular_search.map((item, index) => (
              <button
                key={index}
                className="text-xs font-thin flex text-nowrap"
              >
                {item.name}
                {index < popular_search.length - 1 && (
                  <span className="px-2">/</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center">
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
