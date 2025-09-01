import React, { useState, useEffect } from "react";
import { BiFile } from "react-icons/bi";
import { updateSettings } from "../../../services/api.settings";
// import { notifyOnSuccess, notifyOnFail } from "../utils/notification/toast";
import { useForm } from "react-hook-form";

const WebsiteSettings = () => {
  const { setValue } = useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState([]);
  const [logoPreview, setLogoPreview] = useState([]);
  const [formData, setFormData] = useState({
    site_title: "",
    logo: "",
    favicon: "",
    seo_heading: "",
    meta_title: "",
    meta_description: "",
  });

  const fetchSettingData = async () => {
    try {
      const response = await updateSettings(); // Fetch data from backend
      setFormData(response.data); // Populate form fields

      // Set previews from URLs
      if (response.data.logo) {
        setLogoPreview(response.data.logo); // Set the logo preview
        setValue("logo", response.data.logo);
      }
      if (response.data.favicon) {
        setFaviconPreview(response.data.favicon); // Set the favicon preview
        setValue("favicon", response.data.favicon);
      }
    } catch (error) {
      console.log("Error fetching settings", error);
    }
  };

  useEffect(() => {
    fetchSettingData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const type = e.target.name;

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "logo") {
          setLogoPreview(reader.result); // Set preview for logo
          setLogoFile(file);
        } else if (type === "favicon") {
          setFaviconPreview(reader.result); // Set preview for favicon
          setFaviconFile(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSave = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("site_title", formData.site_title);
      formDataToSend.append("seo_heading", formData.seo_heading);
      formDataToSend.append("meta_title", formData.meta_title);
      formDataToSend.append("meta_description", formData.meta_description);

      if (logoFile) {
        formDataToSend.append("logo", logoFile);
      } else {
        formDataToSend.append("logo", formData.logo || "");
      }

      if (faviconFile) {
        formDataToSend.append("favicon", faviconFile);
      } else {
        formDataToSend.append("favicon", formData.favicon || "");
      }

      const response = await updateSettings(formDataToSend);

      if (response?.data) {
        // Update local previews based on backend response
        setLogoPreview(response.data.logo || null);
        setFaviconPreview(response.data.favicon || null);
        setFormData(response.data);
      }

      setIsEditing(false);
    } catch (error) {
      console.log("Error updating settings", error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    fetchSettingData();
    setIsEditing(false);
  };
  const handleRemoveImage = async (type) => {
    try {
      if (type === "logo") {
        setLogoPreview(null); // Clear preview
        setLogoFile(null); // Clear file input
        setFormData((prev) => ({ ...prev, logo: "" })); // Clear form data for logo
        await updateSettings({ logo: "" }); // Send updated data to backend
      } else if (type === "favicon") {
        setFaviconPreview(null); // Clear preview
        setFaviconFile(null); // Clear file input
        setFormData((prev) => ({ ...prev, favicon: "" })); // Clear form data for favicon
        await updateSettings({ favicon: "" }); // Send updated data to backend
      }
    } catch (error) {
      console.error("Error removing image:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 ">
      <div className="container mx-auto p-2 md:p-3">
        <h2 className="text-2xl text-[#333843] font-semibold mb-6">
          Website Settings
        </h2>

        <div className="mb-6 bg-white shadow rounded-lg w-full max-w-lg md:max-w-4xl  p-6">
          <div className="mb-6">
            <h3 className="text-lg text-[#405161] font-semibold mb-4">
              Basics
            </h3>
            <div className="flex flex-col  md:ml-20 sm:flex-row sm:items-center sm:space-x-4">
              <label
                htmlFor="siteName"
                className="text-sm text-[#171A1F] font-medium md:mr-2"
              >
                Site Name
              </label>
              <input
                type="text"
                id="site_title"
                name="site_title"
                value={formData.site_title}
                onChange={handleInputChange}
                className="border-[#C4CED8] rounded-md p-2 focus:ring-orange-500 focus:border-orange-500 w-full sm:w-auto"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg text-[#405161] font-semibold mb-4">
              Branding
            </h3>
            <div className="mb-6">
              <div className="flex flex-col md:ml-20 sm:flex-row sm:items-center sm:space-x-4">
                <label
                  htmlFor="logo"
                  className="text-sm font-medium text-[#171A1F] md:mr-12"
                >
                  Logo
                </label>
                <input
                  type="file"
                  id="logo"
                  name="logo"
                  onChange={handleFileChange}
                  className="text-sm text-[#171A1F] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 w-full sm:w-auto"
                />
              </div>
              {logoPreview && (
                <div className="flex items-center space-x-2">
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="h-16 w-16 object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage("logo")}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              )}
              <p className="text-sm text-gray-500 mt-2 md:ml-44">
                Will be re-sized to 75px height. JPG, GIF, and PNG are accepted.
              </p>
            </div>
            <div className="mb-6">
              <div className="flex flex-col md:ml-20 sm:flex-row sm:items-center sm:space-x-4">
                <label
                  htmlFor="favicon"
                  className="block text-sm font-medium text-[#171A1F] md:mr-8"
                >
                  Favicon
                </label>
                <input
                  type="file"
                  id="favicon"
                  name="favicon"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-[#171A1F] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
                />
              </div>
              {faviconPreview && (
                <div className="flex items-center space-x-2">
                  <img
                    src={faviconPreview}
                    alt="Favicon Preview"
                    className="h-16 w-16 object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage("favicon")}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              )}
              <p className="text-sm text-gray-500 mt-2 md:ml-44">
                This icon is used in the browser to identify your website. 32×32
                ICO and PNG file types are accepted.
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex flex-col  md:ml-20 sm:flex-row sm:items-center sm:space-x-4">
              <label className="text-sm text-[#171A1F] font-medium">
                SEO Heading
              </label>
              <input
                type="text"
                id="seo_heading"
                name="seo_heading"
                value={formData.seo_heading}
                onChange={handleInputChange}
                className="border-[#C4CED8] rounded-md p-2 focus:ring-orange-500 focus:border-orange-500 w-full sm:w-auto"
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex flex-col md:ml-20 sm:flex-row sm:items-center sm:space-x-4">
              <label className="text-sm text-[#171A1F] font-medium md:mr-6">
                Meta Title
              </label>
              <input
                type="text"
                id="meta_title"
                name="meta_title"
                value={formData.meta_title}
                onChange={handleInputChange}
                className="border-[#C4CED8] rounded-md focus:ring-orange-500 focus:border-orange-500 w-full sm:w-auto"
              />
            </div>
          </div>

          <div className="mb-6 md:ml-20">
            <label className="text-sm text-[#171A1F] font-medium ">
              Meta Description
            </label>
            <textarea
              id="meta_description"
              name="meta_description"
              value={formData.meta_description}
              onChange={handleInputChange}
              className="border-[#C4CED8] rounded-md p-2 focus:ring-orange-500 focus:border-orange-500 w-full"
              rows="4"
            />
          </div>
        </div>

        {!isEditing && (
          <div className="flex justify-end mb-4">
            <button
              onClick={handleEdit}
              className="bg-[#F47954] border rounded-lg text-sm text-white px-10 py-2 font-medium"
            >
              Edit
            </button>
          </div>
        )}
        {isEditing && (
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="text-[#F47954] border rounded-lg text-sm  focus:bg-[#F47954] focus:text-white px-10
            py-2 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-[#F47954] border rounded-lg text-sm text-white px-10 py-2 font-medium"
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebsiteSettings;
