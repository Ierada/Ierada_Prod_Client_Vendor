import React, { useEffect, useState } from "react";
import {
  updateReferralCoinAmounts,
  getSettings,
} from "../../../services/api.settings";

export default function ReferralSettings() {
  const [referrerAmount, setReferrerAmount] = useState("");
  const [referredAmount, setReferredAmount] = useState("");

  // Fetch existing settings on page load
  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await getSettings();

        if (response && response.status === 1) {
          setReferrerAmount(response.data.referrer_coin_amount || 0.0);
          setReferredAmount(response.data.referred_coin_amount || 0.0);
        } else {
          console.error("Invalid settings data or empty response:", response);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    }

    fetchSettings();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateReferralCoinAmounts({
        referrer_coin_amount: referrerAmount,
        referred_coin_amount: referredAmount,
      });

      if (response?.status === 1) {
        // alert("Referral coin amounts updated successfully!");
      } else {
        // alert(response.message || "Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating referral amounts:", error);
      alert("An error occurred.");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Referral Settings</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Referrer Coin Amount</label>
          <input
            type="number"
            value={referrerAmount}
            onChange={(e) => setReferrerAmount(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Referred Coin Amount</label>
          <input
            type="number"
            value={referredAmount}
            onChange={(e) => setReferredAmount(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-[#F47954] text-white px-4 py-2 rounded "
        >
          Update Settings
        </button>
      </form>
    </div>
  );
}
