import React from "react";
import { useAppContext } from "../../../context/AppContext";
import { AccountInfo } from "../../../components/Website/AccountInfo";
import CommonTopBanner from "../../../components/Website/CommonTopBanner";

const ReferralPage = () => {
  const { user } = useAppContext();

  const handleShare = async () => {
    const shareData = {
      title: "Join with my referral code!",
      text: `Use my referral code: ${user.referral_code} to join!`,
      url: window.location.origin,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to copy to clipboard
        await navigator.clipboard.writeText(user.referral_code);
        alert("Referral code copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      // Fallback to copy to clipboard on error
      await navigator.clipboard.writeText(user.referral_code);
      alert("Referral code copied to clipboard!");
    }
  };

  return (
    <main>
      {/* <CommonTopBanner /> */}
      <section>
        <div className="text-center my-10 text-[#000000]">
          <h1 className="text-2xl lg:text-4xl font-semibold mb-2 font-Playfair">
            My Account
          </h1>
          <p className=" text-sm lg:text-base font-Lato font-medium ">
            Home / Refer & Earn
          </p>
        </div>
        <div className="bg-white px-4 md:px-5 lg:px-20 flex flex-col md:flex-row gap-10">
          <div className="w-full md:w-1/3 lg:w-1/4">
            <AccountInfo activeSection="referral" />
          </div>
          <div className="mt-10 md:w-4/5">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl text-[black] font-bold mb-4">
                Your Referral Code
              </h2>
              <p className="bg-gray-100 p-2 rounded-md mb-4">
                {user?.referral_code || "No referral code available"}
              </p>

              <button
                onClick={handleShare}
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Share Referral Code
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ReferralPage;
