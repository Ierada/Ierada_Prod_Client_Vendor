import React from 'react';

const Subcriptions = () => {
  const plans = [
    {
      name: 'Basic',
      price: '₹14.99',
      features: [
        'Free Setup',
        'Bandwidth Limit 10 GB',
        '20 User Connection',
        'Analytics Report',
        'Public API Access',
        'Plugins Integration',
        'Custom Content Management',
      ],
    },
    {
      name: 'Standard',
      price: '₹49.99',
      features: [
        'Free Setup',
        'Bandwidth Limit 10 GB',
        '20 User Connection',
        'Analytics Report',
        'Public API Access',
        'Plugins Integration',
        'Custom Content Management',
      ],
      recommended: true,
    },
    {
      name: 'Premium',
      price: '₹89.99',
      features: [
        'Free Setup',
        'Bandwidth Limit 10 GB',
        '20 User Connection',
        'Analytics Report',
        'Public API Access',
        'Plugins Integration',
        'Custom Content Management',
      ],
    },
  ];

  return (
    <div className=" min-h-screen ">
      <h1 className="text-[35px] font-semibold text-txtPage font-satoshi mb-6">
        Subscription
      </h1>
      <p className="text-[#202224]  font-satoshi text-[28px] font-semibold mb-8">
        Pricing
      </p>

      {/* Pricing Cards Container */}
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan, index) => (
          // <div
          //   key={index}
          //   className={`w-[450px] bg-cover bg-center bg-no-repeat p-6  text-center

          //   }`}
          //   style={{ backgroundImage: 'url("/images/Bg (2).png' }}
          // >
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-lg text-center "
          >
            <h2 className="text-[#202224] font-medium text-[28px] ">
              {plan.name}
            </h2>
            <p className="text-[12px] text-[#202224] font-satoshi font-normal mb-2">
              Monthly Charge
            </p>
            <p className="text-[42px] font-extrabold text-[#5897F7] mb-4">
              {plan.price}
            </p>

            <ul className="text-gray-600 mb-6 space-y-2 border-y-2 border-tableheader py-4">
              {plan.features.map((feature, i) => (
                <li
                  key={i}
                  className={`${
                    i > 4
                      ? 'text-gray-600 font-normal text-[14px]'
                      : ' text-[#212121] font-satoshi text-[16px]'
                  }`}
                >
                  {feature}
                </li>
              ))}
            </ul>

            <button className="bg-white text-black px-6 py-2 rounded-full font-medium text-[16px]  border border-black focus:bg-black focus:text-white">
              Get Started
            </button>
            <p className="text-[16px] text-[#212121] font-satoshi font-bold  mt-2  ">
              Start Your 30 Day Free Trial
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subcriptions;
