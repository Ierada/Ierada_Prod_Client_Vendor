import { HiArrowLongRight } from "react-icons/hi2";

const ExploreButton = ({ text = "Explore More", onClick }) => {
  return (
    <button onClick={onClick} className="flex items-center justify-center border border-[#6B705C] gap-1 bg-white hover:bg-[#6B705C] text-[#6B705C] hover:text-white transition-colors rounded-sm px-5 py-3 text-sm font-medium">
      <span>{text}</span>
      <HiArrowLongRight className="h-5 w-5 " />
    </button>
  );
};

export default ExploreButton;