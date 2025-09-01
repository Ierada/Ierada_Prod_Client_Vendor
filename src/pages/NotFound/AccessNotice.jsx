import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

const AccessNotice = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();

  // if (!user?.role || (user?.role !== 'admin' && user?.role !== 'vendor')) {
  //   // If no user role or not admin/vendor, redirect to home or appropriate page
  //   navigate('/');
  //   return null;
  // }

  const getDashboardUrl = () => {
    switch (user?.role) {
      case "admin":
        return "/admin/dashboard"; // Update with your admin dashboard route
      case "vendor":
        return "/vendor/dashboard"; // Update with your vendor dashboard route
      default:
        return "/";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Access Notice
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <svg
                className="h-6 w-6 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              {user?.role === "admin" || user?.role === "superadmin"
                ? "Admin Account Detected"
                : "Vendor Account Detected"}
            </h3>
            <div className="mt-2 text-sm text-gray-500">
              <p>
                It appears you're currently logged in to the{" "}
                {user?.role === "superadmin" || user?.role === "admin"
                  ? "Admin"
                  : "Vendor"}{" "}
                dashboard. To access the customer website with full
                functionality:
              </p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>
                  Go to your{" "}
                  {user?.role === "superadmin" || user?.role === "admin"
                    ? "Admin"
                    : "Vendor"}{" "}
                  dashboard using the button below
                </li>
                <li>
                  Log out from your{" "}
                  {user?.role === "superadmin" || user?.role === "admin"
                    ? "Admin"
                    : "Vendor"}{" "}
                  account
                </li>
                <li>Register or log in as a customer to use the website</li>
              </ol>
            </div>
            <div className="mt-5">
              <button
                onClick={() => (window.location.href = getDashboardUrl())}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to{" "}
                {user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1)}{" "}
                Dashboard
              </button>
              <button
                onClick={() => navigate("/")}
                className="mt-3 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessNotice;
