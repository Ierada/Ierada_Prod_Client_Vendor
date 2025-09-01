import React from 'react';
import { BsArrowUpRight } from 'react-icons/bs';

const SummaryCard = ({ platform, icon, followers, growth, channel }) => (
  <div className="bg-white p-4 text-start  border-r-2  border-[#F8F8F8] ">
    <div className="flex items-start space-x-2">
      <img src={`${icon}`} alt={`${platform} icon`} className="w-6 h-6 mb-2" />{' '}
      <p className="text-[13px] font-satoshi font-normal text-[#131417]">
        {platform}
      </p>
    </div>
    <h2 className="text-[24px] font-satoshi font-bold text-[#131417]">
      {followers}
    </h2>
    <div className="flex items-center space-x-2">
      <p className="text-[12px] font-satoshi font-normal">{channel}</p>
      <p className="text-[#00BFFF] text-[12px] font-satoshi font-normal">
        {/* <BsArrowUpRight className="inline-block mr-1" /> */}
        <img
          src="./images/call_made.png"
          className="w-3 h-3 inline-block mr-1"
        />
        {growth}
      </p>
    </div>
  </div>
);

export default SummaryCard;
