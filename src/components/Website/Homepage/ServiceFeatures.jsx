import React from "react";
import { FaShippingFast, FaHeadset } from "react-icons/fa";
import { GoCreditCard } from "react-icons/go";
import { LiaRupeeSignSolid } from "react-icons/lia";

const ServiceFeatures = () => {
  const features = [
    {
      icon: <FaShippingFast />,
      title: "Free Shipping & Returns",
      description: "For all orders over ₹999.00",
    },
    {
      icon: <GoCreditCard />,
      title: "Secure Payment",
      description: "We ensure secure payment",
    },
    {
      icon: <LiaRupeeSignSolid />,
      title: "Price Match Guarantee",
      description: "Get best price",
    },
    {
      icon: <FaHeadset />,
      title: "24/7 Customer Support",
      description: "Friendly customer support",
    },
  ];

  return (
    <section className="flex flex-wrap justify-between gap-8 text-[black] px-4 md:px-8 lg:px-16">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center space-x-4 max-w-xs">
          <div className="w-16 h-16 p-4 text-gray-700 bg-white rounded-full flex items-center justify-center">
            {feature.icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{feature.title}</h3>
            <p className="text-sm text-gray-500">{feature.description}</p>
          </div>
        </div>
      ))}
    </section>
  );
};

export default ServiceFeatures;
