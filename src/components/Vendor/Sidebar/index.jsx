import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import LogoWhite from "/assets/logo/logo_white.svg";
import config from "../../../config/config";
import { useAppContext } from "../../../context/AppContext";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import LogoutModal from "../LogoutModal";
import { getAdminPermissions } from "../../../services/api.admin";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FileText,
  Building2,
  Settings,
  ArrowLeftRight,
  Megaphone,
  MessageSquare,
  HelpCircle,
  Youtube,
  User,
  LogOut,
  ArrowLeft,
  Image,
  LayoutGrid,
  Users,
  Truck,
  CreditCard,
  DollarSign,
  BarChart3,
  FileCode2,
  TrendingUp,
  BadgeDollarSign,
  Share2,
  CheckSquare,
  Tag,
  Star,
  Headphones,
  Bell,
  PlusCircle,
  List,
  Home,
  Info,
  Mail,
  HelpCircleIcon,
  ShieldCheck,
  Heart,
  MapPin,
  Box,
  Receipt,
  Wallet,
  ScrollText,
  Paintbrush,
} from "lucide-react";

const vendorBaseUrl = config.VITE_BASE_VENDOR_URL;
const adminBaseUrl = config.VITE_BASE_ADMIN_URL;
const websiteBaseUrl = config.VITE_BASE_WEBSITE_URL;

