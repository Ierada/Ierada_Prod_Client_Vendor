import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaWallet, FaChevronRight, FaFilter } from "react-icons/fa";
import { BsArrowUpCircleFill, BsArrowDownCircleFill } from "react-icons/bs";
import { format } from "date-fns";
import CommonTopBanner from "../../../components/Website/CommonTopBanner";
import { AccountInfo } from "../../../components/Website/AccountInfo";
import config from "../../../config/config";
import {
  getTransactions,
  addMoneyToWalletOrCoins,
  redeemCoinsToWallet,
} from "../../../services/api.walletAndCoins";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import CommonBanner from "/assets/banners/Commen-top-banner.png";
import WalletCoinCard from "../../../components/Website/CoinCard";
import { initiatePayment, verifyPayment } from "../../../services/api.order";
import { notifyOnFail } from "../../../utils/notification/toast";
import { useAppContext } from "../../../context/AppContext";

const bannerData = [
  {
    id: 1,
    image: CommonBanner,
  },
];

const Wallet = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [amount, setAmount] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  //coins states
  const [coins, setCoins] = useState(null);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWalletData(user.id);
      // fetchCoinData(user.id);
    }
  }, []);

  const fetchWalletData = async (userId) => {
    setIsLoading(true);
    const res = await getTransactions(userId);
    if (res) {
      setTransactions(res.data.transactions);
      setWallet(res.data.wallet_balance);
      setCoins(res.data.coin_balance);
    }
    setIsLoading(false);
  };

  const handleRedeem = async () => {
    if (!redeemAmount || redeemAmount <= 0 || redeemAmount > coins) {
      return notifyOnFail("Invalid amount");
    }

    setIsRedeeming(true);

    try {
      const response = await redeemCoinsToWallet(user.id, Number(redeemAmount));

      if (response) {
        fetchWalletData(user.id);
        setIsRedeemModalOpen(false);
        setRedeemAmount("");
      }
    } catch (error) {
      console.error("Error redeeming coins:", error);
    }

    setIsRedeeming(false);
  };

  const handleRecharge = async () => {
    if (!amount || amount <= 0) {
      return;
    }

    setIsProcessing(true);

    try {
      // Call the Razorpay payment function
      const paymentResponse = await processRazorpayPayment(
        amount,
        "Wallet Recharge"
      );

      console.log("Payment Response:", paymentResponse);

      // If payment is successful, update wallet balance
      const rechargeResponse = await addMoneyToWalletOrCoins(user.id, {
        amount,
        description: "Wallet Recharge",
        payment_id: paymentResponse.razorpay_payment_id,
        amount_type: "wallet",
        transaction_type: "credit",
      });

      if (rechargeResponse?.status === 1) {
        setIsModalOpen(false);
        setAmount("");
        fetchWalletData(user.id);
      } else {
        throw new Error("Wallet update failed after payment.");
      }
    } catch (error) {
      console.error("Recharge Failed:", error);
      notifyOnFail(error.message || "Transaction failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 🔹 Function 1: Handle Razorpay Payment (Reusable)
  const processRazorpayPayment = async (
    amount,
    description = "Transaction"
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        const paymentInitiationDetails = { amount, user_id: user.id };

        // Initiate payment with Razorpay
        const paymentResponse = await initiatePayment(paymentInitiationDetails);

        if (!paymentResponse?.data) {
          return reject(new Error("Payment initiation failed"));
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_TEST_KEY_ID,
          amount: paymentResponse.data.amount,
          currency: paymentResponse.data.currency,
          name: config.BRAND_NAME,
          description,
          order_id: paymentResponse.data.id,
          handler: async function (response) {
            try {
              // Verify Payment
              const verificationResponse = await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verificationResponse?.status !== 1) {
                return reject(new Error("Payment verification failed"));
              }

              // If successful, resolve with payment details
              resolve(response);
            } catch (error) {
              reject(new Error("Payment verification error"));
            }
          },
          theme: { color: "#6B1F40" },
        };

        // Open Razorpay modal
        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
      } catch (error) {
        reject(error);
      }
    });
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType =
      filterType === "all" || transaction.transaction_type === filterType;

    const transactionDate = new Date(transaction.created_at);
    const matchesDate =
      (!dateRange.start || transactionDate >= new Date(dateRange.start)) &&
      (!dateRange.end || transactionDate <= new Date(dateRange.end));

    return matchesType && matchesDate;
  });

  return (
    <main>
      <CommonTopBanner bannerData={bannerData} />
      <section className="w-full">
        <div className="text-center my-10 text-[#000000]">
          <h1 className="text-2xl lg:text-4xl font-semibold mb-2 font-Playfair">
            My Account
          </h1>
          <p className="text-sm lg:text-base font-Lato font-medium">
            Home / My Wallet
          </p>
        </div>

        <div className="px-4 md:px-5 lg:px-20 flex flex-col md:flex-row gap-10">
          <div className="w-full md:w-1/3 lg:w-1/4">
            <AccountInfo activeSection="wallet" />
          </div>

          <div className="md:w-4/5 space-y-8 pb-12">
            <div className="flex flex-col gap-8 sm:flex-row">
              {/* Wallet Card */}
              <WalletCoinCard
                type={"wallet"}
                balance={wallet}
                onAction={() => setIsModalOpen(true)}
              />

              <WalletCoinCard
                type={"coins"}
                balance={coins}
                onAction={() => setIsRedeemModalOpen(true)}
              />
            </div>

            {/* Transactions Section */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-semibold text-gray-800">
                  Transaction History
                </h3>
                <div className="flex gap-4">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6B705C] pr-10"
                  >
                    <option value="all">All Transactions</option>
                    <option value="credit">Credits Only</option>
                    <option value="debit">Debits Only</option>
                  </select>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                    className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6B705C]"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                    className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6B705C]"
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#6B705C] border-t-transparent"></div>
                </div>
              ) : filteredTransactions?.length > 0 ? (
                <div className="space-y-4">
                  {filteredTransactions?.map((transaction, index) => (
                    <div
                      key={transaction.id}
                      className="transform transition-all duration-300 hover:scale-102 hover:bg-gray-50 animate-fadeIn"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-6">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              transaction.transaction_type === "credit"
                                ? "bg-green-100"
                                : "bg-red-100"
                            }`}
                          >
                            {transaction.transaction_type === "credit" ? (
                              <BsArrowUpCircleFill className="text-2xl text-green-500" />
                            ) : (
                              <BsArrowDownCircleFill className="text-2xl text-red-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {transaction.description}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {format(
                                new Date(transaction.created_at),
                                "MMM dd, yyyy HH:mm"
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p
                            className={`text-lg font-semibold ${
                              transaction.transaction_type === "credit"
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {transaction.transaction_type === "credit"
                              ? "+"
                              : "-"}
                            ₹{transaction.amount}
                          </p>
                          <FaChevronRight className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaWallet className="text-2xl text-gray-400" />
                  </div>
                  <p className="text-gray-500">No transactions found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Add Money Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4 transform transition-all duration-300 scale-100 animate-slideUp">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800">
              Add Money to Wallet
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Enter Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B705C] transition-all duration-300"
                  placeholder="Enter amount"
                  min="1"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsProcessing(false);
                    setAmount("");
                  }}
                  className="flex-1 py-4 text-gray-600 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRecharge}
                  disabled={isProcessing || !amount || amount <= 0}
                  className="flex-1 py-4 bg-gradient-to-r from-[#6B705C] to-[#6B705C99] text-white font-medium rounded-xl hover:opacity-90 transition-all duration-300 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Proceed to Pay"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coin redeem modal */}
      {isRedeemModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4 transform transition-all duration-300 scale-100 animate-slideUp">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800">
              Redeem Coins to Wallet
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Enter Coins Amount
                </label>
                <input
                  type="number"
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(e.target.value)}
                  className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition-all duration-300"
                  placeholder="Enter amount"
                  min="4" // Minimum 4 coins required for conversion
                  max={coins}
                  disabled={coins < 4} // Disable input if coins are less than 4
                />
                <p className="text-sm text-gray-500 mt-2">
                  Available: {coins?.toFixed(2)} coins
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Conversion Rate:{" "}
                  <span className="font-semibold">1 coin = ₹0.25</span>
                </p>

                {coins < 4 && (
                  <p className="text-sm text-red-500 mt-1">
                    Minimum 4 coins required to redeem (₹1)
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsRedeemModalOpen(false)}
                  className="flex-1 py-4 text-gray-600 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRedeem}
                  disabled={
                    isRedeeming ||
                    !redeemAmount ||
                    redeemAmount < 4 || // Restrict redemption if less than 4 coins
                    redeemAmount > coins
                  }
                  className="flex-1 py-4 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white font-medium rounded-xl hover:opacity-90 transition-all duration-300 disabled:opacity-50"
                >
                  {isRedeeming ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Redeem Coins"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Wallet;
