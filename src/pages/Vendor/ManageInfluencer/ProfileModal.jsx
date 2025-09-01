import React from 'react';
import { X } from 'lucide-react';

const ProfileModal = ({ isOpen, onClose, influencer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[black] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Influencer Profile</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={24} />
          </button>
        </div>
        
        <div className="text-center">
          <img
            src={influencer.avatar || '/api/placeholder/100/100'}
            alt={influencer.name}
            className="w-24 h-24 rounded-full mx-auto mb-4"
          />
          <h3 className="text-lg font-semibold">{influencer.name}</h3>
          <p className="text-gray-600">{influencer.title}</p>
          <p className="text-gray-600">{influencer.country}</p>
          <p className="text-gray-800 mt-2">Followers: {influencer.followers}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;