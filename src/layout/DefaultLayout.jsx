import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Menu, X } from "lucide-react";

import WebsiteHeader from "../components/Website/Header";
import WebsiteFooter from "../components/Website/Footer";
import DesignerHeader from "../components/Vendor/Header";
import DesignerSidebar from "../components/Vendor/Sidebar";
import AdminHeader from "../components/Admin/Header";

const DefaultLayout = ({ children, footerData }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userType, setUserType] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [headerHeight, setHeaderHeight] = useState(0);

  const urlType = location.pathname.split("/")[1];

  const isWebsitePage =
    urlType !== "admin" &&
    urlType !== "vendor" &&
    !location.pathname.startsWith("/signin");

  const isSigninPage = location.pathname.startsWith("/signin");

  const isDesignerPage = urlType === "vendor";
  const isAdminPage = urlType === "admin";

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  // useEffect(() => {
  //   const checkAuth = () => {
  //     if (isWebsitePage || isSigninPage) return;

  //     const userToken = Cookies.get(`${import.meta.env.VITE_BRAND_NAME}userToken`);
  //     if (!userToken) {
  //       localStorage.removeItem('user');
  //       Cookies.remove('userToken');
  //       navigate('/signin');
  //     } else {
  //       try {
  //         const decoded = jwtDecode(userToken);
  //         setUserType(decoded.user_type || null);
  //       } catch (error) {
  //         console.error('Error decoding token:', error);
  //         navigate('/signin');
  //       }
  //     }
  //   };

  //   checkAuth();
  // }, [location.pathname, navigate, isWebsitePage, isSigninPage]);

  // Get current sidebar component based on route
  const getCurrentSidebar = () => {
    if (isDesignerPage) return DesignerSidebar;
    if (isAdminPage) return DesignerSidebar;
    return null;
  };

  // Get current header component based on route
  const getCurrentHeader = () => {
    if (isWebsitePage) return WebsiteHeader;
    if (isDesignerPage) return DesignerHeader;
    if (isAdminPage) return DesignerHeader;
    return null;
  };

  const SidebarComponent = getCurrentSidebar();
  const HeaderComponent = getCurrentHeader();

  return (
    <div className="">
      {/* <div className="flex h-screen overflow-hidden"> */}
      <div className="flex min-h-screen">
        {!isWebsitePage && !isSigninPage && (
          <div
            className={`fixed inset-y-0 left-0 z-30 w-56 transform 
            bg-white dark:bg-gray-800 transition-transform duration-300 ease-in-out
            ${
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            }`}
          >
            <SidebarComponent
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        )}
        <div
          className={`relative flex flex-1 flex-col overflow-x-hidden ${
            // className={`relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden ${
            // sidebarOpen && !isWebsitePage ? '' : ''
            !isWebsitePage && !isSigninPage ? "lg:ml-56 mt-18" : ""
          }`}
        >
          {HeaderComponent && (
            <HeaderComponent
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              {...(isWebsitePage && { setHeaderHeight })}
            >
              {!isWebsitePage && (
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-md lg:hidden hover:bg-gray-100"
                >
                  {sidebarOpen ? (
                    <X className="w-6 h-6" color="white" />
                  ) : (
                    <Menu className="w-6 h-6" color="white" />
                  )}
                </button>
              )}
            </HeaderComponent>
          )}
          <main
            className={`flex-grow ${
              isWebsitePage || isSigninPage ? "bg-white" : "p-4 bg-[#F5F6F8]"
            }`}
          >
            <div
              className={`${
                isWebsitePage
                  ? "pt-4 md:pt-20"
                  : isSigninPage
                  ? ""
                  : "mx-auto max-w-screen-2xl"
              }`}
              style={isWebsitePage ? { marginTop: `${headerHeight}px` } : {}}
            >
              {children}
            </div>
          </main>
          {isWebsitePage && !isSigninPage && (
            <WebsiteFooter data={footerData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DefaultLayout;
