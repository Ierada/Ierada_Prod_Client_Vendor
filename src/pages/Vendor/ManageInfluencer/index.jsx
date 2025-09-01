import React, { useState, useEffect } from 'react';
import InfluencerCard from './InfluencerCard';
import {
  responseToInfluencerRequest,
  getAllInfluencerByDesignerId,
  makeInfluencerRequest,
} from '../../../services/api.influencer';
import { useAppContext } from '../../../context/AppContext';

const ManageInfluencer = () => {
  const [activeSection, setActiveSection] = useState('connected');
  const [suggestions, setSuggestions] = useState([]);
  const [requests, setRequests] = useState({
    requested: [],
    accepted: [],
    declined: []
  });
  const [connected, setConnected] = useState([]);
  const { user } = useAppContext();

  const getInfluencers = async () => {
    const res = await getAllInfluencerByDesignerId(user.id);      
    setSuggestions(res.data.suggestions);    
    
    const requestData = res.data.requests;
    setRequests({
      requested: requestData.requestedInfluencers,
      accepted: requestData.acceptedInfluencers,
      declined: requestData.declinedInfluencers
    });
    
    setConnected(res.data.connected);
  };

  useEffect(() => {
    user.id && getInfluencers();
  }, [user.id]);

  const handleSendRequest = async influencer => {
    try {
      await makeInfluencerRequest(user.id, influencer.id, user.role);
      getInfluencers();
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const handleAccept = async influencer => {
    try {
      await responseToInfluencerRequest(user.id, influencer.id, 'accepted');
      getInfluencers();
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDecline = async influencer => {
    try {
      await responseToInfluencerRequest(user.id, influencer.id, 'declined');
      getInfluencers();
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  const [requestSubTab, setRequestSubTab] = useState('requested');

  return (
    <div className='w-full px-4 py-6'>
      <h1 className='text-2xl font-semibold mb-6'>Manage Influencers</h1>

      <div className='flex justify-around mb-6 border-b'>
        <button
          onClick={() => setActiveSection('connected')}
          className={`w-full py-2 text-lg font-medium transition-colors
            ${
              activeSection === 'connected'
                ? 'text-black border-b-2 border-black'
                : 'text-gray-400'
            }`}
        >
          Connected
        </button>
        <button
          onClick={() => setActiveSection('suggestion')}
          className={`w-full py-2 text-lg font-medium transition-colors
            ${
              activeSection === 'suggestion'
                ? 'text-black border-b-2 border-black'
                : 'text-gray-400'
            }`}
        >
          Suggestions
        </button>
        <button
          onClick={() => setActiveSection('request')}
          className={`w-full py-2 text-lg font-medium transition-colors
            ${
              activeSection === 'request'
                ? 'text-black border-b-2 border-black'
                : 'text-gray-400'
            }`}
        >
          Requests
        </button>
      </div>

      {/* Request Sub-Tabs */}
      {activeSection === 'request' && (
        <div className='flex justify-around mb-6 border-b'>
          <button
            onClick={() => setRequestSubTab('requested')}
            className={`w-full py-2 text-lg font-medium transition-colors
              ${
                requestSubTab === 'requested'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-400'
              }`}
          >
            Requests
          </button>
          <button
            onClick={() => setRequestSubTab('accepted')}
            className={`w-full py-2 text-lg font-medium transition-colors
              ${
                requestSubTab === 'accepted'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-400'
              }`}
          >
            Accepted
          </button>
          <button
            onClick={() => setRequestSubTab('declined')}
            className={`w-full py-2 text-lg font-medium transition-colors
              ${
                requestSubTab === 'declined'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-400'
              }`}
          >
            Declined
          </button>
        </div>
      )}

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {activeSection === 'suggestion' &&
          suggestions.map(influencer => (
            <InfluencerCard
              key={influencer.id}
              influencer={influencer}
              onAccept={handleSendRequest}
              type='suggestion'
            />
        ))}

        {activeSection === 'request' && requestSubTab === 'requested' &&
          requests.requested.map(influencer => (
            <InfluencerCard
              key={influencer.id}
              influencer={influencer}
              onAccept={handleAccept}
              onDecline={handleDecline}
              type='request'
            />
        ))}

        {activeSection === 'request' && requestSubTab === 'accepted' &&
          requests.accepted.map(influencer => (
            <InfluencerCard
              key={influencer.id}
              influencer={influencer}
              onAccept={handleAccept}
              onDecline={handleDecline}
              type='request'
            />
        ))}

        {activeSection === 'request' && requestSubTab === 'declined' &&
          requests.declined.map(influencer => (
            <InfluencerCard
              key={influencer.id}
              influencer={influencer}
              onAccept={handleAccept}
              onDecline={handleDecline}
              type='request'
            />
        ))}

        {activeSection === 'connected' &&
          connected.map(influencer => (
            <InfluencerCard
              key={influencer.id}
              influencer={influencer}
              type='connected'
            />
        ))}
      </div>
    </div>
  );
};

export default ManageInfluencer;