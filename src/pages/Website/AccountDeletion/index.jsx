import React from "react";
import {
  Smartphone,
  LogIn,
  User,
  Trash2,
  AlertTriangle,
  Download,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AccountDeletionInstructions() {
  const steps = [
    {
      number: 1,
      icon: Download,
      title: "Download the App",
      description: "Download Online Shopping Hub from Playstore / App Store",
      details: "Available on both Android and iOS platforms",
    },
    {
      number: 2,
      icon: LogIn,
      title: "Login to Your Account",
      description: "Login into the app using your registered phone number",
      details: "Use the same phone number you used for registration",
    },
    {
      number: 3,
      icon: User,
      title: "Navigate to Profile",
      description: "Go to Profile section from the navigation drawer",
      details: "Open the side menu and select 'Profile'",
    },
    {
      number: 4,
      icon: Trash2,
      title: "Find Delete Account Option",
      description: "Click on Delete Account button",
      details: "Located in the profile settings section",
    },
    {
      number: 5,
      icon: AlertTriangle,
      title: "Confirm Deletion",
      description: "In the dialog box, click on delete button",
      details: "This action is permanent and cannot be undone",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 ">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Account Deletion Instructions
              </h1>
              <p className="text-gray-600">
                Follow these steps to permanently delete your account
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Warning Banner */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800 mb-2">
                Important Notice
              </h3>
              <p className="text-red-700 text-sm leading-relaxed">
                Account deletion is permanent and cannot be reversed. All your
                data, including order history, saved addresses, wishlist items,
                and account information will be permanently removed from our
                systems.
              </p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Step-by-Step Instructions
          </h2>

          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.number}
                className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Step Number */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                        {step.number}
                      </div>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <IconComponent className="h-5 w-5 text-gray-600" />
                          </div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {step.title}
                          </h3>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 mt-1" />
                      </div>

                      <p className="text-gray-700 mb-2 font-medium">
                        {step.description}
                      </p>
                      <p className="text-gray-500 text-sm">{step.details}</p>
                    </div>
                  </div>
                </div>

                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="flex justify-start pl-9">
                    <div className="w-0.5 h-6 bg-gray-200"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Additional Information */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {/* Need Help Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-800 mb-3">Need Help?</h3>
            <p className="text-blue-700 text-sm mb-4">
              If you're having trouble following these steps or need assistance,
              our support team is here to help.
            </p>
            <Link
              to="/contact-us"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>

        {/* Final Warning */}
        <div className="mt-12 bg-gray-900 text-white rounded-xl p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-3">
            Final Confirmation Required
          </h3>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Once you complete step 5 and confirm the deletion in the dialog box,
            your account and all associated data will be permanently removed
            from our systems within 24-48 hours. This action cannot be undone.
          </p>
        </div>
      </div>
    </div>
  );
}
