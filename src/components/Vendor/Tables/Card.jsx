import React from 'react';

const Cards = ({ image, name, sold }) => (
  <div className="max-w-md w-40  rounded overflow-hidden shadow-lg bg-white p-4 s flex flex-col items-center text-center">
    <img
      className="w-[109px] h-[109px] object-cover rounded-full mb-4"
      src={image}
      alt={`${name}'s avatar`}
    />
    <div className="px-4 py-2">
      <div className="text-[14px] font-satoshi font-bold text-txtPage mb-2">
        {name}
      </div>
      <button className="text-[16px] text-white border bg-black py-1 px-4 rounded-lg">
        <span className="text-white text-[16px] mr-1">Sold:</span>
        {sold}
      </button>
    </div>
  </div>
);

const Card = () => {
  const cards = [
    {
      image: './images/Avatar.png',
      name: 'Rahul Joshi',
      sold: 28,
    },
    {
      image: './images/Avatar.png',
      name: 'Riya Roy',
      sold: 32,
    },
    {
      image: './images/Avatar.png',
      name: 'John Vick',
      sold: 28,
    },
    {
      image: './images/Avatar.png',
      name: 'Indira Shri',
      sold: 32,
    },
    {
      image: './images/Avatar.png',
      name: 'Indira Shri',
      sold: 32,
    },
  ];

  return (
    <div>
      <h2 className="text-[25px] font-semibold text-txtPage font-satoshi mb-4">
        Who's Boosting Your Brand?
      </h2>
      <div className="flex flex-wrap justify-center items-center p-4 bg-gray-100 space-x-8 space-y-4">
        {cards.map((card, index) => (
          <Cards
            key={index}
            image={card.image}
            name={card.name}
            sold={card.sold}
          />
        ))}
      </div>
    </div>
  );
};

export default Card;
