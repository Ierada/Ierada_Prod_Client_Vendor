import React from "react";
import image from "../../../../public/assets/aboutUs/image_1.png";
import image2 from "../../../../public/assets/aboutUs/image_2.png";
import Vector from "../../../../public/assets/aboutUs/Vector 21.png";

import AboutUsBg from "/assets/banners/about-us-top-banner.jpg";

import TestimonialSlider from "../../../components/Website/TestimonialSlider";
import EmailSubscribe from "../../../components/Website/EmailSubscribe";
import Slider1 from "/assets/aboutUs/Slider1.png";
import Slider2 from "/assets/aboutUs/Slider2.png";
import Slider3 from "/assets/aboutUs/Slider3.png";
import { useState } from "react";
import { getSettings } from "../../../services/api.settings";
import { useEffect } from "react";

export default function AboutUs() {
  const [settingsData, setSettingsData] = useState({});

  const fetchSettings = async () => {
    try {
      const response = await getSettings();
      if (response.status === 1) {
        setSettingsData(response.data);
      }
    } catch (error) {
      notifyOnFail("Error fetching settings");
    }
  };

  // fetch settings data
  useEffect(() => {
    fetchSettings();
  }, []);

  const Product = [
    {
      id: 1,
      name: "Radhika Khemani",
      images: Slider1,

      description:
        "Nostrud aute id elit proident veniam ex. Elit enim laborum enim velit laborum anim.",
    },
    {
      id: 2,
      name: "Kriti Desai",
      images: Slider2,

      description:
        "Nostrud aute id elit proident veniam ex. Elit enim laborum enim velit laborum anim.",
    },
    {
      id: 3,
      name: "Sumita Nagar",
      images: Slider3,
      description:
        "Nostrud aute id elit proident veniam ex. Elit enim laborum enim velit laborum anim.",
    },
  ];

  return (
    <main className="bg-white font-Lato space-y-24">
      <section className="relative w-full h-[200px] sm:h-[300px] md:h-[500px] lg:h-[700px]">
        <img
          src={settingsData?.about_us_banner || AboutUsBg}
          alt="Background"
          className="w-full h-full"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0000004D] px-4 md:px-80">
          <h1
            className="text-white text-lg sm:text-xl md:text-2xl lg:text-4xl font-normal text-center md:px-4 md:mb-10"
            style={{
              fontFamily: '"Playfair Display", serif',
            }}
          >
            Story Behind Ierada
          </h1>
          <p className="font-Lato font-normal text-white text-xs sm:text-lg md:text-xl text-center">
            Our journey began with a passion to bring the finest handcrafted
            clothing from across India to your wardrobe.
          </p>
          <p className="font-Lato font-normal text-white text-xs sm:text-lg md:text-xl text-center">
            At Ierada, we bring you the finest handcrafted clothing from skilled
            artisans across India, reflecting the beauty and tradition of our
            culture.
          </p>
        </div>
      </section>
      {/* 2nd section */}
      <section className="px-4 md:px-20">
        <div className="">
          <div className="text-center mb-8">
            <h1
              className="text-2xl md:text-3xl lg:text-[48px] font-extralight text-[#000000] mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Our Story
            </h1>
          </div>

          <div className="">
            <div className="space-y-8">
              <div>
                <p className="text-sm md:text-base lg:text-[24px] font-light text-[#000000] font-Lato tracking-wide  leading-4 md:leading-6 lg:leading-8 ">
                  Our Story At Ierada, our journey began with a shared passion
                  for Indian ethnic wear and a desire to connect people with the
                  rich cultural heritage of India. What started as a small
                  initiative has grown into a vibrant marketplace that brings
                  together the finest ethnic clothing from artisans and vendors
                  across the country. Sed ultricies, lectus a scelerisque
                  vehicula, erat dui consequat augue, ut vehicula nunc felis sit
                  amet urna.Lorem ipsum dolor sit amet, consectetur adipiscing
                  elit. Sed ultricies, lectus a scelerisque vehicula, erat dui
                  consequat augue, ut vehicula nunc felis sit amet urna.Lorem
                  ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  ultricies, lectus a scelerisque vehicula, erat dui consequat
                  augue, ut vehicula nunc felis sit amet urna.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* 3rd section */}
      <section className="px-4 md:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-11 items-start">
          <div className="space-y-4 md:space-y-6 col-span-1 md:col-span-2">
            <h1
              className="text-2xl md:text-4xl lg:text-[48px] font-extralight text-[#000000] mb-6 lg:mb-2 text-center  "
              style={{ fontFamily: "'Playfair', serif" }}
            >
              Our Vision
            </h1>

            <div>
              <p className="text-[#000000] text-sm md:text-base lg:text-[24px] font-light font-Lato tracking-wide  leading-4 md:leading-6 lg:leading-8  ">
                At Ieradaa, our vision is to become the leading online
                destination for Indian ethnic wear, offering a platform where
                artisans and vendors can showcase their craftsmanship and where
                customers can find authentic, high-quality clothing that
                reflects the diversity and beauty of India.
              </p>
            </div>
          </div>

          <div className="relative col-span-1 md:col-span-3 -mt-4">
            <div className="pl-0 md:pl-10 lg:pl-10 flex justify-center md:justify-start">
              <img src={image} className="w-[650px] h-[408px]" />
            </div>
          </div>
        </div>
      </section>
      {/* Second Section */}
      <section className="px-4 md:px-20">
        <div className="text-center mb-8">
          <h1
            className="text-2xl md:text-3xl lg:text-[48px] font-extralight text-[#000000] mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Our Mission
          </h1>
        </div>

        <div className="">
          <div className="space-y-8">
            <div>
              <p className="text-sm md:text-base lg:text-[24px] text-[#000000] font-Lato font-light  tracking-wide  leading-4 md:leading-6 lg:leading-8">
                Our Mission At Ierada, we are committed to supporting our
                vendors and artisans, ensuring that they receive fair
                compensation for their work. We believe in sustainable practices
                and are dedicated to preserving the rich traditions of Indian
                ethnic wear for future generations.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* 5th section */}
      <section className="px-4 md:px-20">
        <div className="flex flex-col lg:flex-row items-center lg:items-center lg:justify-between">
          {/* Image Section */}
          <div className="w-full lg:w-1/2 mb-8 lg:mb-0">
            <div className="grid grid-cols-1 gap-4">
              <img
                src={image2}
                alt="Designer Spotlights"
                className="w-full h-auto lg:h-[500px] xl:h-[769px] object-cover"
              />
            </div>
          </div>

          {/* Text Section */}
          <div className="w-full lg:w-1/2 space-y-6 mt-8 lg:mt-0 lg:pl-8">
            <div className="relative">
              <img
                src={Vector}
                alt="Commitment Background"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[48px] font-medium text-[#000000] mb-4 font-Playfair">
                  Our Commitment
                </h1>
                <p className="text-[#000000] text-sm sm:text-base md:text-lg lg:text-[24px] font-light mt-4 lg:mt-10 font-Lato max-w-full md:max-w-2xl lg:max-w-3xl">
                  For every order you place with us, a girl student gets the
                  chance to continue her education, thanks to our partnership
                  with various NGOs and non-profit organizations. Together,
                  we’re committed to making a difference, one purchase at a
                  time. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Sed ultricies, lectus a scelerisque vehicula, erat dui
                  consequat augue, ut vehicula nunc felis sit amet urna.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-20">
        <div className="text-center mb-8">
          <h1
            className="text-2xl md:text-3xl lg:text-[48px] font-extralight text-[#000000] mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Join Us
          </h1>
        </div>

        <div className="">
          <div className="space-y-8">
            <div>
              <p className="text-sm md:text-base lg:text-[24px] font-light text-[#000000] font-Lato  tracking-wide  leading-4 md:leading-6 lg:leading-8">
                Join us on an inspiring journey to explore the rich tapestry of
                Indian culture, where every garment tells a story of tradition,
                craftsmanship, and artistry. At Ierada, we bring you a curated
                collection of beautiful ethnic clothing that reflects the
                vibrant heritage of India. Whether you're looking to embrace the
                elegance of a traditional saree, the intricate patterns of a
                handwoven kurta, or the timeless appeal of a classic lehenga,
                our collection offers something unique for every occasion.
                Discover, shop, and celebrate India’s ethnic essence with
                Ierada, where each piece connects you to the heart of our
                cultural legacy.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* 6th section */}
      <section className="px-4 md:px-20">
        <div className="text-center text-[#000000]">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-Playfair relative inline-block font-medium">
            <span className="font-Playfair font-semibold">
              Over 5000+ people trust us
            </span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl my-4 sm:my-6 lg:my-8 px-2 sm:px-8 lg:px-20 xl:px-52">
            Till date we have successfully made 5000+ people happy with our
            successful order deliveries. Hear what they have to say, and indulge
            in the Ierada experience!
          </p>
        </div>
        <div className="space-y-8 sm:space-y-12 lg:space-y-14">
          <TestimonialSlider testimonials={Product} />
        </div>
      </section>

      {/* 8th section */}
      <section>
        <EmailSubscribe />
      </section>
    </main>
  );
}
