import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { FaArrowRight } from "react-icons/fa6";
import ProductSlider from "../../../components/Website/ProductSlider";
import { MdOutlineDashboard } from "react-icons/md";
import config from "../../../config/config";
import { getOrderByOrderNumber } from "../../../services/api.order";
import CommonTopBanner from "../../../components/Website/CommonTopBanner";
import common_top_banner from "/assets/banners/Commen-top-banner.png";

const bannerData = [
  {
    id: 1,
    image: common_top_banner,
  },
];

const OrderSuccessful = () => {
  const { order_number } = useParams();

  const [orderData, setOrderData] = useState({
    orderId: "7A8N339",
    email: "email@gmail.com",
    messages: {
      success: "Successful",

      orderId: "Your order Number:",
      email: "Your Registered Email ID:",
    },
    buttons: [
      {
        text: "Go to Home",
        link: `${config.VITE_BASE_WEBSITE_URL}/`,
        style:
          "border-2 border-[#6B1F4057] text-black hover:bg-black hover:text-white",
        icon: <MdOutlineDashboard className="mr-2" />,
      },
      {
        text: "View Order",
        link: `${config.VITE_BASE_WEBSITE_URL}/order`,
        style: "bg-black text-white hover:bg-black",
        icon: <FaArrowRight className="ml-2" />,
      },
    ],
  });

  // useEffect(() => {
  //   const fetchOrders = async () => {
  //     // const res = await getOrderByOrderNumber(order_number);

  //     setOrderData((prev) => ({
  //       ...prev,
  //       orderId: res.data.order_number,
  //       email: res.data.email,
  //     }));
  //   };
  //   fetchOrders();
  // }, [order_number]);

  // const relatedProducts = [
  //   {
  //     id: 1,
  //     images: ["Images1"],
  //     name: "Print Pearl & Anarkali Set With Dupatta",
  //     designer: "DIVYA UNNI",
  //     price: "₹16,500",
  //   },
  //   {
  //     id: 2,
  //     images: ["Images2"],
  //     name: "Multi Color Silk Printed Raj Darbar Royal Kurta Set",
  //     designer: "ARUN KUMAR",
  //     price: "₹16,500",
  //   },
  //   {
  //     id: 3,
  //     images: ["Images3"],
  //     name: "Chiffon Printed Sequin Chintz Pre-Draped Ruffle Saree Set",
  //     designer: "ANISHA NAIR",
  //     price: "₹16,500",
  //   },
  // ];

  return (
    <main>
      {/* <section>
        <CommonTopBanner bannerData={bannerData} />
      </section> */}
      <section>
        <div className="flex flex-col items-center justify-center lg:p-20 p-4   bg-white border-black md:max-w-3xl mx-auto">
          <AiOutlineCheckCircle className="text-green-500 text-6xl  " />
          <h2 className="text-2xl font-medium text-center md:text-2xl text-[#191C1F] my-5">
            {orderData.messages.success}
          </h2>
          <p className="text-sm font-Lato text-[#475156] text-center ">
            You have successfully registered in our website and start working in
            it.
          </p>
          {/* <p className="text-center mt-2 text-[#5F6C72] text-sm font-normal">
            {orderData.messages.orderId}{" "}
            <strong className="text-[#191C1F]">{orderData.orderId}</strong>
          </p> */}
          {/* <p className="text-center text-[#5F6C72] text-sm font-normal">
            {orderData.messages.email}{" "}
            <strong className="text-[#191C1F]">{orderData.email}</strong>
          </p> */}
          {/* <div className="flex flex-col md:flex-row gap-4 mt-6">
            {orderData.buttons.map((button, index) => (
              <Link
                key={index}
                to={button.link}
                className={`flex items-center justify-center px-6 py-2 font-bold text-sm transition-colors ${button.style}`}
              >
                {index === 0 && button.icon}
                {button.text}
                {index === 1 && button.icon}
              </Link>
            ))}
          </div> */}
        </div>
      </section>
      {/* <section>
        <div className="px-4 sm:px-8 lg:px-16 py-8">
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-serif mb-8 text-[#000000]"
            style={{ fontFamily: "'Italiana', serif" }}
          >
            More from Ritu Kumar
          </h2>

          <ProductSlider products={relatedProducts} />
        </div>
      </section> */}
    </main>
  );
};

export default OrderSuccessful;
