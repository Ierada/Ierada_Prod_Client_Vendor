import { FaWallet, FaCoins } from "react-icons/fa";

const WalletCoinCard = ({ type, balance, onAction, setIsModalOpen }) => {
  // Define styles based on type
  const isWallet = type === "wallet";

  const gradientFrom = isWallet ? "#6B705C" : "#FFD700";
  const gradientTo = isWallet ? "#6B705C99" : "#FFA500";
  const buttonText =  "Add Money" ;

  const textColor = isWallet ? "#6B705C" : "#FFD700";

  return (
    <div className="w-full relative transition-all duration-300 hover:transform hover:scale-105">
      {/* Background Gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-r rounded-3xl transform rotate-1 opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`,
        }}
      ></div>

      {/* Card Container */}
      <div
        className="relative bg-gradient-to-r rounded-3xl p-8 shadow-xl"
        style={{
          backgroundImage: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              {isWallet ? (
                <FaWallet className="text-2xl text-white" />
              ) : (
                <FaCoins className="text-2xl text-white" />
              )}
            </div>

            {/* Title */}
            <h2 className="text-xl text-white font-medium">
              IERADA {isWallet ? "Wallet" : "Coins"}
            </h2>
          </div>

          {/* Action Button */}
          {isWallet && (
  <button
    onClick={onAction}
    className="px-6 py-3 bg-white font-medium rounded-xl hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg"
    style={{ color: textColor }}
  >
    {buttonText}
  </button>
)}
        </div>

        {/* Balance Info */}
        <div className="text-white">
          <p className="text-lg opacity-80">
            {isWallet ? "Available Balance" : "Available Coins"}
          </p>
          <p className="text-5xl font-bold mt-2">
            {balance?.toFixed(2) || "0.00"}
          </p>
        </div>

        {/* Decorative Circles */}
        <div className="absolute bottom-8 right-8 opacity-10">
          <div className="w-16 h-16 border-2 border-white rounded-full"></div>
          <div className="w-16 h-16 border-2 border-white rounded-full -mt-8 ml-8"></div>
        </div>
      </div>
    </div>
  );
};

export default WalletCoinCard;


