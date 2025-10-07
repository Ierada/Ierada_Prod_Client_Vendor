import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { getSettings, updateSettings } from "../../../services/api.settings";
import { useAppContext } from "../../../context/AppContext";
import {
  notifyOnSuccess,
  notifyOnFail,
} from "../../../utils/notification/toast";

const AdminSetting = () => {
  const { user } = useAppContext();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      show_all_products_section: false,
      header_text: "",
      link_text: "",
      link_url: "",
    },
  });

  // Settings form states
  const [settings, setSettings] = useState(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSubmittingSettings, setIsSubmittingSettings] = useState(false);

  // Image state management
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);
  const [ogImagePreview, setOgImagePreview] = useState(null);
  const [customerLoginBannerPreview, setCustomerLoginBannerPreview] =
    useState(null);
  const [vendorLoginBannerPreview, setVendorLoginBannerPreview] =
    useState(null);
  const [becomeSellerBannerPreview, setBecomeSellerBannerPreview] =
    useState(null);
  const [aboutUsBannerPreview, setAboutUsBannerPreview] = useState(null);

  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [ogImageFile, setOgImageFile] = useState(null);
  const [customerLoginBannerFile, setCustomerLoginBannerFile] = useState(null);
  const [vendorLoginBannerFile, setVendorLoginBannerFile] = useState(null);
  const [becomeSellerBannerFile, setBecomeSellerBannerFile] = useState(null);
  const [aboutUsBannerFile, setAboutUsBannerFile] = useState(null);

  const fetchSettings = async () => {
    try {
      const response = await getSettings();
      setSettings(response.data);

      // Set form values
      Object.keys(response.data).forEach((key) => {
        if (key !== "header_floating_offer") {
          setValue(key, response.data[key]);
        }
      });

      // Set header floating offer values
      if (response.data.header_floating_offer) {
        const headerFloatingOffer = response.data.header_floating_offer
          ? typeof response.data.header_floating_offer === "string"
            ? JSON.parse(response.data.header_floating_offer)
            : response.data.header_floating_offer
          : null;
        setValue("header_text", headerFloatingOffer.header_text || "");
        setValue("link_text", headerFloatingOffer.link_text || "");
        setValue("link_url", headerFloatingOffer.link_url || "");
      }

      // Set image previews
      if (response.data.logo) setLogoPreview(response.data.logo);
      if (response.data.favicon) setFaviconPreview(response.data.favicon);
      if (response.data.og_image) setOgImagePreview(response.data.og_image);
      if (response.data.customer_login_banner)
        setCustomerLoginBannerPreview(response.data.customer_login_banner);
      if (response.data.vendor_login_banner)
        setVendorLoginBannerPreview(response.data.vendor_login_banner);
      if (response.data.become_seller_banner)
        setBecomeSellerBannerPreview(response.data.become_seller_banner);
      if (response.data.about_us_banner)
        setAboutUsBannerPreview(response.data.about_us_banner);
    } catch (error) {
      notifyOnFail("Error fetching settings");
    } finally {
      setIsLoadingSettings(false);
    }
  };

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, [setValue]);

  // Image change handlers
  const handleImageChange = (type, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        switch (type) {
          case "logo":
            setLogoPreview(reader.result);
            setLogoFile(file);
            break;
          case "favicon":
            setFaviconPreview(reader.result);
            setFaviconFile(file);
            break;
          case "og_image":
            setOgImagePreview(reader.result);
            setOgImageFile(file);
            break;
          case "customer_login_banner":
            setCustomerLoginBannerPreview(reader.result);
            setCustomerLoginBannerFile(file);
            break;
          case "vendor_login_banner":
            setVendorLoginBannerPreview(reader.result);
            setVendorLoginBannerFile(file);
            break;
          case "become_seller_banner":
            setBecomeSellerBannerPreview(reader.result);
            setBecomeSellerBannerFile(file);
            break;
          case "about_us_banner":
            setAboutUsBannerPreview(reader.result);
            setAboutUsBannerFile(file);
            break;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image handler
  const handleRemoveImage = (type) => {
    switch (type) {
      case "logo":
        setLogoPreview(null);
        setLogoFile(null);
        setValue("logo", "");
        break;
      case "favicon":
        setFaviconPreview(null);
        setFaviconFile(null);
        setValue("favicon", "");
        break;
      case "og_image":
        setOgImagePreview(null);
        setOgImageFile(null);
        setValue("og_image", "");
        break;
      case "customer_login_banner":
        setCustomerLoginBannerPreview(null);
        setCustomerLoginBannerFile(null);
        setValue("customer_login_banner", "");
        break;
      case "vendor_login_banner":
        setVendorLoginBannerPreview(null);
        setVendorLoginBannerFile(null);
        setValue("vendor_login_banner", "");
        break;
      case "become_seller_banner":
        setBecomeSellerBannerPreview(null);
        setBecomeSellerBannerFile(null);
        setValue("become_seller_banner", "");
        break;
      case "about_us_banner":
        setAboutUsBannerPreview(null);
        setAboutUsBannerFile(null);
        setValue("about_us_banner", "");
        break;
    }
  };

  // Settings submit handler
  const onSettingsSubmit = async (data) => {
    setIsSubmittingSettings(true);

    try {
      const formData = new FormData();

      // Handle header floating offer as JSON
      const headerFloatingOffer = {
        header_text: data.header_text || "",
        link_text: data.link_text || "",
        link_url: data.link_url || "",
      };
      formData.append(
        "header_floating_offer",
        JSON.stringify(headerFloatingOffer)
      );

      // Append other form data, skipping header fields, ensuring boolean is converted to string
      Object.keys(data).forEach((key) => {
        if (
          !["header_text", "link_text", "link_url"].includes(key) &&
          data[key] !== undefined &&
          data[key] !== null
        ) {
          formData.append(key, data[key].toString());
        }
      });

      // Append files if they exist
      if (logoFile) formData.append("logo", logoFile);
      if (faviconFile) formData.append("favicon", faviconFile);
      if (ogImageFile) formData.append("og_image", ogImageFile);
      if (customerLoginBannerFile)
        formData.append("customer_login_banner", customerLoginBannerFile);
      if (vendorLoginBannerFile)
        formData.append("vendor_login_banner", vendorLoginBannerFile);
      if (becomeSellerBannerFile)
        formData.append("become_seller_banner", becomeSellerBannerFile);
      if (aboutUsBannerFile)
        formData.append("about_us_banner", aboutUsBannerFile);

      const response = await updateSettings(formData);
      if (response.status === 1) {
        fetchSettings();
      }
    } catch (error) {
      notifyOnFail("Error updating settings");
    } finally {
      setIsSubmittingSettings(false);
    }
  };

  if (isLoadingSettings) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F47954]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mb-4 text-black">
      <h1 className="text-3xl font-semibold mb-6">Website Settings</h1>

      <div className="grid grid-cols-1 gap-8">
        <div className="col-span-1">
          <div className="bg-white p-6 rounded-md shadow-md transition-all duration-300 hover:shadow-lg">
            <form
              onSubmit={handleSubmit(onSettingsSubmit)}
              className="space-y-6"
            >
              {/* Site Information Section */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site Title
                  </label>
                  <input
                    type="text"
                    {...register("site_title")}
                    className="block w-full rounded-md border border-gray-300 p-3 bg-gray-50 focus:ring-2 focus:ring-[#F47954] focus:border-transparent transition-all duration-200"
                    placeholder="Enter site title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    {...register("meta_title")}
                    className="block w-full rounded-md border border-gray-300 p-3 bg-gray-50 focus:ring-2 focus:ring-[#F47954] focus:border-transparent transition-all duration-200"
                    placeholder="Enter meta title"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  {...register("meta_description")}
                  rows={3}
                  className="block w-full rounded-md border border-gray-300 p-3 bg-gray-50 focus:ring-2 focus:ring-[#F47954] focus:border-transparent transition-all duration-200"
                  placeholder="Enter meta description"
                />
              </div>

              {/* Banner Upload Sections */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Customer Login Banner */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Login Banner
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Recommended resolution: 1200x800 pixels (3:2 aspect ratio).
                    Used in the sign-in modal.
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageChange("customer_login_banner", e)
                    }
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#F47954] file:text-white hover:file:bg-[#e66c46]"
                  />
                  {customerLoginBannerPreview && (
                    <div className="mt-4">
                      <img
                        src={customerLoginBannerPreview}
                        alt="Customer Login Banner Preview"
                        className="max-w-[200px] h-auto rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveImage("customer_login_banner")
                        }
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                      >
                        Remove Banner
                      </button>
                    </div>
                  )}
                </div>

                {/* Vendor Login Banner */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor Login Banner
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Recommended resolution: 1200x800 pixels (3:2 aspect ratio).
                    Used in the vendor sign-in page.
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageChange("vendor_login_banner", e)
                    }
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#F47954] file:text-white hover:file:bg-[#e66c46]"
                  />
                  {vendorLoginBannerPreview && (
                    <div className="mt-4">
                      <img
                        src={vendorLoginBannerPreview}
                        alt="Vendor Login Banner Preview"
                        className="max-w-[200px] h-auto rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage("vendor_login_banner")}
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                      >
                        Remove Banner
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Become Seller Banner */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Become Seller Banner
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Recommended resolution: 1920x700 pixels (responsive heights:
                    200px mobile, 300px small, 500px medium, 700px large). Used
                    as the header banner on the Become Seller page.
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageChange("become_seller_banner", e)
                    }
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#F47954] file:text-white hover:file:bg-[#e66c46]"
                  />
                  {becomeSellerBannerPreview && (
                    <div className="mt-4">
                      <img
                        src={becomeSellerBannerPreview}
                        alt="Become Seller Banner Preview"
                        className="max-w-[200px] h-auto rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveImage("become_seller_banner")
                        }
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                      >
                        Remove Banner
                      </button>
                    </div>
                  )}
                </div>

                {/* About Us Banner */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    About Us Banner
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Recommended resolution: 1920x700 pixels (responsive heights:
                    200px mobile, 300px small, 500px medium, 700px large). Used
                    as the header banner on the About Us page.
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange("about_us_banner", e)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#F47954] file:text-white hover:file:bg-[#e66c46]"
                  />
                  {aboutUsBannerPreview && (
                    <div className="mt-4">
                      <img
                        src={aboutUsBannerPreview}
                        alt="About Us Banner Preview"
                        className="max-w-[200px] h-auto rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage("about_us_banner")}
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                      >
                        Remove Banner
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Header Floating Offer Section */}
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">
                  Header Floating Offer
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Header Text
                    </label>
                    <input
                      type="text"
                      {...register("header_text")}
                      className="block w-full rounded-md border border-gray-300 p-3 bg-gray-50 focus:ring-2 focus:ring-[#F47954] focus:border-transparent transition-all duration-200"
                      placeholder="Enter header text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Link Text
                    </label>
                    <input
                      type="text"
                      {...register("link_text")}
                      className="block w-full rounded-md border border-gray-300 p-3 bg-gray-50 focus:ring-2 focus:ring-[#F47954] focus:border-transparent transition-all duration-200"
                      placeholder="Enter link text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Link URL
                    </label>
                    <input
                      type="url"
                      {...register("link_url")}
                      className="block w-full rounded-md border border-gray-300 p-3 bg-gray-50 focus:ring-2 focus:ring-[#F47954] focus:border-transparent transition-all duration-200"
                      placeholder="Enter link URL"
                    />
                  </div>
                </div>
              </div>

              {/* Show All Products Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Show All Products Section in Homepage
                </label>
                <div className="flex items-center space-x-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("show_all_products_section")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#F47954] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F47954]"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      {settings?.show_all_products_section
                        ? "Enabled"
                        : "Disabled"}
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shipping Charge
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("shipping_charge")}
                    className="block w-full rounded-md border border-gray-300 p-3 bg-gray-50 focus:ring-2 focus:ring-[#F47954] focus:border-transparent transition-all duration-200"
                    placeholder="Enter shipping charge"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform Fee (in %)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    minLength={0}
                    maxLength={100}
                    {...register("platform_fee")}
                    className="block w-full rounded-md border border-gray-300 p-3 bg-gray-50 focus:ring-2 focus:ring-[#F47954] focus:border-transparent transition-all duration-200"
                    placeholder="Enter platform fee in %"
                  />
                </div>
              </div>

              {/* Referral Settings */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referrer Coin Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("referrer_coin_amount")}
                    className="block w-full rounded-md border border-gray-300 p-3 bg-gray-50 focus:ring-2 focus:ring-[#F47954] focus:border-transparent transition-all duration-200"
                    placeholder="Enter referrer coin amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referred Coin Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("referred_coin_amount")}
                    className="block w-full rounded-md border border-gray-300 p-3 bg-gray-50 focus:ring-2 focus:ring-[#F47954] focus:border-transparent transition-all duration-200"
                    placeholder="Enter referred coin amount"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={isSubmittingSettings}
                  className={`${
                    isSubmittingSettings
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#F47954] hover:bg-[#e66c46]"
                  } text-white py-3 px-6 rounded-md font-medium transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center min-w-[200px]`}
                >
                  {isSubmittingSettings ? "Updating..." : "Update Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSetting;
