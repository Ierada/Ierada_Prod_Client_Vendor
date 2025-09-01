import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import ProjectRoutes from "./Routes";
import DefaultLayout from "./layout/DefaultLayout";
import { ToastContainer } from "react-toastify";
import { HelmetProvider } from "react-helmet-async";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { getWebSettings } from "./services/api.settings";

const App = () => {
  const [settings, setSettings] = useState(null);
  const [footerData, setFooterData] = useState(null);

  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // useEffect(() => {
  //   const loadSettings = async () => {
  //     const response = await getWebSettings();
  //     if (response?.status === 1) {
  //         setSettings(response.data.settings);
  //         setFooterData(response.data.footer);
  //     }
  //   };

  //   loadSettings();
  // }, []);

  useEffect(() => {
    if (settings) {
      // Update favicon
      const favicon = document.querySelector('link[rel="icon"]');
      if (favicon) {
        favicon.href = settings?.favicon;
      } else {
        const newFavicon = document.createElement("link");
        newFavicon.rel = "icon";
        newFavicon.href = settings?.favicon;
        document.head.appendChild(newFavicon);
      }

      // Update meta tags
      const updateMetaTag = (name, content) => {
        let metaTag = document.querySelector(`meta[name="${name}"]`);
        if (metaTag) {
          metaTag.content = content;
        } else {
          metaTag = document.createElement("meta");
          metaTag.name = name;
          metaTag.content = content;
          document.head.appendChild(metaTag);
        }
      };

      let title = document.querySelector("title");
      if (title) {
        title.content = settings?.site_title;
      } else {
        const newTitle = document.createElement("title");
        newTitle.content = settings?.site_title;
        document.head.appendChild(newTitle);
      }

      updateMetaTag("title", settings?.meta_title);
      updateMetaTag("description", settings?.meta_description);
      updateMetaTag("og:image", settings?.og_image);
      // updateMetaTag("keywords", settings[0]?.metaKeywords);
      updateMetaTag("author", settings?.site_title);
    }
  }, [settings]);

  return (
    <AuthProvider>
      <AppProvider>
        <ToastContainer />
        <DefaultLayout footerData={footerData}>
          <HelmetProvider>
            <ProjectRoutes />
          </HelmetProvider>
        </DefaultLayout>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
