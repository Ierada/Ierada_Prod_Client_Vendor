import React, { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { getPolicy } from "../../../services/api.policy";
import { getTermConditions } from "../../../services/api.settings";

export default function PrivacyPolicyAndTermsAndConditions({ title }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      let res;
      if (title === "Privacy Policy") {
        res = await getPolicy();
      } else if (title === "Terms & Conditions") {
        res = await getTermConditions();
      }
      if (res?.data) {
        setDetails(DOMPurify.sanitize(res.data));
      } else {
        setDetails("<p>No data available.</p>");
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex justify-center bg-gray-100 p-6">
      <div className="bg-white max-w-4xl w-full p-6 rounded-lg shadow-lg mt-10">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          {title}
        </h1>
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          <div
            className="text-gray-700 leading-relaxed policy-content"
            dangerouslySetInnerHTML={{ __html: details }}
          ></div>
        )}
      </div>
    </div>
  );
}
