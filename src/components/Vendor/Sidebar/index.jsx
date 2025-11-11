import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import LogoWhite from "/assets/logo/logo_white.svg";
import { useAppContext } from "../../../context/AppContext";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import LogoutModal from "../LogoutModal";
import Cookies from "js-cookie";
import config from "../../../config/config";
import {
  LayoutDashboard, ShoppingCart, Package, FileText, Building2, Settings,
  ArrowLeftRight, Megaphone, MessageSquare, HelpCircle, Youtube, User,
  LogOut, ArrowLeft, PlusCircle, Star, Bell
} from "lucide-react";

const SCROLL_POSITION_KEY = "vendorSidebarScroll";
const ACTIVE_MENU_KEY = "vendorActiveMenu";

const VendorSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppContext();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const sidebarRef = useRef(null);
  const activeItemRef = useRef(null);

  const vendorMenuConfig = {
    mainMenuItems: [
      { text: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { text: "Orders", icon: ShoppingCart, path: "/orders" },
      { text: "Products", icon: Package, path: "/product" },
      { text: "Bulk Upload", icon: PlusCircle, path: "/bulk-upload" },
      { text: "Invoice/Bill", icon: FileText, path: "/invoice" },
      { text: "Profile", icon: Building2, path: "/profile" },
      { text: "Settings", icon: Settings, path: "/settings" },
      { text: "Report", icon: ArrowLeftRight, path: "/report" },
      { text: "Advertising", icon: Megaphone, path: "/ads/history" },
      { text: "Review", icon: Star, path: "/review" },
      { text: "Support", icon: HelpCircle, path: "/support" },
      { text: "Training", icon: Youtube, path: "/training" },
      { text: "Notifications", icon: Bell, path: "/notifications" },
    ],
  };

  // restore scroll & active submenu
  useEffect(() => {
    const saved = localStorage.getItem(ACTIVE_MENU_KEY);
    if (saved) setActiveSubmenu(saved);
    const scroll = localStorage.getItem(SCROLL_POSITION_KEY);
    if (scroll && sidebarRef.current) sidebarRef.current.scrollTop = Number(scroll);
  }, []);

  // save scroll on navigation
  useEffect(() => {
    const saveScroll = () => {
      if (sidebarRef.current) localStorage.setItem(SCROLL_POSITION_KEY, sidebarRef.current.scrollTop);
    };
    window.addEventListener("beforeunload", saveScroll);
    return () => window.removeEventListener("beforeunload", saveScroll);
  }, []);

  const toggleSubmenu = (text) => {
    setActiveSubmenu(activeSubmenu === text ? null : text);
    localStorage.setItem(ACTIVE_MENU_KEY, activeSubmenu === text ? "" : text);
  };

  const handleNavigation = () => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const handleLogoutConfirm = () => {
    localStorage.clear();
    document.cookie.split(";").forEach((c) => {
      const name = c.split("=")[0].trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    setSidebarOpen(false);
    setShowLogoutModal(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname.includes(path);

  const MenuItem = ({ item }) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <li className="rounded py-2 group" ref={active ? activeItemRef : null}>
        <NavLink
          to={item.path}
          className={({ isActive }) =>
            `flex justify-between items-center gap-2 px-4 py-2 text-[15px] font-satoshi font-normal
            ${isActive ? "bg-[#0065CD1C] text-[#0065CD] rounded-r-full" : "text-[#353535]"} 
            group-hover:bg-[#0065CD1C] group-hover:text-[#0065CD] group-hover:rounded-r-full`
          }
          onClick={handleNavigation}
        >
          <div className="flex gap-4">
            <Icon className="w-5 h-5" />
            {item.text}
          </div>
          {active && <IoIosArrowForward />}
        </NavLink>
      </li>
    );
  };

  return (
    <>
      <div className="flex flex-col h-screen bg-white">
        <div className="flex items-center justify-center p-5 my-4">
          <button onClick={() => navigate("/dashboard")}>
            <img src={LogoWhite} className="h-16 rounded-lg" alt="Logo" />
          </button>
          <button onClick={() => setSidebarOpen(false)} className="absolute top-2 right-2 lg:hidden">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto" ref={sidebarRef}>
          <ul className="space-y-1 px-2">
            {vendorMenuConfig.mainMenuItems.map((item, i) => (
              <MenuItem key={i} item={item} />
            ))}
          </ul>
        </div>

        <div className="mb-4 px-2">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-4 px-4 py-2 text-[#353535] hover:bg-[#0065CD1C] hover:text-[#0065CD] rounded"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {showLogoutModal && (
        <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleLogoutConfirm} />
      )}
    </>
  );
};

export default VendorSidebar;