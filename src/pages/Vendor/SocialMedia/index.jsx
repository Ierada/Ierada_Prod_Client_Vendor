import React from 'react';
import SummaryCard from './SummaryCard';
import GenderChart from './GendarChart';
import DeviceUsageChart from './DeviceUsageChart';
import ProfileVisitsChart from './ProfileVisitsChart';
import FollowerAcquisitionChart from './FollowersAcquisitionChart';

export default function SocialMedia() {
  const platformsData = [
    {
      platform: 'Tiktok',
      icon: '/images/social-mediaT.png',
      channel: 'Followers',
      followers: '420K',
      growth: '12%',
    },
    {
      platform: 'Instagram',
      icon: '/images/social-mediaI.png',
      followers: '980K',
      growth: '20%',
      channel: 'Followers',
    },
    {
      platform: 'Youtube',
      icon: '/images/social-media.png',
      followers: '230K',
      growth: '53%',
      channel: 'Subscribers',
    },
    {
      platform: 'Twitter',
      icon: '/images/twitter.png',
      followers: '670K',
      growth: '25%',
      channel: 'Subscribers',
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[24px] lg:text-[28px] font-semibold text-txtPage font-satoshi">
          Social Media
        </h2>
        <button className="bg-black text-white px-4 py-2 rounded hover:bg-black text-[16px] lg:text-[20px]">
          + Add New Social Media
        </button>
      </div>
      <div className="grid grid-cols-4 border border-[#F8F8F8] rounded-lg shadow-md gap-4">
        {platformsData.map((item, index) => (
          <SummaryCard
            className="  "
            key={index}
            platform={item.platform}
            icon={item.icon}
            followers={item.followers}
            growth={item.growth}
            channel={item.channel}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <GenderChart />
        <ProfileVisitsChart />
        <DeviceUsageChart />
      </div>

      <div className="mt-6 bg-white p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold">Follower Acquisition</h2>
        <FollowerAcquisitionChart />
      </div>
    </div>
  );
}
