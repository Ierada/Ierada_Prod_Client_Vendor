import React from "react";
import { motion } from "framer-motion";
import map from "/assets/banners/vendor_map.svg";

const Map = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="mt-4"
    >
      <h2 className="text-[25px] font-semibold text-txtPage font-satoshi">
        Revenue by Region
      </h2>
      <div className="flex flex-col items-center border-2  max-h-[468px] border-[#F2F2F2] bg-white rounded-lg p-5 mt-8">
        <div>
          <img className="h-32 md:h-50 mb-1" src={map} alt="Map" />
        </div>
        <div className="flex-1 md:pr-6 w-full  overflow-y-auto scrollbar-hide">
          <table className="table-auto w-full border-collapse">
            <thead className="sticky top-0 z-5 bg-white">
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
              {data.map((region) => (
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
                            backgroundColor: "#6E8EFF",
                          }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default Map;
