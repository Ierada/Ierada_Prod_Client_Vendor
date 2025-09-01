import React, { useState, useEffect } from "react";
import { FaToggleOff, FaToggleOn } from "react-icons/fa";
import { PiToggleLeftFill } from "react-icons/pi";
import {
  addSubAdmin,
  getSubAdminById,
  updateSubAdmin,
} from "../../../services/api.admin";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import config from "../../../config/config";

const CreateTeamSubUsers = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(!!id);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    is_active: true,
    escalation_level: 0, // Default to No Escalation (0)
  });
  const [permissions, setPermissions] = useState({
    product: { add: false, view: false, edit: false, bulk: false },
    blogs: { add: false, view: false, edit: false },
    banners: { add: false, view: false, edit: false },
    sliders: { add: false, view: false },
    labels: { add: false, view: false },
    categories: { add: false, view: false },
    subcategories: { add: false, view: false },
    innersubcategories: { add: false, view: false },
    coupons: { add: false, view: false },
    fabrics: { add: false, view: false },
    vendors: { view: false },
    customers: { view: false },
    customer_support: { view: false },
    vendor_support: { view: false },
    billsandinvoices: { view: false },
    cmspages: { view: false },
    vendorperformance: { view: false },
    vendortransaction: { view: false },
    charges: { view: false },
    websettings: { view: false },
    attributes: { view: false },
    team: { add: false, view: false, edit: false },
    shipment: { view: false },
    shippingpartner: { view: false },
    ads: { view: false },
    settings: { view: false },
    notifications: { view: false },
    orders: { view: false },
    finance: { view: false },
    review: { view: false },
    report: { view: false },
    faqs: { view: false },
    contactus: { view: false },
    managehomepage: { add: false, view: false, edit: false },
    emailsubscribers: { view: false },
    size_color: { view: false },
    offers: { add: false, view: false, edit: false },
    referral_settings: { view: false },
  });

  const permissionDisplayNames = {
    product: "Product",
    blogs: "Blogs",
    banners: "Banners",
    sliders: "Sliders",
    labels: "Labels",
    categories: "Categories",
    subcategories: "Subcategories",
    innersubcategories: "Inner Subcategories",
    coupons: "Coupons",
    fabrics: "Fabrics",
    vendors: "Vendors",
    customers: "Customers",
    customer_support: "Customer Support",
    vendor_support: "Vendor Support",
    billsandinvoices: "Bills and Invoices",
    cmspages: "CMS Pages",
    vendorperformance: "Vendor Performance",
    vendortransaction: "Vendor Transaction",
    charges: "Charges",
    websettings: "Web Settings",
    attributes: "Attributes",
    team: "Team",
    shipment: "Shipment",
    shippingpartner: "Shipping Partner",
    ads: "Ads",
    settings: "Settings",
    notifications: "Notifications",
    orders: "Orders",
    finance: "Finance",
    review: "Review",
    report: "Report",
    faqs: "FAQs",
    contactus: "Contact Us",
    managehomepage: "Manage Homepage",
    emailsubscribers: "Email Subscribers",
    size_color: "Size & Color",
    offers: "Offers",
    referral_settings: "Referral Settings",
  };

  const escalationOptions = [
    { label: "No Escalation", value: 0 },
    { label: "Escalation 1", value: 1 },
    { label: "Escalation 2", value: 2 },
  ];

  const menuItems = Object.keys(permissions).map((key) => ({
    text: permissionDisplayNames[key] || key,
    key,
  }));

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else if (name === "escalation_level") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value), // Ensure value is sent as an integer
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handlePermissionChange = (itemKey, permissionType) => {
    setPermissions((prev) => ({
      ...prev,
      [itemKey]: {
        ...prev[itemKey],
        [permissionType]: !prev[itemKey][permissionType],
      },
    }));
  };

  const validate = () => {
    let errors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is not valid";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      errors.phone = "Mobile number must be 10 digits";
    }

    if (formData.escalation_level === undefined) {
      errors.escalation_level = "Escalation level is required";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    try {
      const preparePayload = (permissions) => {
        const formattedPermissions = Object.keys(permissions).reduce(
          (acc, key) => {
            acc[key] = {
              add: permissions[key]?.add || false,
              view: permissions[key]?.view || false,
              edit: permissions[key]?.edit || false,
              bulk: permissions[key]?.bulk || false,
            };
            return acc;
          },
          {}
        );

        return {
          permission: formattedPermissions,
          escalation_level: formData.escalation_level, // Include escalation level
        };
      };

      const formattedPermissions = preparePayload(permissions);
      const data = {
        ...formData,
        ...formattedPermissions,
        is_active: formData.is_active === "true",
      };

      const response = isEditing
        ? await updateSubAdmin(id, data)
        : await addSubAdmin(data);

      if (response.status === 1) {
        navigate(`${config.VITE_BASE_ADMIN_URL}/team/list`);
      } else {
        setErrors({
          apiError:
            response.message || "An error occurred while saving the data.",
        });
      }
    } catch (error) {
      setErrors({
        apiError: error.message || "An error occurred while saving the data.",
      });
    }
  };

  useEffect(() => {
    const fetchSubAdminData = async () => {
      if (isEditing) {
        try {
          const response = await getSubAdminById(id);
          if (response.status === 1) {
            const { data } = response;
            setFormData({
              name: data.name || "",
              email: data.user.email || "",
              phone: data.user.phone || "",
              is_active: data.user.is_active.toString(),
              escalation_level: data.escalation_level || 0, // Fetch escalation level
            });

            setPermissions(data.permissions || {});
          } else {
            setErrors({
              apiError: response.message || "Failed to fetch data.",
            });
          }
        } catch (error) {
          setErrors({ apiError: error.message || "An error occurred." });
        }
      }
    };

    fetchSubAdminData();
  }, [id, isEditing]);

  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#333843]">
          {isEditing ? "Edit User" : "Create Team/Sub Users"}
        </h1>
        <button>
          <Link to={`${config.VITE_BASE_ADMIN_URL}/team/list`}>
            <ArrowLeft className="w-6 h-6" />
          </Link>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border rounded-md shadow-md py-10 px-4 sm:px-6 md:px-20">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter name"
                className="w-full border rounded-md p-2"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mobile Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Mobile number"
                className="w-full border rounded-md p-2"
                maxLength="10"
                pattern="\d*"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@email.com"
                className="w-full border rounded-md p-2"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                name="is_active"
                value={formData.is_active}
                onChange={handleInputChange}
                className="w-full border rounded-md p-2"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              {errors.is_active && (
                <p className="text-red-500 text-sm">{errors.is_active}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ticket Escalation Level
              </label>
              <select
                name="escalation_level"
                value={formData.escalation_level}
                onChange={handleInputChange}
                className="w-full border rounded-md p-2"
              >
                {escalationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.escalation_level && (
                <p className="text-red-500 text-sm">
                  {errors.escalation_level}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <span className="text-xs text-red-500">
              An invite will be sent to this email address with login details
            </span>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-[#333843]">
            Permissions
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="text-sm text-[#9593A0] font-extralight">
                  <th className="p-4 text-left">Privileges</th>
                  <th className="p-4">View</th>
                  <th className="p-4">Add</th>
                  <th className="p-4">Edit</th>
                  <th className="p-4">Bulk</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => (
                  <tr className="border-t" key={item.key}>
                    <td className="p-4 text-left text-sm font-medium text-[#23272E]">
                      {item.text}
                    </td>
                    {["view", "add", "edit", "bulk"].map(
                      (permissionType) =>
                        permissions[item.key][permissionType] !== undefined && (
                          <td key={permissionType} className="p-4 text-center">
                            <input
                              type="checkbox"
                              name={`${item.key}-${permissionType}`}
                              checked={permissions[item.key][permissionType]}
                              onChange={() =>
                                handlePermissionChange(item.key, permissionType)
                              }
                              className="h-5 w-5 text-[#F47954] focus:ring-[#F47954] border-gray-300 checked:bg-[#F47954]"
                            />
                          </td>
                        )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-right">
          <button
            type="submit"
            className="px-6 py-2 bg-[#F47954] text-white font-semibold rounded-md hover:bg-orange-600"
          >
            {isEditing ? "Update User" : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTeamSubUsers;
