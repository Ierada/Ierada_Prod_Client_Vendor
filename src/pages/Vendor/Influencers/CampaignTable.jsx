import React from 'react';
import { useNavigate } from 'react-router-dom';

const campaigns = [
  {
    productName: 'Banarasi Sari',
    campaignId: '#75834',
    status: 'Active',
    startDate: '12 Jul 2023',
    updateDate: '23 Sep 2023',
    endDate: '01 Dec 2024',
    finalCost: '+₹7500',
    medium: 'Instagram',
    influencer: 'Lily French',
  },
  {
    productName: 'Bohemian Midi Dress',
    campaignId: '#74334',
    status: 'Active',
    startDate: '12 Jul 2023',
    updateDate: '23 Sep 2023',
    endDate: '01 Dec 2024',
    finalCost: '+₹7500',
    medium: 'Instagram',
    influencer: 'Lily French',
  },
  {
    productName: 'Bohemian Midi Dress',
    campaignId: '#74334',
    status: 'On hold',
    startDate: '12 Jul 2023',
    updateDate: '23 Sep 2023',
    endDate: '01 Dec 2024',
    finalCost: '+₹7500',
    medium: 'Instagram',
    influencer: 'Lily French',
  },
  {
    productName: 'Bohemian Midi Dress',
    campaignId: '#74334',
    status: 'Stop',
    startDate: '12 Jul 2023',
    updateDate: '23 Sep 2023',
    endDate: '01 Dec 2024',
    finalCost: '+₹7500',
    medium: 'Instagram',
    influencer: 'Lily French',
  },
  {
    productName: 'Bohemian Midi Dress',
    campaignId: '#74334',
    status: 'Stop',
    startDate: '12 Jul 2023',
    updateDate: '23 Sep 2023',
    endDate: '01 Dec 2024',
    finalCost: '+₹7500',
    medium: 'Instagram',
    influencer: 'Lily French',
  },
  {
    productName: 'Bohemian Midi Dress',
    campaignId: '#74334',
    status: 'Stop',
    startDate: '12 Jul 2023',
    updateDate: '23 Sep 2023',
    endDate: '01 Dec 2024',
    finalCost: '+₹7500',
    medium: 'Instagram',
    influencer: 'Lily French',
  },
  {
    productName: 'Bohemian Midi Dress',
    campaignId: '#74334',
    status: 'Stop',
    startDate: '12 Jul 2023',
    updateDate: '23 Sep 2023',
    endDate: '01 Dec 2024',
    finalCost: '+₹7500',
    medium: 'Instagram',
    influencer: 'Lily French',
  },
  {
    productName: 'Bohemian Midi Dress',
    campaignId: '#74334',
    status: 'Stop',
    startDate: '12 Jul 2023',
    updateDate: '23 Sep 2023',
    endDate: '01 Dec 2024',
    finalCost: '+₹7500',
    medium: 'Instagram',
    influencer: 'Lily French',
  },
  {
    productName: 'Bohemian Midi Dress',
    campaignId: '#74334',
    status: 'Stop',
    startDate: '12 Jul 2023',
    updateDate: '23 Sep 2023',
    endDate: '01 Dec 2024',
    finalCost: '+₹7500',
    medium: 'Instagram',
    influencer: 'Lily French',
  },
  {
    productName: 'Bohemian Midi Dress',
    campaignId: '#74334',
    status: 'Stop',
    startDate: '12 Jul 2023',
    updateDate: '23 Sep 2023',
    endDate: '01 Dec 2024',
    finalCost: '+₹7500',
    medium: 'Instagram',
    influencer: 'Lily French',
  },
  {
    productName: 'Bohemian Midi Dress',
    campaignId: '#74334',
    status: 'Stop',
    startDate: '12 Jul 2023',
    updateDate: '23 Sep 2023',
    endDate: '01 Dec 2024',
    finalCost: '+₹7500',
    medium: 'Instagram',
    influencer: 'Lily French',
  },
];

