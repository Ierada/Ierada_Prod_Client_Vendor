import fs from "fs";
import path from "path";
import config from "./src/config/config.js";
import { getAllProducts } from "./src/services/api.product.js";
import { getAllBlogs } from "./src/services/api.blogs.js";
import { getAllPages } from "./src/services/api.page.js";
import {
  getCategories,
  getInnerSubCategories,
  getSubCategories,
} from "./src/services/api.category.js";
import { getAllFabrics } from "./src/services/api.fabric.js";
import { getAllOffers } from "./src/services/api.offers.js";

// Function to generate sitemap
async function generateSitemap() {
  const baseUrl = "https://ierada.com";
  const sitemapPath = path.join(process.cwd(), "public", "sitemap.xml");
  const date = new Date().toISOString().split("T")[0];

  // Static routes from ProjectRoutes
  const staticRoutes = [
    { url: "/", changefreq: "daily", priority: "1.0" },
    { url: "/about", changefreq: "monthly", priority: "0.8" },
    { url: "/contact-us", changefreq: "monthly", priority: "0.8" },
    { url: "/faq", changefreq: "monthly", priority: "0.7" },
    { url: "/become-seller", changefreq: "monthly", priority: "0.7" },
    { url: "/blogs", changefreq: "weekly", priority: "0.8" },
    { url: "/account-deletion", changefreq: "monthly", priority: "0.6" },
  ];

  // Initialize sitemap URLs
  let urls = [...staticRoutes];

  // Fetch dynamic collection routes
  try {
    // Fetch all categories
    const categoriesData = await getCategories();
    if (categoriesData?.status === 1 && categoriesData?.data?.length > 0) {
      urls = urls.concat(
        categoriesData.data?.map((category) => ({
          url: `/collection/category/${category.slug}`,
          changefreq: "daily",
          priority: "0.9",
        }))
      );
    }

    // Fetch all subcategories
    const subcategoriesData = await getSubCategories();
    if (
      subcategoriesData?.status === 1 &&
      subcategoriesData?.data?.length > 0
    ) {
      urls = urls.concat(
        subcategoriesData.data?.map((subcategory) => ({
          url: `/collection/subcategory/${subcategory.slug}`,
          changefreq: "daily",
          priority: "0.9",
        }))
      );
    }

    // Fetch all inner subcategories
    const innerSubcategoriesData = await getInnerSubCategories();
    if (
      innerSubcategoriesData?.status === 1 &&
      innerSubcategoriesData?.data?.length > 0
    ) {
      urls = urls.concat(
        innerSubcategoriesData.data?.map((inner) => ({
          url: `/collection/innersubcategory/${inner.slug}`,
          changefreq: "daily",
          priority: "0.9",
        }))
      );
    }

    // Fetch all fabrics
    const fabricsData = await getAllFabrics();
    if (fabricsData?.length > 0) {
      urls = urls.concat(
        fabricsData?.map((fabric) => ({
          url: `/collection/fabric/${fabric.slug}`,
          changefreq: "daily",
          priority: "0.8",
        }))
      );
    }

    // Fetch all offers
    const offersData = await getAllOffers();
    if (offersData?.status === 1 && offersData?.data?.length > 0) {
      urls = urls.concat(
        offersData.data?.map((offer) => ({
          url: `/collection/offers/${offer.slug}`,
          changefreq: "daily",
          priority: "0.8",
        }))
      );
    }

    // Fetch all products
    const productsData = await getAllProducts(
      "visibility=Published&limit=1000"
    );
    if (productsData?.status === 1 && productsData?.data?.length > 0) {
      urls = urls.concat(
        productsData.data?.map((product) => ({
          url: `/product/${product.slug}`,
          changefreq: "daily",
          priority: "0.9",
        }))
      );
    }

    // Fetch all blogs
    const blogsData = await getAllBlogs();
    if (blogsData?.status === 1) {
      urls = urls.concat(
        blogsData.data?.map((blog) => ({
          url: `/blogs/${blog.slug}`,
          changefreq: "weekly",
          priority: "0.7",
        }))
      );
    }

    // Fetch all CMS pages
    const pagesData = await getAllPages();
    if (pagesData?.status === 1) {
      urls = urls.concat(
        pagesData.data?.map((page) => ({
          url: `/page/${page.slug}`,
          changefreq: "monthly",
          priority: "0.6",
        }))
      );
    }

    // Fetch special collections
    const specialCollections = ["all", "new"];
    urls = urls.concat(
      specialCollections.map((type) => ({
        url: `/collection/${type}`,
        changefreq: "daily",
        priority: "0.8",
      }))
    );
  } catch (error) {
    console.error("Error fetching dynamic routes:", error);
  }

  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (route) => `
  <url>
    <loc>${baseUrl}${route.url}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    )
    .join("\n")}
</urlset>`;

  // Write sitemap to public directory
  fs.writeFileSync(sitemapPath, sitemap, "utf8");
  console.log("Sitemap generated successfully at", sitemapPath);
}

// Run the sitemap generation
try {
  await generateSitemap();
} catch (err) {
  console.error("Sitemap generation failed:", err);
  process.exit(1);
}
