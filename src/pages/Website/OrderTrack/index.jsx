import React from 'react';
import { FaArrowLeft, FaArrowRight, FaInfoCircle } from 'react-icons/fa';
import ProductSlider from '../../../components/Website/ProductSlider';
import { useNavigate } from 'react-router-dom';
import config from '../../../config/config';

const OrderTrack = () => {

  const navigate = useNavigate();
  
  const relatedProducts = [
    {
      id: 1,
      image: "Images1",
      name: 'Print Pearl & Anarkali Set With Dupatta',
      designer: 'DIVYA UNNI',
      price: '₹16,500',
    },
    {
      id: 2,
      image: "Images2",
      name: 'Multi Color Silk Printed Raj Darbar Royal Kurta Set',
      designer: 'ARUN KUMAR',
      price: '₹16,500',
    },
    {
      id: 3,
      image: "Images3",
      name: 'Chiffon Printed Sequin Chintz Pre-Draped Ruffle Saree Set',
      designer: 'ANISHA NAIR',
      price: '₹16,500',
    },
  ];

  const trackOrderData = {
    heading: 'Track Your Order',
    description:
      'To track your order please enter your order ID in the input field below and press the “Track Order” button. this was given to you on your receipt and in the confirmation email you should have received.',
    backButton: {
      ariaLabel: 'Go back to previous page',
    },
    form: {
      fields: [
        {
          id: 'orderId',
          label: 'Order ID',
          type: 'text',
          placeholder: 'Enter your order ID',
        },
        {
          id: 'email',
          label: 'Email Address',
          type: 'email',
          placeholder: 'Enter your email address',
        },
      ],
      info: {
        text: 'Order ID that we sended to your in your email address.',
      },
    },
  };

  const handleTrackOrder = async(orderId = 1) => {
    navigate(`${config.VITE_BASE_WEBSITE_URL}/track-order/${orderId}`);
  }

  return (
    <main>
      <section>
        <div className="flex flex-col min-h-screen px-4 py-8 bg-white">
          <div className="w-full max-w-[900px] lg:ml-20  md:w-1/2">
            <div className="mb-4">
              <button
                className="text-gray-500 hover:text-gray-700"
                aria-label={trackOrderData.backButton.ariaLabel}
              >
                <FaArrowLeft className="text-lg" />
              </button>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2 text-center sm:text-left">
              {trackOrderData.heading}
            </h1>
            <p className="text-[#5F6C72] mb-6 text-sm md:text-base text-center sm:text-left">
              {trackOrderData.description}
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {trackOrderData.form.fields.map((field, index) => (
                <div key={index}>
                  <label
                    className="block text-sm font-medium text-[#191C1F]"
                    htmlFor={field.id}
                  >
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    id={field.id}
                    placeholder={field.placeholder}
                    className="mt-1 block w-full p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center text-gray-500 text-sm mt-4 justify-center sm:justify-start">
              <FaInfoCircle className="mr-2" />
              <span>{trackOrderData.form.info.text}</span>
            </div>
            <button
              onClick={() => handleTrackOrder()}
              className={`mt-6 w-full md:w-auto bg-black text-white flex items-center justify-center px-6 py-2 transition-colors`}
            >
              Track Order
              <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="px-4 sm:px-8 lg:px-16 py-8">
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-serif mb-8 text-[#000000]"
            style={{ fontFamily: "'Italiana', serif" }}
          >
            More from Ritu Kumar
          </h2>

          <ProductSlider products={relatedProducts} />
        </div>
      </section>
    </main>
  );
};

export default OrderTrack;
