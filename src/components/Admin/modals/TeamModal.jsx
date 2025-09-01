import React from "react";
import { X } from "lucide-react";

const TeamModal = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;
  const permissions = data?.permissions;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold mb-4 text-[#333843]">
            Sub User Details
          </h2>
          <button onClick={onClose} className="p-2">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Display basic details */}
          <div className="flex items-center space-x-2 ">
            <p className="text-sm font-medium text-gray-800 "> Name:</p>
            <p className="text-sm font-normal text-gray-600 flex-1">
              {data?.name || "N/A"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-800 ">Email:</p>
            <p className="text-sm font-normal text-gray-600 flex-1">
              {data?.adminUser?.email || "N/A"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-800">Mobile Number:</p>
            <p className="text-sm font-normal text-gray-600 flex-1">
              {data?.adminUser?.phone || "N/A"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-800 ">Adding Date:</p>
            <p className="text-sm font-normal text-gray-600 flex-1">
              {data?.created_at
                ? new Date(data.created_at).toLocaleDateString("en-CA") // 'en-CA' is for YYYY-MM-DD format
                : "N/A"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-800 ">Status:</p>
            <p className="text-sm font-normal text-gray-600 flex-1">
              {data?.adminUser?.status || "N/A"}
            </p>
          </div>
          {data?.escalation_level && data?.escalation_level !== 0 ? (
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-800 ">
                Escalation Level:
              </p>
              <p className="text-sm font-normal text-gray-600 flex-1">
                {data?.escalation_level || "N/A"}
              </p>
            </div>
          ) : null}
        </div>

        {/* Roles Table */}
        <div>
          <h2 className="text-xl font-semibold my-4 text-[#333843]">
            Permissions
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="text-sm text-[#9593A0] font-extralight">
                  <th className="p-4 text-left">Privileges</th>
                  <th className="p-4">View</th>
                  <th className="p-4">Create</th>
                  <th className="p-4">Update</th>
                  <th className="p-4">Bulk</th>
                </tr>
              </thead>
              <tbody>
                {permissions && Object.keys(permissions).length > 0 ? (
                  Object.entries(permissions).map(([moduleName, actions]) => (
                    <tr key={moduleName} className="border-t">
                      <td className="p-4 text-left text-sm font-medium text-[#23272E] capitalize">
                        {moduleName}
                      </td>
                      {["view", "add", "edit", "bulk"].map((action, idx) => (
                        <td key={idx} className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={actions[action] || false}
                            readOnly
                            className="h-5 w-5 text-[#F47954] focus:ring-[#F47954] border-gray-300 checked:bg-[#F47954]"
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-4 text-center text-sm text-gray-500"
                    >
                      No permissions data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamModal;
