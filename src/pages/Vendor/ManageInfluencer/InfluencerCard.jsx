import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import ProfileModal from './ProfileModal';

const InfluencerCard = ({ influencer, onAccept, onDecline, type }) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const renderStatus = () => {
    // For suggestion section
    if (type === 'suggestion') {
      return (
        <button 
          className="w-full text-white bg-black font-semibold px-4 py-2 rounded-lg"
          onClick={() => onAccept(influencer)}
        >
          Send Request
        </button>
      );
    }

    // For request section
    if (type === 'request') {
      // Check if the request was sent by the influencer
      if (influencer.sender === 'influencer' && influencer.status === 'requested') {
        return (
          <div className="flex space-x-4 w-full">
            <button 
              className="flex-1 bg-black text-white font-semibold px-4 py-2 rounded-lg"
              onClick={() => onAccept(influencer)}
            >
              Accept
            </button>
            <button 
              className="flex-1 border border-black text-black font-semibold px-4 py-2 rounded-lg"
              onClick={() => onDecline(influencer)}
            >
              Decline
            </button>
          </div>
        );
      } else {
        return (
          <div className="w-full text-center py-2 font-semibold">
            <span className={`
              ${influencer.status === 'requested' && 'text-yellow-600'}
              ${influencer.status === 'accepted' && 'text-green-600'}
              ${influencer.status === 'declined' && 'text-red-600'}
            `}>
              {influencer.status.charAt(0).toUpperCase() + influencer.status.slice(1)}
            </span>
          </div>
        );
      }
    }

    // Default case (for connected section)
    return null;
  };

  return (
    <>
      <div className="w-full max-w-xs mx-auto">
        <button
          onClick={() => setIsProfileModalOpen(true)}
          className="text-black font-semibold mb-2 text-sm flex items-center"
        >
          <Eye className="w-4 h-4 mr-1" />
          View Profile
        </button>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col items-center">
            <img
              src={influencer.avatar || '/api/placeholder/80/80'}
              alt={influencer.name}
              className="w-20 h-20 rounded-full mb-4"
            />
            <h3 className="text-lg font-semibold">{influencer.name}</h3>
            <p className="text-gray-600">Fashion Influencer</p>
            <p className="text-gray-600">{influencer.country}</p>
            <div className="flex items-center mt-2">
              <svg className="w-5 h-5 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="ml-1 font-bold">{influencer.followers}</span>
            </div>
          </div>
          
          <div className="mt-4">
            {renderStatus()}
          </div>
        </div>
      </div>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        influencer={influencer}
      />
    </>
  );
};

export default InfluencerCard;