// Create a key for localStorage
const SCROLL_POSITION_KEY = "sidebarScrollPosition";
const ACTIVE_MENU_KEY = "activeMenuItem";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppContext();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const sidebarRef = useRef(null);
  const activeItemRef = useRef(null);
  const currentUrl = window.location.pathname;
  const currentUrlArray = currentUrl.split("/");
  const currentPanel = currentUrlArray[1];
  const [adminPermissions, setAdminPermissions] = useState({});

  // Find active menu item based on current path
  const findActiveMenuItem = (path, menuConfig) => {
    let activeItem = null;
    let activeSubmenuName = null;

    if (menuConfig) {
      menuConfig.mainMenuItems.forEach((item) => {
        if (!item.subMenu && path.includes(item.path)) {
          activeItem = item;
        }

        if (item.subMenu) {
          const matchingSubItem = item.subMenu.find((subItem) =>
            path.includes(subItem.path)
          );
          if (matchingSubItem) {
            activeItem = matchingSubItem;
            activeSubmenuName = item.text;
          }
        }
      });
    }

    return { activeItem, activeSubmenuName };
  };

  useEffect(() => {
    const fetchAdminPermissions = async () => {
      if (user?.role?.toLowerCase() === "admin") {
        try {
          const response = await getAdminPermissions(user.id);
          if (response.status === 1) {
            setAdminPermissions(response.data);
          } else {
            console.error(
              "Failed to fetch admin permissions:",
              response.message
            );
          }
        } catch (error) {
          console.error("Error fetching admin permissions:", error);
        }
      }
    };

    fetchAdminPermissions();
  }, [user]);

  // Initialize activeSubmenu based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    const userRole = user?.role?.toLowerCase() || "website";
    const menuConfig = menuConfigurations[userRole];

    const { activeSubmenuName } = findActiveMenuItem(currentPath, menuConfig);
    if (activeSubmenuName) {
      setActiveSubmenu(activeSubmenuName);
      // Store active submenu in localStorage
      localStorage.setItem(ACTIVE_MENU_KEY, activeSubmenuName);
    }
  }, [location.pathname, user]);

  // Restore active submenu from localStorage on initial load
  useEffect(() => {
    const savedActiveMenu = localStorage.getItem(ACTIVE_MENU_KEY);
    if (savedActiveMenu) {
      setActiveSubmenu(savedActiveMenu);
    }
  }, []);

  // Scroll to active menu item on page load or when active item changes
  useEffect(() => {
    const scrollToActiveItem = () => {
      if (activeItemRef.current && sidebarRef.current) {
        const sidebarTop = sidebarRef.current.getBoundingClientRect().top;
        const itemTop = activeItemRef.current.getBoundingClientRect().top;
        const offset = itemTop - sidebarTop - 100;

        sidebarRef.current.scrollTop += offset;
      }
    };

    // Small delay to ensure DOM has updated
    const timer = setTimeout(scrollToActiveItem, 100);
    return () => clearTimeout(timer);
  }, [location.pathname, activeSubmenu]);

  // Consolidated menu configuration for admin and superadmin
  const adminMenuConfig = {
    baseUrl: adminBaseUrl,
    mainMenuItems: [
      {
        text: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard",
        permissionKey: "dashboard",
      },
      {
        text: "Products",
        icon: Package,
        permissionKey: "product",
        subMenu: [
          {
            text: "Product List",
            icon: List,
            path: "/product/list",
            permissionKey: "product",
            permissionType: "view",
          },
          {
            text: "Add Product",
            icon: PlusCircle,
            path: "/product/add",
            permissionKey: "product",
            permissionType: "add",
          },
          {
            text: "Bulk Upload",
            icon: Package,
            path: "/product/bulk",
            permissionKey: "product",
            permissionType: "bulk",
          },
          {
            text: "Manage Size & Color",
            icon: List,
            path: "/size-color",
            permissionKey: "size_color",
            permissionType: "view",
          },
        ],
      },
      {
        text: "Media",
        icon: Image,
        permissionKey: "banners",
        subMenu: [
          {
            text: "Banner List",
            icon: List,
            path: "/banners/list",
            permissionKey: "banners",
            permissionType: "view",
          },
          {
            text: "Add Banner",
            icon: PlusCircle,
            path: "/banners/add",
            permissionKey: "banners",
            permissionType: "add",
          },
          {
            text: "Slider List",
            icon: List,
            path: "/sliders/list",
            permissionKey: "sliders",
            permissionType: "view",
          },
          {
            text: "Add Slider",
            icon: PlusCircle,
            path: "/sliders/add",
            permissionKey: "sliders",
            permissionType: "add",
          },
          {
            text: "Offer List",
            icon: List,
            path: "/offers/list",
            permissionKey: "offers",
            permissionType: "view",
          },
          {
            text: "Add Offers",
            icon: PlusCircle,
            path: "/offers/add",
            permissionKey: "offers",
            permissionType: "add",
          },
        ],
      },
      {
        text: "Categories",
        icon: LayoutGrid,
        permissionKey: "categories",
        subMenu: [
          {
            text: "Category List",
            icon: List,
            path: "/categories/list",
            permissionKey: "categories",
            permissionType: "view",
          },
          {
            text: "Add Category",
            icon: PlusCircle,
            path: "/categories/add",
            permissionKey: "categories",
            permissionType: "add",
          },
          {
            text: "Subcategory List",
            icon: List,
            path: "/subcategories/list",
            permissionKey: "subcategories",
            permissionType: "view",
          },
          {
            text: "Add Subcategory",
            icon: PlusCircle,
            path: "/subcategories/add",
            permissionKey: "subcategories",
            permissionType: "add",
          },
          {
            text: "InnerSubcategory List",
            icon: List,
            path: "/innersubcategories/list",
            permissionKey: "innersubcategories",
            permissionType: "view",
          },
          {
            text: "Add InnerSubcategory",
            icon: PlusCircle,
            path: "/innersubcategories/add",
            permissionKey: "innersubcategories",
            permissionType: "add",
          },
          {
            text: "Fabric List",
            icon: List,
            path: "/fabrics/list",
            permissionKey: "fabrics",
            permissionType: "view",
          },
          {
            text: "Add Fabric",
            icon: PlusCircle,
            path: "/fabrics/add",
            permissionKey: "fabrics",
            permissionType: "add",
          },
        ],
      },
      {
        text: "Manage Homepage",
        icon: Home,
        path: "/managehomepage",
        permissionKey: "managehomepage",
        permissionType: "view",
      },
      {
        text: "Manage Themes",
        icon: Paintbrush,
        path: "/managethemes",
        permissionKey: "managethemes",
        permissionType: "view",
      },
      {
        text: "FAQs",
        icon: HelpCircle,
        path: "/faqs",
        permissionKey: "faqs",
        permissionType: "view",
      },
      {
        text: "Vendors",
        icon: Users,
        path: "/vendors",
        permissionKey: "vendors",
        permissionType: "view",
      },
      {
        text: "Customers",
        icon: Users,
        path: "/customers",
        permissionKey: "customers",
        permissionType: "view",
      },
      {
        text: "Orders",
        icon: ShoppingCart,
        path: "/orders",
        permissionKey: "orders",
        permissionType: "view",
      },
      {
        text: "Reports",
        icon: BarChart3,
        path: "/report",
        permissionKey: "report",
        permissionType: "view",
      },
      {
        text: "CMS Pages",
        icon: FileCode2,
        path: "/cmspages",
        permissionKey: "cmspages",
        permissionType: "view",
      },
      {
        text: "Vendor Performance",
        icon: TrendingUp,
        path: "/vendorperformance",
        permissionKey: "vendorperformance",
        permissionType: "view",
      },
      {
        text: "Finance Panel",
        icon: BadgeDollarSign,
        path: "/finance",
        permissionKey: "finance",
        permissionType: "view",
      },
      {
        text: "Marketing",
        icon: Megaphone,
        permissionKey: "coupons",
        subMenu: [
          {
            text: "Manage Ads",
            icon: List,
            path: "/ads/list",
            permissionKey: "ads",
            permissionType: "view",
          },
          {
            text: "Coupon List",
            icon: List,
            path: "/coupons/list",
            permissionKey: "coupons",
            permissionType: "view",
          },
          {
            text: "Add Coupon",
            icon: PlusCircle,
            path: "/coupons/add",
            permissionKey: "coupons",
            permissionType: "add",
          },
        ],
      },
      {
        text: "Support",
        icon: Headphones,
        permissionKey: "customer_support",
        subMenu: [
          {
            text: "Customer Support",
            icon: User,
            path: "/support/customer",
            permissionKey: "customer_support",
            permissionType: "view",
          },
          {
            text: "Vendor Support",
            icon: Building2,
            path: "/support/vendor",
            permissionKey: "vendor_support",
            permissionType: "view",
          },
        ],
      },
      {
        text: "Manage Admins",
        icon: Users,
        path: "/team/list",
        permissionKey: "team",
      },
      {
        text: "Settings",
        icon: Settings,
        path: "/settings",
        permissionKey: "settings",
        permissionType: "view",
      },
      {
        text: "Review",
        icon: Star,
        path: "/review",
        permissionKey: "review",
        permissionType: "view",
      },
      {
        text: "Email Subscriptions",
        icon: Mail,
        path: "/emailsubscribers",
        permissionKey: "emailsubscribers",
        permissionType: "view",
      },
      {
        text: "Profile",
        icon: User,
        path: "/profile",
        permissionKey: "profile",
        permissionType: "view",
      },
      {
        text: "Notifications",
        icon: Bell,
        path: "/notifications",
        permissionKey: "notifications",
        permissionType: "view",
      },
    ],
  };

  const menuConfigurations = {
    website: {
      baseUrl: websiteBaseUrl,
      mainMenuItems: [
        { text: "Home", icon: Home, path: "/" },
        { text: "About Us", icon: Info, path: "/about" },
        { text: "Contact Us", icon: Mail, path: "/contact-us" },
        { text: "FAQs", icon: HelpCircleIcon, path: "/faq" },
        { text: "Become Seller", icon: ShieldCheck, path: "/become-seller" },
        { text: "My Orders", icon: ShoppingCart, path: "/orders" },
        { text: "Wishlist", icon: Heart, path: "/wishlist" },
        { text: "My Addresses", icon: MapPin, path: "/addresses" },
        { text: "My Cart", icon: Box, path: "/cart" },
        { text: "Billing", icon: Receipt, path: "/billing" },
        { text: "Wallet", icon: Wallet, path: "/wallet" },
        { text: "Support", icon: Headphones, path: "/support" },
        { text: "Settings", icon: Settings, path: "/settings" },
        { text: "Notifications", icon: Bell, path: "/notifications" },
      ],
    },
    vendor: {
      baseUrl: vendorBaseUrl,
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
    },
    admin: adminMenuConfig,
    superadmin: adminMenuConfig,
  };

  // Filter menu items based on permissions for admin users
  const getFilteredMenuItems = (mainMenuItems, userRole, permissions) => {
    if (userRole === "superadmin") return mainMenuItems;
    if (userRole !== "admin") return mainMenuItems;

    return mainMenuItems
      .map((item) => {
        if (item.text === "Dashboard" || item.text === "Profile") {
          return item;
        }

        if (item.subMenu) {
          const filteredSubMenu = item.subMenu.filter((subItem) => {
            const subPerms = permissions[subItem.permissionKey];
            return subPerms && subPerms[subItem.permissionType];
          });

          if (filteredSubMenu.length > 0) {
            return { ...item, subMenu: filteredSubMenu };
          }
          return null;
        }

        const perms = permissions[item.permissionKey];
        if (perms && perms[item.permissionType]) {
          return item;
        }
        return null;
      })
      .filter((item) => item !== null);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.clear();
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0];
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    setSidebarOpen(false);
    setShowLogoutModal(false);
    navigate(
      `${config.VITE_BASE_WEBSITE_URL}/signin-${
        user.role === "vendor" ? "vendor" : "admin"
      }`
    );
  };

  const toggleSubmenu = (text) => {
    // Save current scroll position before state update
    const scrollPosition = sidebarRef.current
      ? sidebarRef.current.scrollTop
      : 0;

    setActiveSubmenu(activeSubmenu === text ? null : text);

    // Store active submenu in localStorage
    if (activeSubmenu !== text) {
      localStorage.setItem(ACTIVE_MENU_KEY, text);
    } else {
      localStorage.removeItem(ACTIVE_MENU_KEY);
    }

    // Restore scroll position after state update
    setTimeout(() => {
      if (sidebarRef.current) {
        sidebarRef.current.scrollTop = scrollPosition;
      }
    }, 0);
  };

  // Handle navigation click to preserve scroll position
  const handleNavigation = () => {
    // Keep the sidebar open on larger screens, close on mobile
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // Check if the current path matches a menu item path
  const isMenuItemActive = (itemPath, currentPath) => {
    return currentPath.includes(itemPath);
  };

  const MenuItem = ({ item, baseUrl }) => {
    const IconComponent = item.icon;
    const currentPath = location.pathname;
    const isActive = isMenuItemActive(item.path, currentPath);

    if (item.subMenu) {
      const hasActiveSubItem = item.subMenu.some((subItem) =>
        isMenuItemActive(subItem.path, currentPath)
      );

      return (
        <li
          className="rounded p-2 group"
          ref={hasActiveSubItem ? activeItemRef : null}
        >
          <button
            onClick={() => toggleSubmenu(item.text)}
            className={`text-[#353535] group-hover:text-[#0065CD] text-[15px]
            font-satoshi font-normal inline-flex items-center justify-between w-full px-2
            ${hasActiveSubItem ? "text-[#0065CD]" : ""}`}
          >
            <div className="flex items-center gap-4">
              <IconComponent className="w-5 h-5" />
              {item.text}
            </div>
            <span
              className={`transform transition-transform duration-200 ${
                activeSubmenu === item.text ? "rotate-180" : ""
              }`}
            >
              <IoIosArrowDown />
            </span>
          </button>
          {activeSubmenu === item.text && (
            <ul className="pl-6 mt-2 space-y-1">
              {item.subMenu.map((subItem, subIndex) => {
                const SubIconComponent = subItem.icon;
                const isSubItemActive = isMenuItemActive(
                  subItem.path,
                  currentPath
                );

                return (
                  <li
                    key={subIndex}
                    className="rounded p-1"
                    ref={isSubItemActive ? activeItemRef : null}
                  >
                    <NavLink
                      to={`${baseUrl}${subItem.path}`}
                      className={({ isActive }) =>
                        `group-hover:text-[#0065CD] group-focus:text-white text-[14px]
                        font-satoshi font-normal inline-flex items-center gap-2 px-3 w-full
                        ${
                          isActive
                            ? "bg-[#0065CD1C] text-[#0065CD] rounded-full flex justify-between items-center"
                            : "text-[#353535]"
                        }`
                      }
                      onClick={() => {
                        handleNavigation();
                        if (isSubItemActive) {
                          setActiveSubmenu(item.text);
                          localStorage.setItem(ACTIVE_MENU_KEY, item.text);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <SubIconComponent className="w-4 h-4" />
                        {subItem.text}
                      </div>
                      {({ isActive }) =>
                        isActive && (
                          <IoIosArrowForward className="text-[black]" />
                        )
                      }
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li className="rounded py-2 group" ref={isActive ? activeItemRef : null}>
        <NavLink
          to={`${baseUrl}${item.path}`}
          className={({ isActive }) =>
            `w-full flex justify-between group-hover:bg-[#0065CD1C] group-hover:text-[#0065CD] group-hover:rounded-r-full group-focus:text-white text-[15px]
            font-satoshi font-normal items-center gap-2 px-4 py-2
            ${
              isActive
                ? "bg-[#0065CD1C] text-[#0065CD] rounded-r-full"
                : "text-[#353535]"
            }`
          }
          onClick={handleNavigation}
        >
          <div className="flex gap-4">
            <IconComponent className="w-5 h-5" />
            {item.text}
          </div>
          {({ isActive }) =>
            isActive ? (
              <span className="bg-white rounded-full">
                <IoIosArrowForward />
              </span>
            ) : null
          }
        </NavLink>
      </li>
    );
  };

  const roleMenuConfig =
    menuConfigurations[user?.role?.toLowerCase()] || menuConfigurations.website;

  const filteredMenuItems = getFilteredMenuItems(
    roleMenuConfig.mainMenuItems,
    user?.role?.toLowerCase(),
    user?.role?.toLowerCase() === "admin" ? adminPermissions : {}
  );

  return (
    <>
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        bg-white fixed inset-y-0 left-0 z-[999] flex flex-col h-screen text-white w-56
        py-2 shadow-md duration-300 ease-in-out lg:translate-x-0 lg:static
        lg:inset-0 overflow-hidden`}
      >
        <div className="flex items-center justify-between p-5 my-4 gap-2">
          <button
            className="w-full flex justify-center"
            onClick={() => {
              handleNavigation();
              navigate(
                currentPanel === "vendor"
                  ? `${config.VITE_BASE_VENDOR_URL}/dashboard`
                  : `${config.VITE_BASE_ADMIN_URL}/dashboard`
              );
            }}
          >
            <img src={LogoWhite} className="h-16 rounded-lg" alt="Logo" />
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-2 right-2 rounded-md lg:hidden text-gray-500 hover:text-white hover:bg-gray-700 p-1"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto" ref={sidebarRef}>
          <ul className="text-white font-semibold text-sm justify-center items-center">
            {filteredMenuItems.map((item, index) => (
              <MenuItem
                key={index}
                item={item}
                baseUrl={roleMenuConfig.baseUrl}
              />
            ))}
          </ul>
        </div>
        <div className="mt-auto mb-4">
          <ul className="space-y-1">
            <li className="rounded p-2 group">
              <button
                onClick={handleLogoutClick}
                className="w-full px-2 py-2 text-[#353535] group-hover:bg-[#0065CD1C] group-hover:text-[#0065CD]
                text-[15px] font-satoshi font-normal inline-flex items-center gap-4"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
      {showLogoutModal && (
        <LogoutModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleLogoutConfirm}
        />
      )}
    </>
  );
};

export default Sidebar;
