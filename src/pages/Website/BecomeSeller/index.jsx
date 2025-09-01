import React from "react";
import BecomeSellerForm from "../../../components/Website/BecomeSellerForm";
import FAQs from "../../../components/Website/FAQs";
import BecomeSellerImage from "../../../../public/assets/banners/become-seller-image.png";
import { useState, useEffect } from "react";
import { getSettings } from "../../../services/api.settings";

export default function BecomeSeller() {
  const [settingsData, setSettingsData] = useState({});
  const [isImageLoaded, setIsImageLoaded] = useState(false);

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

  // Handle image load
  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  return (
    <main className="bg-white font-Lato space-y-20">
      <section className="relative w-full h-auto">
        {!isImageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <div className="w-16 h-16 border-4 border-t-4 border-gray-400 border-solid rounded-full animate-spin border-t-[#000000]"></div>
          </div>
        )}
        <img
          src={settingsData?.become_seller_banner}
          alt="Background"
          className={`w-full h-full ${
            isImageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={handleImageLoad}
          onError={() => setIsImageLoaded(true)} // Handle error case to avoid infinite loading
        />
      </section>
      <section className="px-4 md:px-20">
        <div>
          <div className="text-center mb-8">
            <h1
              className="text-2xl md:text-3xl lg:text-[48px] font-extralight text-[#000000] mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Why Sell On Ierada?
            </h1>
          </div>

          <div className="">
            <div className="space-y-8">
              <div>
                <p className="text-sm md:text-base lg:text-[24px] font-light text-[#000000] font-Lato tracking-wide leading-4 md:leading-6 lg:leading-8">
                  At Ierada, we constantly work towards a better, seamless
                  experience for our sellers. By joining us, you can reach every
                  doorstep in India. We want to make sure that your seller
                  journey is rewarding. That is why we will not charge you any
                  commission. With us, every small vendor or seller can get the
                  brand recognition they need without making huge investments.
                </p>
                <p className="text-sm md:text-base lg:text-[24px] font-light text-[#000000] font-Lato tracking-wide leading-4 md:leading-6 lg:leading-8 mt-4">
                  So, what are you still waiting for? Grow your business with
                  us!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="px-4 md:px-20">
        <div>
          <div className="text-center mb-8">
            <h1
              className="text-2xl md:text-3xl lg:text-[48px] font-extralight text-[#000000] mb-2 "
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Register With Us In 4 Easy Steps
            </h1>
          </div>

          <div className="">
            <div className="space-y-8">
              <div>
                <p className="text-sm md:text-base lg:text-[24px] font-light text-[#000000] font-Lato tracking-wide leading-4 md:leading-6 lg:leading-8">
                  Our seller registration process is very simple and
                  hassle-free. You can register with us as a vendor or a seller
                  by creating your seller account by going to our website. After
                  registering as a seller, you just have to sit tight and wait
                  for our approval, which hardly takes 2-3 days. As soon as you
                  get our approval, you can choose your preferred product
                  listing category and start listing your products. Once you are
                  done, you can start selling your products and generate revenue
                  from your orders.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="px-4 md:px-20">
        <img
          src={BecomeSellerImage}
          alt="become_seller_image"
          className="px-10"
        />
      </section>
      <section>
        <BecomeSellerForm />
      </section>
      <section>
        <FAQs />
      </section>
    </main>
  );
}
