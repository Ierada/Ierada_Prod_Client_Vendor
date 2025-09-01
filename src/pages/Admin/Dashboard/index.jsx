import React, { useEffect, useState } from "react";
import DonutPieChart from "../../../components/Vendor/Tables/DonutPieChart";
import { motion } from "framer-motion";
import map from "/assets/banners/admin_map.svg";
import { MdStar } from "react-icons/md";

import {
  FaBox,
  FaPercentage,
  FaRupeeSign,
  FaUserPlus,
  FaCheckCircle,
  FaUndo,
  FaTimesCircle,
  FaUsers,
  FaShoppingCart,
} from "react-icons/fa";
import { Plus } from "lucide-react";

import { useAppContext } from "../../../context/AppContext";
import CustomerRetention from "../../../components/Vendor/Tables/CustomerRetention.jsx";
import config from "../../../config/config";
import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { getAdminDashboardData } from "../../../services/api.dashboard.js";
import UserImg from "/assets/user/person-circle.png";

const trafficByDevice = [
  { name: "Linux", value: 5000, color: "#FF6B6B" },
  { name: "Mac", value: 10000, color: "#A0E7A0" },
  { name: "iOS", value: 8000, color: "#000000" },
  { name: "Windows", value: 12000, color: "#75CFEF" },
  { name: "Android", value: 4000, color: "#A7C7E7" },
  { name: "Other", value: 9000, color: "#B7E7B7" },
];

const trafficByLocation = [
  { name: "Delhi", percentage: 38.6, color: "#A020F0" },
  { name: "Mumbai", percentage: 22.5, color: "#A0E7A0" },
  { name: "Gurgaon", percentage: 30.8, color: "#FF6B6B" },
  { name: "Other", percentage: 8.1, color: "#C0C0C0" },
];

const barData = {
  labels: trafficByDevice.map((device) => device.name),
  datasets: [
    {
      label: "Traffic",
      data: trafficByDevice.map((device) => device.value),
      backgroundColor: trafficByDevice.map((device) => device.color),
    },
  ],
};

const pieData = {
  labels: trafficByLocation.map((location) => location.name),
  datasets: [
    {
      data: trafficByLocation.map((location) => location.percentage),
      backgroundColor: trafficByLocation.map((location) => location.color),
    },
  ],
};

