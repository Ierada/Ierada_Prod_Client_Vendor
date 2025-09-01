import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPageBySlug } from "../../../services/api.page";
import NotFoundPage from "../../NotFound";
import config from "../../../config/config";

export default function PageView() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const response = await getPageBySlug(slug);
        if (response?.status === 1 && response?.data) {
          setPage(response.data);

          // Set page meta data
          if (response.data.meta_title) {
            document.title = response.data.meta_title;
          }

          // Set meta description
          const metaDescription = document.querySelector(
            'meta[name="description"]'
          );
          if (metaDescription && response.data.meta_description) {
            metaDescription.setAttribute(
              "content",
              response.data.meta_description
            );
          }
        } else {
          setError("Page not found");
        }
      } catch (error) {
        console.error("Error fetching page:", error);
        setError(error.message || "Failed to fetch page");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();

    // Cleanup function to reset meta tags
    return () => {
      document.title = config.BRAND_NAME;
      const metaDescription = document.querySelector(
        'meta[name="description"]'
      );
      if (metaDescription) {
        metaDescription.setAttribute("content", "Ierada fashion store");
      }
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F47954]"></div>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return <NotFoundPage />;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-[#333843] mb-6">{page.title}</h1>

        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />

        <div className="mt-10 pt-6 border-t border-gray-200">
          <Link
            to="/"
            className="text-[#F47954] hover:text-[#d86745] font-medium flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
