import React from 'react';

const recommendations = [
  {
    image: './images/logo.png',
    text: 'Choose perfect product photo',
    date: 'May 19 at 5:00 pm',
  },
  {
    image: './images/g2520.png',
    text: 'Attend the meeting with sales team',
    date: 'May 24 at 6:00 pm',
  },
  {
    image: './images/Logo (1).png',
    text: 'Attend the meeting with sales team',
    date: 'May 24 at 6:00 pm',
  },
  {
    image: './images/Logo (2).png',
    text: 'Attend the meeting with sales team',
    date: 'May 24 at 6:00 pm',
  },
  {
    image: './images/Group (1).png',
    text: 'Attend the meeting with sales team',
    date: 'May 24 at 6:00 pm',
  },
];

function Recommendations() {
  return (
    <div className="mt-4">
      <h2 className="text-[25px] text-txtPage font-satoshi font-semibold mb-4 ">
        Recommendations
      </h2>
      <div className="bg-white px-6 py-8 rounded-lg shadow-md">
        <ul className="space-y-2">
          {recommendations.map((rec, index) => (
            <li key={index} className="flex items-center space-x-3">
              <div className="bg-gray-200 rounded-full p-2">
                {/* Display the image */}
                <img
                  src={rec.image}
                  alt="Recommendation Icon"
                  className="h-8 w-8  rounded-full"
                />
              </div>
              <div>
                <p className="text-[14px] font-satoshi font-semibold text-txtPage">
                  {rec.text}
                </p>
                <p className="text-[12px] font-satoshi font-medium text-tableheader -mt-2">
                  {rec.date}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Recommendations;
