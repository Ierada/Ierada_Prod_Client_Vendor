import React from "react";
import { Link } from "react-router-dom";
import config from "../../../config/config";
import { MdPersonOutline } from "react-icons/md";
import { BsBoxSeam } from "react-icons/bs";
import { IoMdHeartEmpty } from "react-icons/io";
import { GoLocation } from "react-icons/go";
import { IoMdNotificationsOutline } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { LuLogOut } from "react-icons/lu";
import { CiWallet } from "react-icons/ci";
import { MdOutlineSupportAgent } from "react-icons/md";
import { GoGift } from "react-icons/go";

export const AccountInfo = ({ activeSection }) => {
  const sections = [
    { id: "profile", title: "Personal Information", icon: <MdPersonOutline /> },
    { id: "orders", title: "My Orders", icon: <BsBoxSeam /> },
    { id: "wishlist", title: "My Wishlist", icon: <IoMdHeartEmpty /> },
    { id: "addresses", title: "My Addresses", icon: <GoLocation /> },
    {
      id: "wallet",
      title: "My Wallets & Rewards",
      icon: <CiWallet />,
    },
    {
      id: "referral",
      title: "Refer & Earn",
      icon: <GoGift />,
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: <IoMdNotificationsOutline />,
    },
    { id: "settings", title: "Settings", icon: <IoSettingsOutline /> },
    {
      id: "support",
      title: "Support",
      icon: <MdOutlineSupportAgent />,
    },
    { id: "logout", title: "Logout", icon: <LuLogOut /> },
  ];

  return (
    <div>
      <div className="flex md:flex-col md:my-10 overflow-x-auto whitespace-nowrap border border-gray-200 ">
        {sections?.map((section) => (
          <Link
            key={section.id}
            to={`${config.VITE_BASE_WEBSITE_URL}/${section.id}`}
            className={`flex items-center gap-3 p-2 md:p-3   lg:p-4 text-xs lg:text-base font-normal font-Lato ${
              activeSection === section.id
                ? "bg-black text-white"
                : "bg-gray-50 text-[black]"
            } hover:bg-[#868e6e] hover:shadow-lg transition-all `}
          >
            {/* Icon Section */}
            <div className="  text-base md:text-sm lg:text-xl">
              {section.icon}
            </div>
            {/* Title Section */}
            <h2 className="text-[12px] md:text-xs lg:text-base  font-medium">
              {section.title}
            </h2>
          </Link>
        ))}
      </div>
    </div>
  );
};
