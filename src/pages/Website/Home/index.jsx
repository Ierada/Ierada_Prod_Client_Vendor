import React, { useEffect, useState } from "react";
import { getHomePageData } from "../../../services/api.homepage";
import { getUserIdentifier } from "../../../utils/userIdentifier";
import HeroSlider from "../../../components/Website/Homepage/HeroSlider";
import ProductCollection from "../../../components/Website/Homepage/ProductCollection";
import CategoryCollection from "../../../components/Website/Homepage/CategoryCollection";
import Banner from "../../../components/Website/Homepage/Banner";
import VideoSection from "../../../components/Website/Homepage/VideoSection";
import {
  PopularProductsSlider,
  ProductCollectionSlider,
  FeaturedCollectionSlider,
  OfferProductCollection,
  OfferSlider,
} from "../../../components/Website/Homepage/ProductSliders";
import TrendingSection from "../../../components/Website/Homepage/TrendingSection";
import SubcategoryGrid from "../../../components/Website/Homepage/SubcategoryGrid";
import ServiceFeatures from "../../../components/Website/Homepage/ServiceFeatures";
import DownloadApp from "../../../components/Website/Homepage/DownloadApp";
import BrandLogos from "../../../components/Website/Homepage/BrandLogos";
import AllProductsSection from "../../../components/Website/Homepage/AllProductsSection";
import SubCategoryCollection from "../../../components/Website/Homepage/SubCategoryCollection";
import DynamicBanner from "../../../components/Website/Homepage/DynamicBanner";
import CategoryGrid from "../../../components/Website/Homepage/CategoriesGridSection";
import RecentlyViewed from "../../../components/Website/Homepage/RecentlyViewedSection";
import DealOfTheDay from "../../../components/Website/Homepage/DealOfTheDay";
import SeoContent from "../../../components/Website/Homepage/SEOContent";

const Home = () => {
  const [sections, setSections] = useState([]);

  const fetchData = async () => {
    try {
      const userId = getUserIdentifier();
      const response = await getHomePageData(userId);
      if (response.status === 1) {
        setSections(response.data);
      }
    } catch (error) {
      console.error("Error fetching homepage data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderSection = (section) => {
    switch (section.type) {
      case "slider":
        return <HeroSlider key={section.id} data={section} />;
      case "product_collection":
        return <ProductCollectionSlider key={section.id} data={section} />;
      case "category_collection":
        return <CategoryCollection key={section.id} data={section} />;
      case "subcategory_collection":
        return <SubCategoryCollection key={section.id} data={section} />;
      case "banner":
        return <Banner key={section.id} data={section} />;
      case "video":
        return <VideoSection key={section.id} data={section} />;
      case "featured_products":
        return <FeaturedCollectionSlider key={section.id} data={section} />;
      case "offer_slider":
        return <OfferSlider key={section.id} data={section} />;
      case "offer_collection":
        return <OfferProductCollection key={section.id} data={section} />;
      case "trending_products":
        return <TrendingSection key={section.id} data={section} />;
      case "subcategory_grid":
        return <SubcategoryGrid key={section.id} data={section.items} />;
      case "service_features":
        return <ServiceFeatures key={section.id} />;
      case "download_app":
        return <DownloadApp key={section.id} />;
      case "brand_logos":
        return <BrandLogos key={section.id} items={section.items} />;
      case "all_products":
        return <AllProductsSection key={section.id} />;
      case "dynamicbanner":
        return <DynamicBanner key={section.id} data={section} />;
      case "recently_viewed":
        return <RecentlyViewed key={section.id} data={section} />;
      case "category_grid":
        return <CategoryGrid key={section.id} data={section} />;
      case "deal_of_the_day":
        return <DealOfTheDay key={section.id} data={section} />;
      case "personalized_products":
        return <PopularProductsSlider key={section.id} data={section} />;
      case "seo_content":
        return <SeoContent key={section.id} data={section} />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-[#FFFFFF] space-y-3 sm:space-y-5 md:space-y-10 text-[black] mb-10">
      {sections?.map((section) => renderSection(section))}
    </main>
  );
};

export default Home;
