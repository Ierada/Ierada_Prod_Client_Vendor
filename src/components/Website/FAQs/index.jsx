import React, { useState, useEffect } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { getAllFaqs } from "../../../services/api.faqs";

const FAQs = () => {
  const [openQuestion, setOpenQuestion] = useState(null);
  const [selectedType, setSelectedType] = useState("General");
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  const types = [
    { label: "General Information", value: "General" },
    { label: "Ordering & Shipping", value: "Ordering" },
    { label: "Returns & Exchanges", value: "Returns" },
  ];

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        const response = await getAllFaqs();
        if (response.status === 1) {
          setFaqs(response.data);
        }
      } catch (error) {
        console.error("Error fetching FAQs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  const filteredFaqs = faqs.filter((faq) => faq.type === selectedType);

  return (
    <div>
      <div className="my-10">
        <h1 className="text-2xl text-center font-semibold mb-2 text-[#000000] text-[36px] font-Playfair">
          FAQs
        </h1>
        <h4 className="font-Lato font-medium text-[#000000] text-[18px] text-center">
          Home / FAQs
        </h4>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 px-4 lg:px-16 py-8">
        <div className="w-full lg:w-1/4 bg-black text-white">
          <ul className="space-y-4 p-4">
            {types.map((type, index) => (
              <li
                key={index}
                className={`cursor-pointer p-2 rounded-md ${
                  selectedType === type.value ? "text-gray-400" : ""
                }`}
                onClick={() => setSelectedType(type.value)}
              >
                {type.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full lg:w-3/4">
          <div className="space-y-4">
            {loading ? (
              <p className="text-center text-gray-500">Loading FAQs...</p>
            ) : filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div key={index} className="space-y-2">
                  <button
                    onClick={() => toggleQuestion(index)}
                    className="border border-[#EAEAEA] w-full text-left focus:bg-gray focus:text-white focus:outline-none"
                  >
                    <div
                      className={`${
                        openQuestion === index ? "bg-black" : "bg-white"
                      } flex justify-between items-center p-4 transition-colors`}
                    >
                      <span
                        className={`font-medium font-Lato text-[20px] ${
                          openQuestion === index
                            ? "text-white"
                            : "text-[#000000]"
                        }`}
                      >
                        {faq.question}
                      </span>
                      <span>
                        {openQuestion === index ? (
                          <IoIosArrowUp />
                        ) : (
                          <IoIosArrowDown />
                        )}
                      </span>
                    </div>
                  </button>
                  {openQuestion === index && (
                    <div className="p-4 border border-[#EAEAEA] bg-[#56594E40] text-[black]">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">
                No FAQs available for this category.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQs;