function TopProductsTable({ products = [], title }) {
  return (
    <div className="bg-white border-2 border-[#F2F2F2] rounded-lg p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[25px] font-semibold text-txtPage font-satoshi mb-6">
          {title}
        </h2>
      </div>

      <div className="bg-white rounded-lg">
        <div className="overflow-y-auto h-96 m scrollbar-hide">
          <table className="w-full border-collapse">
            <thead className="bg-white sticky top-0">
              <tr className="text-left text-tableheader text-[14px] font-medium border-b border-[#F2F2F2]">
                <th className="py-2 px-4">Product name</th>
                <th className="py-2 px-4">Price</th>
                <th className="py-2 px-4">Sold</th>
                <th className="py-2 px-4">Sales</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="py-4 px-4 text-txtPage text-[14px] font-satoshi m-auto items-center justify-center"
                  >
                    <div className="flex flex-col items-center justify-center h-full w-full m-auto">
                      <svg
                        className="w-20 h-20 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                        <path
                          d="M12 2a10 10 0 0 1 10 10M2 12A10 10 0 0 1 12 2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                      <p className="text-gray-500 text-sm mt-2">
                        No data available
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product, index) => (
                  <tr key={index} className="border-b border-[#F2F2F2]">
                    <td className="py-4 px-4 text-txtPage text-[14px] font-satoshi">
                      <div className="flex items-center">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-8 h-8 rounded-full mr-3"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                        )}
                        <span>{product.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-txtPage text-[14px] font-satoshi">
                      ₹{product.price}
                    </td>
                    <td className="py-4 px-4 text-txtPage text-[14px] font-satoshi">
                      {product.soldCount}
                    </td>
                    <td className="py-4 px-4 text-txtPage text-[14px] font-satoshi">
                      ₹{product.soldCount * product.price}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const Map = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white border-2 border-[#F2F2F2] rounded-lg p-7"
    >
      <h2 className="text-[25px] font-semibold text-txtPage font-satoshi mb-6">
        Revenue by Region
      </h2>
      <div className="flex flex-col md:flex-row items-center">
        <div className="flex-1 md:pr-6 bg-white h-96 overflow-y-auto scrollbar-hide">
          <table className="table-auto w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-white">
              <tr>
                <th className="text-left text-gray-400 text-sm font-medium py-2">
                  City
                </th>
                <th className="text-left text-gray-400 text-sm font-medium py-2">
                  Revenue
                </th>
                <th className="text-left text-gray-400 text-sm font-medium py-2">
                  Ratio
                </th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((region) => (
                  <React.Fragment key={region.name}>
                    <tr>
                      <td className="py-2 text-sm">{region.name || "N/A"}</td>
                      <td className="py-2 text-sm">
                        ₹{region.value.toLocaleString()}
                      </td>
                      <td className="py-2 text-sm">{region.percentage}%</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="py-2">
                        <div className="w-full bg-gray-200 h-1 rounded-md">
                          <div
                            className="h-1 rounded-md"
                            style={{
                              width: `${region.percentage}%`,
                              backgroundColor: "#F47954",
                            }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              ) : (
                <div className="py-2 text-sm ">No data</div>
              )}
            </tbody>
          </table>
        </div>

        <div>
          <img src={map} alt="Map" />
        </div>
      </div>
    </motion.div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const { user } = useAppContext();
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });
  const [dashboardData, setDashboardData] = useState({
    total_products: 0,
    total_sales: 0,
    completed_order: 0,
    return_order: 0,
    cancelled_order: 0,
    total_revenue: 0,
    total_users: 0,
    new_users: 0,
    donutChartData: [],
    stateData: [],
    topSellingProducts: [],
    topRentingProducts: [],
    customerRetentionData: [],
  });
  const [salesDetailDataPoints, setSalesDetailDataPoints] = useState([
    {
      x: "Jan:0",
      totalSales: 0,
      y: 0,
    },
    {
      x: "Feb:0",
      totalSales: 0,
      y: 0,
    },
    {
      x: "Mar:0",
      totalSales: 0,
      y: 0,
    },
    {
      x: "Apr:0",
      totalSales: 0,
      y: 0,
    },
    {
      x: "May:0",
      totalSales: 0,
      y: 0,
    },
    {
      x: "Jun:0",
      totalSales: 0,
      y: 0,
    },
    {
      x: "Jul:0",
      totalSales: 0,
      y: 0,
    },
    {
      x: "Aug:0",
      totalSales: 0,
      y: 0,
    },
    {
      x: "Sep:0",
      totalSales: 0,
      y: 0,
    },
    {
      x: "Oct:0",
      totalSales: 0,
      y: 0,
    },
    {
      x: "Nov:0",
      totalSales: 0,
      y: 0,
    },
    {
      x: "Dec:0",
      totalSales: 0,
      y: 0,
    },
  ]);
  const [customerReviews, setCustomerReviews] = useState([]);
  const [newCustomers, setNewCustomers] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    const fetchDashboardData = async () => {
      const response = await getAdminDashboardData({
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
      });
      if (response) {
        setDashboardData(response.data.dashboardData);
        setSalesDetailDataPoints(
          response.data.dashboardData.salesDetailDataPoints
        );
        setCustomerReviews(response.data.dashboardData.customerReviews);
        setNewCustomers(response.data.dashboardData.newCustomers);
      }
    };

    fetchDashboardData();
  }, [dateRange]);

  // Function to get the date range for salesDetailDataPoints
  const getDateRange = (rangeType) => {
    const today = new Date();
    let from, to;

    switch (rangeType) {
      case "all":
        from = new Date(new Date().getFullYear(), 0, 1);
        to = new Date();
        break;

      case "today":
        from = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        to = new Date();
        break;

      case "week":
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - today.getDay()); // Get Sunday
        from = new Date(
          firstDayOfWeek.getFullYear(),
          firstDayOfWeek.getMonth(),
          firstDayOfWeek.getDate()
        );
        to = new Date();
        break;

      case "month":
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = new Date();
        break;

      default:
        throw new Error(
          "Invalid range type. Use 'today', 'this week', or 'this month'."
        );
    }

    setDateRange({ from, to });
  };

  function CardDataStatus({ title, value, change, icon }) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg p-6 min-h-28 flex items-center justify-between shadow-card"
      >
        <div className="flex gap-6">
          <div>{icon}</div>
          <div>
            <p className="text-[black] text-sm md:text-base">{title}</p>
            <h2 className="text- md:text-lg font-semibold">{value}</h2>
          </div>
        </div>
      </motion.div>
    );
  }

  const formatAmount = (amount) => {
    if (amount == null || isNaN(amount)) return "0";
    return amount >= 1000
      ? (amount / 1000).toFixed(1) + "K"
      : amount.toString();
  };

  return (
    <div className="mt-6 text-[black] ">
      <div className="flex justify-between">
        <div>
          <h2 className="text-3xl font-semibold font-satoshi">Dashboard</h2>
        </div>

        <div className="flex gap-3">
          {/* <button
            className='flex items-center gap-2 bg-white text-orange border-orange border px-3 py-1 rounded-lg   text-lg transition-colors'
            onClick={() => navigate(`${config.VITE_BASE_VENDOR_URL}/adds/add`)}
          >
            <Plus className='h-5 w-5' /> Add attribute
          </button> */}
          <button
            className="flex items-center gap-2 bg-[#F47954] text-white px-3 py-1 rounded-lg border text-lg transition-colors"
            onClick={() =>
              navigate(`${config.VITE_BASE_ADMIN_URL}/product/add`)
            }
          >
            <Plus className="h-5 w-5" /> Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 lg:gap-4 mt-5 lg:mt-10 mb-5">
        {dashboardData ? (
          <>
            <CardDataStatus
              icon={
                <div className="p-4 bg-[#F6DDA391] text-[#FFDB89] rounded-md">
                  <FaBox />
                </div>
              }
              title="Total Products"
              value={formatAmount(dashboardData.total_products)}
            />
            <CardDataStatus
              icon={
                <div className="p-4 bg-[#FFE3D0] text-[#F48031] rounded-md">
                  <FaPercentage />
                </div>
              }
              title="Total Sale"
              value={formatAmount(dashboardData.total_sales)}
            />
            <CardDataStatus
              icon={
                <div className="p-4 bg-[#CED6FF] text-[#3A5BFF] rounded-md">
                  <FaRupeeSign />
                </div>
              }
              title="Total Revenue"
              value={formatAmount(dashboardData.total_revenue)}
            />
            <CardDataStatus
              icon={
                <div className="p-4 bg-[#EBEBFF] text-[#C2C0FF] rounded-md">
                  <FaUserPlus />
                </div>
              }
              title="New User"
              value={formatAmount(dashboardData.new_users)}
            />

            <CardDataStatus
              icon={
                <div className="p-4 bg-[#D1FFE1] text-[#39C568] rounded-md">
                  <FaUsers />
                </div>
              }
              title="Total Buyers"
              value={formatAmount(dashboardData.total_vendors)}
            />

            <CardDataStatus
              icon={
                <div className="p-4 bg-[#DEFDFF] text-[#51D3DB] rounded-md">
                  <FaShoppingCart />
                </div>
              }
              title="Total Vendors"
              value={formatAmount(dashboardData.total_vendors)}
            />
          </>
        ) : (
          <>
            <CardDataStatus
              title="Total Products"
              value={<div className="h-6 w-24 bg-gray-200 animate-pulse"></div>}
            />
            <CardDataStatus
              title="Total Sale"
              value={<div className="h-6 w-24 bg-gray-200 animate-pulse"></div>}
            />
            <CardDataStatus
              title="Total Revenue"
              value={<div className="h-6 w-24 bg-gray-200 animate-pulse"></div>}
            />
            <CardDataStatus
              title="New User"
              value={<div className="h-6 w-24 bg-gray-200 animate-pulse"></div>}
            />
            <CardDataStatus
              title="Total Buyers"
              value={<div className="h-6 w-24 bg-gray-200 animate-pulse"></div>}
            />
            <CardDataStatus
              title="Total Vendors"
              value={<div className="h-6 w-24 bg-gray-200 animate-pulse"></div>}
            />
          </>
        )}
      </div>

      <section className="p-5 bg-white rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:justify-between mb-4">
          <h2 className="text-[25px] font-semibold text-txtPage font-satoshi">
            Sales Details
          </h2>
          <div className="flex gap-2 border border-[#F2F2F2] rounded-lg p-2 sm:p-0 ">
            <button
              className={`px-2 sm:px-14 sm:py-1 rounded-lg ${
                selectedFilter === "all" &&
                "border border-orange-400 text-orange"
              }`}
              onClick={() => {
                getDateRange("all");
                setSelectedFilter("all");
              }}
            >
              All Time
            </button>
            <button
              className={`px-2 sm:px-14 sm:py-1 rounded-lg ${
                selectedFilter === "today" &&
                "border border-orange-400 text-orange"
              }`}
              onClick={() => {
                getDateRange("today");
                setSelectedFilter("today");
              }}
            >
              Today
            </button>
            <button
              className={`px-2 sm:px-14 sm:py-1 rounded-lg ${
                selectedFilter === "week" &&
                "border border-orange-400 text-orange"
              }`}
              onClick={() => {
                getDateRange("week");
                setSelectedFilter("week");
              }}
            >
              This Week
            </button>
            <button
              className={`px-2 sm:px-14 sm:py-1 rounded-lg ${
                selectedFilter === "month" &&
                "border border-orange-400 text-orange"
              }`}
              onClick={() => {
                getDateRange("month");
                setSelectedFilter("month");
              }}
            >
              This Month
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={salesDetailDataPoints}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              tickFormatter={(value) => {
                const parts = value.split(":");
                return parts[1] ? `${parts[1] / 1000}k` : value; // Prevents errors if ":" is missing
              }}
              label={{ position: "insideBottom", offset: -5 }}
            />
            <YAxis
              tickFormatter={(value) => `${value}%`}
              label={{ angle: -90, position: "insideLeft" }}
              domain={[0, 100]}
            />
            <Tooltip formatter={(value) => `${value}%`} />
            <Area
              type="monotone"
              dataKey="y"
              stroke="#3A5BFF"
              fill="rgba(58, 91, 255, 0.3)"
              dot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
        <div className="col-span-1">
          {dashboardData && dashboardData.topSellingProducts.length > 0 ? (
            <TopProductsTable
              title={"Top Selling Products"}
              products={dashboardData.topSellingProducts}
            />
          ) : (
            <TopProductsTable title={"Top Selling Products"} products={[]} />
          )}
        </div>

        <div className="w-full">
          {dashboardData ? (
            <Map data={dashboardData.stateData} />
          ) : (
            <div className="h-64 w-full bg-gray-200 animate-pulse"></div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10 ">
        <div className="bg-white border-2 border-[#F2F2F2] rounded-lg p-5 ">
          <div className="ml-2">
            <h2 className="text-[25px] font-semibold text-txtPage font-satoshi mb-6">
              Customer
            </h2>

            {/* <div>
              <select
                className='border border-gray-300 rounded-3xl px-6 py-1 pr-8 text-[14px] text-txtPage focus:outline-none focus:ring-1 focus:ring-blue-500'
                defaultValue=''
              >
                <option value='' disabled>
                  Sort By
                </option>
                <option>New</option>
                <option>old</option>
              </select>
            </div> */}
          </div>

          <div className="">
            {newCustomers?.length > 0 ? (
              newCustomers.map((customer) => (
                <div className="flex items-center gap-4 mb-4 ml-7">
                  <img
                    className="w-12 h-12 rounded-full "
                    src={customer.avatar || UserImg}
                    alt=""
                    srcset=""
                  />
                  <div>
                    <p>{customer.name}</p>
                    <p className="text-xs">{customer.phone}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-64 w-full animate-pulse">No Users</div>
            )}
          </div>
        </div>

        <div className="bg-white border-2 border-[#F2F2F2] rounded-lg p-5 ">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[25px] font-semibold text-txtPage font-satoshi mb-6">
              Customer Ratings
            </h2>
          </div>

          <div className="">
            {customerReviews?.length > 0 ? (
              customerReviews.map((customer) => (
                <div className="flex justify-between items-center px-10">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      className="w-12 h-12 rounded-full "
                      src={customer.avatar || UserImg}
                      alt=""
                      srcset=""
                    />
                    <div>
                      <p>{customer.name}</p>
                      <p className="text-xs">{customer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <p>{customer.ratings} </p>
                    <MdStar className="text-yellow-500 h-4 w-4" />
                  </div>
                </div>
              ))
            ) : (
              <div className="h-64 w-full animate-pulse"> No Ratings Yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
