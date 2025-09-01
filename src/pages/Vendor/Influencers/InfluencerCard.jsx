import React from 'react';
import { AiFillInstagram } from 'react-icons/ai';

const Card = ({ name, title, location, followers, image, bgImage }) => (
  <div
    className="p-4 text-center  bg-center flex items-center justify-center"
    style={{
      backgroundImage: `url(${bgImage})`,
      height: '300px',
      //   width: '350px',
    }} 
  >
    <div className="flex flex-col items-center  ">
      <img src={image} alt={name} className="w-20 h-20 rounded-full mb-4" />
      <h3 className="text-[16px] text-txtPage font-satoshi font-semibold">
        {name}
      </h3>
      <p className="text-[14px] text-txtPage font-satoshi font-normal">
        {title}
      </p>
      <p className="text-[14px] font-satoshi font-normal text-txtPage">
        {location}
      </p>
      <div className="flex items-center justify-center mt-2 text-gray-700">
        <AiFillInstagram className="text-[#202224]" />
        <span className="ml-1 text-[14px] font-satoshi font-bold text-[#202224]">
          {followers}
        </span>
      </div>
    </div>
  </div>
);

const InfluencerCard = () => {
  const influencers = [
    {
      name: 'Jason Price',
      title: 'Fashion Influencer',
      location: 'Germany',
      followers: '40M',
      image: './images/Avatar.png',
    },
    {
      name: 'Harriet King',
      title: 'Lifestyle Influencer',
      location: 'France',
      followers: '50M',
      image: 'https://via.placeholder.com/150',
    },

    {
      name: 'Harriet King',
      title: 'Lifestyle Influencer',
      location: 'France',
      followers: '50M',
      image: 'https://via.placeholder.com/150',
    },
    {
      name: 'Harriet King',
      title: 'Lifestyle Influencer',
      location: 'France',
      followers: '50M',
      image: 'https://via.placeholder.com/150',
    },
    {
      name: 'Harriet King',
      title: 'Lifestyle Influencer',
      location: 'France',
      followers: '50M',
      image: 'https://via.placeholder.com/150',
    },
    {
      name: 'Harriet King',
      title: 'Lifestyle Influencer',
      location: 'France',
      followers: '50M',
      image: 'https://via.placeholder.com/150',
    },
    {
      name: 'Harriet King',
      title: 'Lifestyle Influencer',
      location: 'France',
      followers: '50M',
      image: 'https://via.placeholder.com/150',
    },
    {
      name: 'Harriet King',
      title: 'Lifestyle Influencer',
      location: 'France',
      followers: '50M',
      image: 'https://via.placeholder.com/150',
    },
    {
      name: 'Harriet King',
      title: 'Lifestyle Influencer',
      location: 'France',
      followers: '50M',
      image: 'https://via.placeholder.com/150',
    },
    {
      name: 'Harriet King',
      title: 'Lifestyle Influencer',
      location: 'France',
      followers: '50M',
      image: 'https://via.placeholder.com/150',
    },
    {
      name: 'Harriet King',
      title: 'Lifestyle Influencer',
      location: 'France',
      followers: '50M',
      image: 'https://via.placeholder.com/150',
    },
    {
      name: 'Harriet King',
      title: 'Lifestyle Influencer',
      location: 'France',
      followers: '50M',
      image: 'https://via.placeholder.com/150',
    },
    {
      name: 'Harriet King',
      title: 'Lifestyle Influencer',
      location: 'France',
      followers: '50M',
      image: 'https://via.placeholder.com/150',
    },
    {
      name: 'Harriet King',
      title: 'Lifestyle Influencer',
      location: 'France',
      followers: '50M',
      image: 'https://via.placeholder.com/150',
    },
  ];

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto scrollbar-hide"
      style={{
        height: '80vh',
      }}
    >
      {influencers.map((influencer, index) => (
        <Card
          key={index}
          image={influencer.image}
          name={influencer.name}
          title={influencer.title}
          location={influencer.location}
          followers={influencer.followers}
          bgImage={'./images/Bg.png'}
        />
      ))}
    </div>
  );
};

export default InfluencerCard;
