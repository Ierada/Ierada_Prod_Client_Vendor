import React from "react";
import CommonTopBanner from "../../../components/Website/CommonTopBanner";
import FAQs from "../../../components/Website/FAQs";
import common_top_banner from "/assets/banners/Commen-top-banner.png";

const bannerData = [
  {
    id: 1,

    image: common_top_banner,
  },
];

export default function FAQsPage() {
  return (
    <main>
      <section className="h-[300px]">
        <CommonTopBanner bannerData={bannerData} />
      </section>
      <section>
        <FAQs />
      </section>
    </main>
  );
}
