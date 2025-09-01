// RecentMessages.js
import React from 'react';

const RecentMessages = () => {
  const messages = [
    {
      image: './images/Avatar.png',
      name: 'Rahul Joshi',
      message: 'Meeting scheduled',
      time: '2:32 pm',
      imgSrc: '/path/to/image1.jpg',
    },
    {
      image: './images/Avatar.png',
      name: 'Riya Roy',
      message: 'Update on marketing campaign',
      time: '2:32 pm',
      imgSrc: '/path/to/image2.jpg',
    },
    {
      image: './images/Avatar.png',
      name: 'John Vick',
      message: 'Sales boosted by 2x',
      time: '2:32 pm',
      imgSrc: '/path/to/image3.jpg',
    },
    {
      image: './images/Avatar.png',
      name: 'Indira Shri',
      message: 'Discussion for the product launch',
      time: '2:32 pm',
      imgSrc: '/path/to/image4.jpg',
    },
  ];

  return (
    <div className="mt-4">
      <h2 className="text-[25px] font-semibold text-txtPage font-satoshi mb-4">
        Recent Messages
      </h2>
      <div className="bg-white rounded-lg shadow-md p-4">
        <ul>
          {messages.map((msg, index) => (
            <li key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <img
                  src={msg.image}
                  alt={msg.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div className="flex items-center">
                  <p className="text-[14px] font-satoshi font-normal text-txtPage mr-3 ml-6">
                    {msg.name}
                  </p>
                  <p className="text-[12px] font-satoshi font-medium text-tableheader">
                    {msg.message}
                  </p>
                </div>
              </div>
              <span className="text-[12px] font-satoshi font-normal text-tableheader">
                {msg.time}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RecentMessages;


