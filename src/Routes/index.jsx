import React, { useEffect, useState } from "react";
import {
  useRoutes,
  Navigate,
  useNavigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import config from "../config/config";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { getAdminPermissions } from "../services/api.admin";

import NotFoundPage from "../pages/NotFound/index.jsx";
import AccessNotice from "../pages/NotFound/AccessNotice.jsx";

// Website imports
import Home from "../pages/Website/Home";
import CollectionsPage from "../pages/Website/Collections";
import ProductPage from "../pages/Website/ProductDescription";
import AboutUs from "../pages/Website/AboutUs";
import ContactUs from "../pages/Website/ContactUs/index.jsx";
import FAQsPage from "../pages/Website/FAQsPage/index.jsx";
import BecomeSeller from "../pages/Website/BecomeSeller/index.jsx";
import CartPage from "../pages/Website/MyCart";
import MyOrders from "../pages/Website/MyOrders/index.jsx";
import Wishlist from "../pages/Website/MyWishlist/index.jsx";
import MyAddressPage from "../pages/Website/MyAddress/index.jsx";
import ProfilePage from "../pages/Website/MyProfile/index.jsx";
import CheckoutPage from "../pages/Website/Checkout/index.jsx";
import OrderSuccessful from "../pages/Website/OrderSuccessful/index.jsx";
import OrderTrack from "../pages/Website/OrderTrack/index.jsx";
import TrackResult from "../pages/Website/TrackResult/index.jsx";
import BlogPage from "../pages/Website/Blogs/index.jsx";
import BlogPost from "../pages/Website/BlogPost/index.jsx";
import Billing from "../pages/Website/BillingPage/index.jsx";
import Notification from "../pages/Website/Notifications/index.jsx";
import Wallet from "../pages/Website/Wallet/index.jsx";
import Support from "../pages/Website/Support/index.jsx";
import Settings from "../pages/Website/Settings/index.jsx";
import Logout from "../pages/Website/Logout/index.jsx";
import PrivacyPolicyAndTermsAndConditions from "../pages/Website/PoliciesAndConditions/index.jsx";
import ReferralPage from "../pages/Website/Referral/index.jsx";

// Signin page
import SignIn from "../pages/Vendor/Authentication/SignIn";

// Vendor Dashboard Pages
import Dashboard from "../pages/Vendor/Dashboard";
import Product from "../pages/Vendor/Product";
import AddEditProduct from "../pages/Vendor/AddProduct";
import Setting from "../pages/Vendor/Setting";
import Order from "../pages/Vendor/Order";
import Invoice from "../pages/Vendor/Invoice";
import Coupons from "../pages/Vendor/Coupons";
import Report from "../pages/Vendor/Report";
import Profile from "../pages/Vendor/Profile";
import TrackCustomerOrders from "../pages/Vendor/TrackOrder";
import CreateCampaign from "../components/Vendor/CreateCampaign";
import Review from "../pages/Vendor/Review";
import Subcriptions from "../pages/Vendor/Subcriptions";
import ManageInfluencer from "../pages/Vendor/ManageInfluencer";
import ChatLayout from "../pages/Vendor/Chat";
import TutorialPage from "../pages/Vendor/Tutorial/index.jsx";
import SupportPage from "../pages/Vendor/Support/index.jsx";
import VendorNotification from "../pages/Vendor/Notification/index.jsx";
import VendorLogoutPage from "../pages/Vendor/Logout/index.jsx";
import VendorAdlist from "../pages/Vendor/AdList/index.jsx";
import CreateAdPage from "../pages/Vendor/AddAdvertisement/index.jsx";

// Admin Dashboard
import AdminDashboard from "../pages/Admin/Dashboard/index.jsx";
import BlogForm from "../pages/Admin/AddBlog/index.jsx";
import BlogList from "../pages/Admin/BlogList/index.jsx";
import AddBanner from "../pages/Admin/Banner/addBanner.jsx";
import AddSlider from "../pages/Admin/Slider/addSlider.jsx";
import AddLabel from "../pages/Admin/Label/addLabel.jsx";
import AddCategory from "../pages/Admin/Category/addCategory.jsx";
import AddSubCategory from "../pages/Admin/SubCategory/addSubcategory.jsx";
import BannerList from "../pages/Admin/Banner/bannerlist.jsx";
import SliderList from "../pages/Admin/Slider/sliderlist.jsx";
import LabelList from "../pages/Admin/Label/labellist.jsx";
import CategoryList from "../pages/Admin/Category/categorylist.jsx";
import SubCategoryList from "../pages/Admin/SubCategory/subcategorylist.jsx";
import CouponList from "../pages/Admin/CouponList/index.jsx";
import AddCoupon from "../pages/Admin/AddCoupon/index.jsx";
import FabricList from "../pages/Admin/FabricList";
import AddFabric from "../pages/Admin/AddFabric/index.jsx";
import ProductList from "../pages/Admin/Product/productlist.jsx";
import VendorManagement from "../pages/Admin/Vendor/vendorList.jsx";
import CustomerSupport from "../pages/Admin/CustomerSupport/index.jsx";
import VendorSupport from "../pages/Admin/VendorSupport/index.jsx";
import BillsInvoice from "../pages/Admin/BillsInvoices/index.jsx";
import CMS from "../pages/Admin/CMS/index.jsx";
import VendorPerformance from "../pages/Admin/VendorPerformance/index.jsx";
import VendorTransaction from "../pages/Admin/VendorTransaction/index.jsx";
import Charges from "../pages/Admin/Charges/index.jsx";
import WebsiteSettings from "../pages/Admin/WebsiteSettings/index.jsx";
import Attributs from "../pages/Admin/Attributes/index.jsx";
import TeamList from "../pages/Admin/TeamList/index.jsx";
import CreateTeamSubUsers from "../pages/Admin/TeamList/addTeam.jsx";
import OrderShipment from "../pages/Admin/OrderShipment/index.jsx";
import ShippingPartner from "../pages/Admin/ShippingPartner/index.jsx";
import AdminSetting from "../pages/Admin/Settings/index.jsx";
import AdminProfile from "../pages/Admin/Profile/index.jsx";
import AdminNotification from "../pages/Admin/Notification/index.jsx";
import AdminOrders from "../pages/Admin/Order/index.jsx";
import Finance from "../pages/Admin/Finance/index.jsx";
import ReviewAdminPage from "../pages/Admin/Review/index.jsx";
import ReportAdminPage from "../pages/Admin/Report/index.jsx";
import FAQsList from "../pages/Admin/FAQsList/index.jsx";
import ContactUsList from "../pages/Admin/ContactUsList/index.jsx";
import CustomerManagement from "../pages/Admin/Customer/CustomerManagement.jsx";
import AddEditProductAdmin from "../pages/Admin/Product/addProduct.jsx";
import HomepageManager from "../pages/Admin/HomepageManager/index.jsx";
import SectionManagement from "../pages/Admin/HomepageManager/SectionManagement.jsx";
import OfferBannerList from "../pages/Admin/OfferBanner/index.jsx";
import AddOfferForm from "../pages/Admin/OfferBanner/addoffer.jsx";
import SharedOrderPage from "../pages/Website/SharedOrderPage/index.jsx";
import ReferralSettings from "../pages/Admin/Refer&Earn/index.jsx";
import AdsList from "../pages/Admin/ActiveAds/AdsList.jsx";
import InnersubCategory from "../pages/Admin/InnerSubCategory/Innersubcategorylist.jsx";
import AddInnerSubCategory from "../pages/Admin/InnerSubCategory/addInnerSubcategory.jsx";
import ProductFilesManager from "../pages/Admin/Product/ProductFilesManager.jsx";
import PageView from "../pages/Website/CMSPage/index.jsx";
import EmailSubscribers from "../pages/Admin/EmailSubscribe/index.jsx";
import SizeColorManagement from "../pages/Admin/SizeColorManagement/index.jsx";
import SettingsManagement from "../pages/Admin/Settings/SettingsManagement.jsx";
import AccountDeletionInstructions from "../pages/Website/AccountDeletion/index.jsx";
import ProductThemeManager from "../pages/Admin/ProductThemeManager/index.jsx";
import ProductThemeEditor from "../pages/Admin/ProductThemeManager/ProductThemeEditor.jsx";
import ThemeSectionManager from "../pages/Admin/ProductThemeManager/ThemeSectionManager.jsx";
import ThemeSectionEditor from "../pages/Admin/ProductThemeManager/ThemeSectionEditor.jsx";
import ProductThemePage from "../pages/Website/ProductTheme/index.jsx";
import AdminVendorForm from "../pages/Admin/Vendor/addVendor.jsx";

// Permission mapping for routes
const routePermissions = {
  dashboard: { view: true },
  "product/list": { view: true },
  "product/add": { add: true },
  "product/edit/:id": { edit: true },
  "product/bulk": { bulk: true },
  "blogs/add": { add: true },
  "blogs/list": { view: true },
  "blogs/edit/:blogId": { edit: true },
  "banners/add": { add: true },
  "banners/list": { view: true },
  "banners/edit/:id": { edit: true },
  "sliders/add": { add: true },
  "sliders/list": { view: true },
  "labels/add": { add: true },
  "labels/list": { view: true },
  "categories/add": { add: true },
  "categories/list": { view: true },
  "subcategories/add": { add: true },
  "subcategories/list": { view: true },
  "innersubcategories/add": { add: true },
  "innersubcategories/list": { view: true },
  "coupons/add": { add: true },
  "coupons/list": { view: true },
  "fabrics/add": { add: true },
  "fabrics/list": { view: true },
  vendors: { view: true },
  customers: { view: true },
  "support/customer": { view: true },
  "support/vendor": { view: true },
  billsandinvoices: { view: true },
  cmspages: { view: true },
  vendorperformance: { view: true },
  vendortransaction: { view: true },
  charges: { view: true },
  websettings: { view: true },
  attributes: { view: true },
  "team/list": { view: true },
  "team/add": { add: true },
  "team/:id": { edit: true },
  shipment: { view: true },
  shippingpartner: { view: true },
  "ads/list": { view: true },
  settings: { view: true },
  profile: { view: true },
  notifications: { view: true },
  orders: { view: true },
  finance: { view: true },
  review: { view: true },
  report: { view: true },
  faqs: { view: true },
  contactus: { view: true },
  managehomepage: { view: true },
  "managehomepage/addsection": { add: true },
  "managehomepage/editsection/:id": { edit: true },
  emailsubscribers: { view: true },
  "size-color": { view: true },
  "offers/add": { add: true },
  "offers/list": { view: true },
  "offers/edit/:id": { edit: true },
  "referral-settings": { view: true },
};

const ProtectedRoute = ({ allowedRoles, routeType }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [permissions, setPermissions] = useState(null);

  // Normalize the current path
  const urlType = location.pathname.split("/")[1];
  const currentPath =
    urlType === "admin"
      ? location.pathname
          .replace(config.VITE_BASE_ADMIN_URL, "")
          .replace(/^\/+/, "")
      : location.pathname
          .replace(config.VITE_BASE_VENDOR_URL, "")
          .replace(/^\/+/, "");

  const getTokenKey = (role) =>
    `${config.BRAND_NAME}${role.charAt(0).toUpperCase() + role.slice(1)}Token`;

  // Check for any valid role-specific token
  const validToken = allowedRoles
    .map((role) => Cookies.get(getTokenKey(role)))
    .find((token) => token);

  useEffect(() => {
    if (!validToken) {
      if (routeType === "website") {
        navigate(`${config.VITE_BASE_WEBSITE_URL}/`);
      } else if (routeType === "vendor") {
        navigate(`${config.VITE_BASE_WEBSITE_URL}/signin-vendor`);
      } else {
        navigate(`${config.VITE_BASE_WEBSITE_URL}/signin-admin`);
      }
      return;
    }

    try {
      // Find the matching role and token
      let decoded = null;
      let userRole = null;
      for (const role of allowedRoles) {
        const token = Cookies.get(getTokenKey(role));
        if (token) {
          decoded = jwtDecode(token);
          userRole = decoded.role;
          break;
        }
      }

      if (!decoded || !allowedRoles.includes(userRole)) {
        // Redirect based on the user's role
        if (userRole === "customer") {
          navigate(`${config.VITE_BASE_WEBSITE_URL}/`);
        } else if (userRole === "vendor") {
          navigate(`${config.VITE_BASE_VENDOR_URL}/dashboard`);
        } else if (userRole === "admin" || userRole === "superadmin") {
          navigate(`${config.VITE_BASE_ADMIN_URL}/dashboard`);
        } else {
          navigate(`${config.VITE_BASE_WEBSITE_URL}/`);
        }
        return;
      }

      // Skip permission check for dashboard and profile routes for all admins
      if (userRole === "admin" || userRole === "superadmin") {
        if (currentPath === "dashboard" || currentPath === "profile") {
          return;
        }
      }

      // Fetch permissions for admin users (excluding superadmin)
      if (
        userRole === "admin" &&
        currentPath !== "dashboard" &&
        currentPath !== "profile"
      ) {
        const fetchPermissions = async () => {
          try {
            const response = await getAdminPermissions(decoded.id);
            if (response.status === 1) {
              setPermissions(response.data);
            } else {
              navigate(`${config.VITE_BASE_ADMIN_URL}/access_notice`);
            }
          } catch (error) {
            console.error("Error fetching permissions:", error);
            navigate(`${config.VITE_BASE_ADMIN_URL}/access_notice`);
          }
        };
        fetchPermissions();
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      navigate(
        routeType === "admin"
          ? `${config.VITE_BASE_WEBSITE_URL}/signin-admin`
          : routeType === "vendor"
          ? `${config.VITE_BASE_WEBSITE_URL}/signin-vendor`
          : `${config.VITE_BASE_WEBSITE_URL}/`
      );
    }
  }, [navigate, allowedRoles, routeType, currentPath, validToken]);

  if (!validToken) {
    return routeType === "website" ? (
      <Navigate to={`${config.VITE_BASE_WEBSITE_URL}/`} />
    ) : routeType === "vendor" ? (
      <Navigate to={`${config.VITE_BASE_WEBSITE_URL}/signin-vendor`} />
    ) : (
      <Navigate to={`${config.VITE_BASE_WEBSITE_URL}/signin-admin`} />
    );
  }

  try {
    let decoded = null;
    let userRole = null;
    for (const role of allowedRoles) {
      const token = Cookies.get(getTokenKey(role));
      if (token) {
        decoded = jwtDecode(token);
        userRole = decoded.role;
        break;
      }
    }

    if (!decoded || !allowedRoles.includes(userRole)) {
      return userRole === "customer" ? (
        <Navigate to={`${config.VITE_BASE_WEBSITE_URL}/`} />
      ) : userRole === "vendor" ? (
        <Navigate to={`${config.VITE_BASE_VENDOR_URL}/dashboard`} />
      ) : userRole === "admin" || userRole === "superadmin" ? (
        <Navigate to={`${config.VITE_BASE_ADMIN_URL}/dashboard`} />
      ) : (
        <Navigate to={`${config.VITE_BASE_WEBSITE_URL}/`} />
      );
    }

    // Allow superadmin full access and admin access to dashboard and profile
    if (
      (routeType === "admin" && userRole === "superadmin") ||
      (routeType === "admin" &&
        userRole === "admin" &&
        (currentPath === "dashboard" || currentPath === "profile"))
    ) {
      return <Outlet />;
    }

    // Skip for vendor users
    if (userRole === "vendor" && routeType === "vendor") {
      return <Outlet />;
    }

    // Skip for website's protected route
    if (routeType === "website" && userRole === "customer") {
      return <Outlet />;
    }

    // Check permissions for admin users for non-dashboard and non-profile routes
    if (
      userRole === "admin" &&
      permissions &&
      currentPath !== "dashboard" &&
      currentPath !== "profile" &&
      routeType === "admin"
    ) {
      const requiredPermission = routePermissions[currentPath];

      if (!requiredPermission) {
        return <Navigate to={`${config.VITE_BASE_ADMIN_URL}/access_notice`} />;
      }

      const hasPermission = Object.keys(requiredPermission).some((permType) => {
        const currentPathArray = currentPath.split("/").filter(Boolean);
        return (
          requiredPermission[permType] &&
          permissions[currentPathArray[0].replace(/\/:.*$/, "")]?.[permType]
        );
      });

      if (hasPermission) {
        return <Outlet />;
      } else {
        return <Navigate to={`${config.VITE_BASE_ADMIN_URL}/access_notice`} />;
      }
    }

    return null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return <Navigate to={`${config.VITE_BASE_WEBSITE_URL}/signin`} />;
  }
};

const ProjectRoutes = () => {
  return useRoutes([
    {
      path: `${config.VITE_BASE_WEBSITE_URL}`,
      children: [
        { index: true, element: <Home /> },
        { path: `about`, element: <AboutUs /> },
        { path: `contact-us`, element: <ContactUs /> },
        { path: `faq`, element: <FAQsPage /> },
        { path: `become-seller`, element: <BecomeSeller /> },
        { path: `collection/:type/:slug`, element: <CollectionsPage /> },
        { path: `collection/:type`, element: <CollectionsPage /> },
        { path: `product/:slug`, element: <ProductPage /> },
        { path: `blogs`, element: <BlogPage /> },
        { path: `blogs/:slug`, element: <BlogPost /> },
        { path: `signin-vendor`, element: <SignIn role="vendor" /> },
        { path: `signin-admin`, element: <SignIn role="admin" /> },
        { path: `access_notice`, element: <AccessNotice /> },
        { path: `page/:slug`, element: <PageView /> },
        { path: `account-deletion`, element: <AccountDeletionInstructions /> },
        { path: `track/order/:orderToken`, element: <TrackResult /> },
        { path: `theme/:slug`, element: <ProductThemePage /> },

        // Customer Protected Routes
        {
          element: (
            <ProtectedRoute allowedRoles={["customer"]} routeType="website" />
          ),
          children: [
            { path: `orders`, element: <MyOrders /> },
            { path: `addresses`, element: <MyAddressPage /> },
            { path: `wishlist`, element: <Wishlist /> },
            { path: `profile`, element: <ProfilePage /> },
            { path: `cart`, element: <CartPage /> },
            { path: `checkout`, element: <CheckoutPage /> },
            { path: `billing`, element: <Billing /> },
            { path: `support`, element: <Support /> },
            { path: `wallet`, element: <Wallet /> },
            { path: `invoice`, element: <Billing /> },
            {
              path: `success-order/:order_number`,
              element: <OrderSuccessful />,
            },
            { path: `shared-order/:orderId`, element: <SharedOrderPage /> },
            { path: `track-order`, element: <OrderTrack /> },
            { path: `notifications`, element: <Notification /> },
            { path: `settings`, element: <Settings /> },
            { path: `referral`, element: <ReferralPage /> },
            { path: `logout`, element: <Logout /> },
          ],
        },

        // Vendor Routes
        {
          path: `${config.VITE_BASE_VENDOR_URL}`,
          element: (
            <ProtectedRoute allowedRoles={["vendor"]} routeType="vendor" />
          ),
          children: [
            { index: true, element: <Dashboard /> },
            { path: `dashboard`, element: <Dashboard /> },
            { path: `product`, element: <Product /> },
            {
              path: `product/addProduct/:vendorId`,
              element: <AddEditProduct />,
            },
            { path: `product/edit/:id`, element: <AddEditProduct /> },
            { path: `bulk-upload`, element: <ProductFilesManager /> },
            { path: `settings`, element: <Setting /> },
            { path: `orders`, element: <Order /> },
            { path: `invoice`, element: <Invoice /> },
            { path: `coupons`, element: <Coupons /> },
            { path: `report`, element: <Report /> },
            { path: `chat`, element: <ChatLayout /> },
            { path: `influencer`, element: <ManageInfluencer /> },
            { path: `profile`, element: <Profile /> },
            { path: `trackorders`, element: <TrackCustomerOrders /> },
            { path: `influencer/campaign/create`, element: <CreateCampaign /> },
            { path: `subcription`, element: <Subcriptions /> },
            { path: `review`, element: <Review /> },
            { path: `support`, element: <SupportPage /> },
            { path: `training`, element: <TutorialPage /> },
            { path: `notifications`, element: <VendorNotification /> },
            { path: `logout`, element: <VendorLogoutPage /> },
            { path: `ads/history`, element: <VendorAdlist /> },
            { path: `ads/add`, element: <CreateAdPage /> },
          ],
        },

        // Admin Routes
        {
          path: `${config.VITE_BASE_ADMIN_URL}`,
          element: (
            <ProtectedRoute
              allowedRoles={["admin", "superadmin"]}
              routeType="admin"
            />
          ),
          children: [
            {
              index: true,
              element: <AdminDashboard />,
              permissionPath: "dashboard",
            },
            {
              path: `dashboard`,
              element: <AdminDashboard />,
              permissionPath: "dashboard",
            },
            {
              path: `product/list`,
              element: <ProductList />,
              permissionPath: "product/list",
            },
            {
              path: `product/add`,
              element: <AddEditProductAdmin />,
              permissionPath: "product/add",
            },
            {
              path: `product/edit/:id`,
              element: <AddEditProductAdmin />,
              permissionPath: "product/edit/:id",
            },
            {
              path: `product/bulk`,
              element: <ProductFilesManager />,
              permissionPath: "product/bulk",
            },
            {
              path: `blogs/add`,
              element: <BlogForm />,
              permissionPath: "blogs/add",
            },
            {
              path: `blogs/list`,
              element: <BlogList />,
              permissionPath: "blogs/list",
            },
            {
              path: `blogs/edit/:blogId`,
              element: <BlogForm />,
              permissionPath: "blogs/edit/:blogId",
            },
            {
              path: `banners/add`,
              element: <AddBanner />,
              permissionPath: "banners/add",
            },
            {
              path: `banners/list`,
              element: <BannerList />,
              permissionPath: "banners/list",
            },
            {
              path: `banners/edit/:id`,
              element: <AddBanner />,
              permissionPath: "banners/edit/:id",
            },
            {
              path: `sliders/add`,
              element: <AddSlider />,
              permissionPath: "sliders/add",
            },
            {
              path: `sliders/list`,
              element: <SliderList />,
              permissionPath: "sliders/list",
            },
            {
              path: `labels/add`,
              element: <AddLabel />,
              permissionPath: "labels/add",
            },
            {
              path: `labels/list`,
              element: <LabelList />,
              permissionPath: "labels/list",
            },
            {
              path: `categories/add`,
              element: <AddCategory />,
              permissionPath: "categories/add",
            },
            {
              path: `categories/list`,
              element: <CategoryList />,
              permissionPath: "categories/list",
            },
            {
              path: `subcategories/add`,
              element: <AddSubCategory />,
              permissionPath: "subcategories/add",
            },
            {
              path: `subcategories/list`,
              element: <SubCategoryList />,
              permissionPath: "subcategories/list",
            },
            {
              path: `innersubcategories/add`,
              element: <AddInnerSubCategory />,
              permissionPath: "innersubcategories/add",
            },
            {
              path: `innersubcategories/list`,
              element: <InnersubCategory />,
              permissionPath: "innersubcategories/list",
            },
            {
              path: `coupons/add`,
              element: <AddCoupon />,
              permissionPath: "coupons/add",
            },
            {
              path: `coupons/list`,
              element: <CouponList />,
              permissionPath: "coupons/list",
            },
            {
              path: `fabrics/add`,
              element: <AddFabric />,
              permissionPath: "fabrics/add",
            },
            {
              path: `fabrics/list`,
              element: <FabricList />,
              permissionPath: "fabrics/list",
            },
            {
              path: `vendors`,
              element: <VendorManagement />,
              permissionPath: "vendors",
            },
            {
              path: `vendors/add`,
              element: <AdminVendorForm />,
              permissionPath: "vendors/add",
            },
            {
              path: `vendors/edit/:id`,
              element: <AdminVendorForm />,
              permissionPath: "vendors/add",
            },
            {
              path: `customers`,
              element: <CustomerManagement />,
              permissionPath: "customers",
            },
            {
              path: `support/customer`,
              element: <CustomerSupport />,
              permissionPath: "support/customer",
            },
            {
              path: `support/vendor`,
              element: <VendorSupport />,
              permissionPath: "support/vendor",
            },
            {
              path: `billsandinvoices`,
              element: <BillsInvoice />,
              permissionPath: "billsandinvoices",
            },
            {
              path: `cmspages`,
              element: <CMS />,
              permissionPath: "cmspages",
            },
            {
              path: `vendorperformance`,
              element: <VendorPerformance />,
              permissionPath: "vendorperformance",
            },
            {
              path: `vendortransaction`,
              element: <VendorTransaction />,
              permissionPath: "vendortransaction",
            },
            {
              path: `charges`,
              element: <Charges />,
              permissionPath: "charges",
            },
            {
              path: `websettings`,
              element: <WebsiteSettings />,
              permissionPath: "websettings",
            },
            {
              path: `attributes`,
              element: <Attributs />,
              permissionPath: "attributes",
            },
            {
              path: `team/list`,
              element: <TeamList />,
              permissionPath: "team/list",
            },
            {
              path: `team/add`,
              element: <CreateTeamSubUsers />,
              permissionPath: "team/add",
            },
            {
              path: `team/:id`,
              element: <CreateTeamSubUsers />,
              permissionPath: "team/:id",
            },
            {
              path: `shipment`,
              element: <OrderShipment />,
              permissionPath: "shipment",
            },
            {
              path: `shippingpartner`,
              element: <ShippingPartner />,
              permissionPath: "shippingpartner",
            },
            {
              path: `ads/list`,
              element: <AdsList />,
              permissionPath: "ads/list",
            },
            {
              path: `settings`,
              element: <AdminSetting />,
              permissionPath: "settings",
            },
            {
              path: `profile`,
              element: <AdminProfile />,
              permissionPath: "profile",
            },
            {
              path: `notifications`,
              element: <AdminNotification />,
              permissionPath: "notifications",
            },
            {
              path: `orders`,
              element: <AdminOrders />,
              permissionPath: "orders",
            },
            {
              path: `finance`,
              element: <Finance />,
              permissionPath: "finance",
            },
            {
              path: `review`,
              element: <ReviewAdminPage />,
              permissionPath: "review",
            },
            {
              path: `report`,
              element: <ReportAdminPage />,
              permissionPath: "report",
            },
            {
              path: `faqs`,
              element: <FAQsList />,
              permissionPath: "faqs",
            },
            {
              path: `contactus`,
              element: <ContactUsList />,
              permissionPath: "contactus",
            },
            {
              path: `managehomepage`,
              element: <HomepageManager />,
              permissionPath: "managehomepage",
            },
            {
              path: `managehomepage/addsection`,
              element: <SectionManagement />,
              permissionPath: "managehomepage/addsection",
            },
            {
              path: `managehomepage/editsection/:id`,
              element: <SectionManagement />,
              permissionPath: "managehomepage/editsection/:id",
            },
            {
              path: `emailsubscribers`,
              element: <EmailSubscribers />,
              permissionPath: "emailsubscribers",
            },
            {
              path: `size-color`,
              element: <SizeColorManagement />,
              permissionPath: "size-color",
            },
            {
              path: `offers/add`,
              element: <AddOfferForm />,
              permissionPath: "offers/add",
            },
            {
              path: `offers/list`,
              element: <OfferBannerList />,
              permissionPath: "offers/list",
            },
            {
              path: `offers/edit/:id`,
              element: <AddOfferForm />,
              permissionPath: "offers/edit/:id",
            },
            {
              path: `referral-settings`,
              element: <ReferralSettings />,
              permissionPath: "referral-settings",
            },
            {
              path: `managethemes`,
              element: <ProductThemeManager />,
              permissionPath: "managethemes",
            },
            {
              path: `managethemes/add`,
              element: <ProductThemeEditor />,
              permissionPath: "managethemes/add",
            },
            {
              path: `managethemes/edit/:id`,
              element: <ProductThemeEditor />,
              permissionPath: "managethemes/edit/:id",
            },
            {
              path: `managethemes/managesections/:themeId`,
              element: <ThemeSectionManager />,
              permissionPath: "managethemes/managesections/:themeId",
            },
            {
              path: `managethemes/addsection/:themeId`,
              element: <ThemeSectionEditor />,
              permissionPath: "managethemes/addsection/:themeId",
            },
            {
              path: `managethemes/editsection/:themeId/:sectionId`,
              element: <ThemeSectionEditor />,
              permissionPath: "managethemes/editsection/:themeId/:sectionId",
            },
          ],
        },
      ],
    },
    { path: "*", element: <NotFoundPage /> },
  ]);
};

export default ProjectRoutes;
