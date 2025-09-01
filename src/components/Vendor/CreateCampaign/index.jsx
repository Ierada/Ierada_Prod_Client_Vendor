import React from 'react';

const CreateCampaign = () => {
  return (
    <div className="ml-40 mt-4">
      <h1 className="text-[35px] font-semibold text-txtPage font-satoshi">
        Create a campaign
      </h1>

      {/* Campaign Name & Dates */}
      <div className="grid grid-cols-3 gap-4 my-6">
        <div>
          <label className="block text-[16px] font-satoshi font-semibold text-txtPage mb-1">
            Campaign Name
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="Enter name"
          />
        </div>
        <div>
          <label className="block text-[#5782D5] text-[16px] font-satoshi font-semibold mb-1">
            Starting Date
          </label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-[#933F49] text-[16px] font-satoshi font-semibold  mb-1">
            Ending Date
          </label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>
      </div>

      {/* Campaign Details */}
      <div className="mb-6">
        <label className="block text-[#171A1F] font-satoshi font-normal text-[16px] mb-1">
          Campaign Detail
        </label>
        <div className="space-y-2">
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="Detail"
          />
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="Detail"
          />
          <button className="text-blue-500 mt-1">+ Add</button>
        </div>
      </div>

      {/* Influencer */}
      <div className="mb-6">
        <label className="block text-[#171A1F] font-satoshi font-normal text-[16px] mb-1">
          Influencer
        </label>
        <select className="w-full border border-gray-300 rounded-lg p-2">
          <option>Ongoing</option>
        </select>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-gray-700 mb-1">Note</label>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-2 h-20"
          placeholder="Add notes here"
        />
      </div>

      {/* Channel */}
      <div className="mb-6">
        <label className="block text-gray-700 mb-1">Channel</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg p-2"
          placeholder="Channel (e.g., Instagram)"
        />
      </div>

      {/* Feedback */}
      <div className="mb-6">
        <label className="block text-gray-700 mb-1">Feedback</label>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-2 h-20"
          placeholder="Feedback"
        />
      </div>

      {/* Optional Date */}
      <div className="mb-6">
        <label className="block text-gray-700 mb-1">(Optional)</label>
        <input
          type="datetime-local"
          className="w-full border border-gray-300 rounded-lg p-2"
        />
      </div>
    </div>
  );
};

export default CreateCampaign;