const CampaignTable = () => {
  const navigate = useNavigate();
  return (
    <div className="">
      <div className="flex justify-between items-center">
        <h2 className="text-[24px] lg:text-[28px] font-semibold text-txtPage font-satoshi">
          Campaigns{' '}
        </h2>
        <button
          className="bg-black text-white lg:px-4 py-2 rounded hover:bg-black text-[16px] lg:text-[20px] px-2"
          onClick={() => navigate('./campaign/create')}
        >
          + Add New Campaigns
        </button>
      </div>
      <div className="bg-white border border-[#F8F8F8] dark:bg-gray-800 rounded-lg overflow-hidden mt-4">
        <div className="h-[400px] overflow-y-auto scrollbar-hide">
          {' '}
         
         
          <table className="min-w-full text-left border-collapse">
            <thead
              style={{ backgroundColor: '#F8F8F8' }}
              className="sticky top-0 bg-gray-300 dark:bg-gray-700 z-10"
            >
              <tr>
                <th className="px-4 py-3 border-b border-[#F8F8F8] text-[#2D3954] font-satoshi font-semibold text-[15px]">
                  Product Name
                </th>
                <th className="px-4 py-3 border-b border-[#F8F8F8] text-[#2D3954] font-satoshi font-semibold text-[15px]">
                  Campaign ID
                </th>
                <th className="px-4 py-3 border-b border-[#F8F8F8] text-[#2D3954] font-satoshi font-semibold text-[15px]">
                  Status
                </th>
                <th className="px-4 py-3 border-b border-[#F8F8F8] text-[#2D3954] font-satoshi font-semibold text-[15px]">
                  Start Date
                </th>
                <th className="px-4 py-3 border-b border-[#F8F8F8] text-[#2D3954] font-satoshi font-semibold text-[15px]">
                  Update Date
                </th>
                <th className="px-4 py-3 border-b border-[#F8F8F8] text-[#2D3954] font-satoshi font-semibold text-[15px]">
                  End Date
                </th>
                <th className="px-4 py-3 border-b border-[#F8F8F8] text-[#2D3954] font-satoshi font-semibold text-[15px]">
                  Final Cost
                </th>
                <th className="px-4 py-3 border-b border-[#F8F8F8] text-[#2D3954] font-satoshi font-semibold text-[15px]">
                  Medium
                </th>
                <th className="px-4 py-3 border-b border-[#F8F8F8] text-[#2D3954] font-satoshi font-semibold text-[15px]">
                  Influencer
                </th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign, index) => (
                <tr key={index} className="">
                  <td className="p-3 text-[15px] text-[#2D3954] dark:text-gray-300 font-medium">
                    {campaign.productName}
                  </td>
                  <td className="p-3 text-[15px] text-[#2D3954] dark:text-gray-300 font-medium">
                    {campaign.campaignId}
                  </td>
                  <td className="p-3 text-[13px] font-satoshi font-normal">
                    <span
                      className={`px-3 py-2 font-semibold rounded-full ${
                        campaign.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : campaign.status === 'Stop'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {campaign.status}
                    </span>
                  </td>
                  <td className="p-3 text-[15px] text-[#2D3954] dark:text-gray-300 font-medium">
                    {campaign.startDate}
                  </td>
                  <td className="p-3 text-[15px] text-[#2D3954] dark:text-gray-300 font-medium">
                    {campaign.updateDate}
                  </td>
                  <td className="p-3 text-[15px] text-[#2D3954] dark:text-gray-300 font-medium">
                    {campaign.endDate}
                  </td>
                  <td className="p-3 text-[15px] text-[#2D3954] dark:text-gray-300 font-medium">
                    {campaign.finalCost}
                  </td>
                  <td className="p-3 text-[16px] text-[#2D3954] dark:text-gray-300 font-semibold">
                    {campaign.medium}
                  </td>
                  <td className="p-3 text-[16px] text-[#2D3954] dark:text-gray-300 font-semibold">
                    {campaign.influencer}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CampaignTable;
