import React, { useEffect, useState } from "react";

const CustomGoogleTranslate = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "hi", label: "हिंदी" },
    { value: "bn", label: "বাংলা" },
    { value: "mr", label: "मराठी" },
    { value: "ta", label: "தமிழ்" },
    { value: "te", label: "తెలుగు" },
  ];

  // Function to get current Google Translate language
  const getCurrentGoogleLanguage = () => {
    const cookieName = "googtrans";
    const cookies = document.cookie.split(";");
    const googTrans = cookies.find((cookie) =>
      cookie.trim().startsWith(`${cookieName}=`)
    );
    if (googTrans) {
      const langCode = googTrans.split("/")[2];
      return langCode || "en";
    }
    return "en";
  };

  useEffect(() => {
    // Set initial language from cookie or localStorage
    const savedLang = getCurrentGoogleLanguage();
    setSelectedLanguage(savedLang);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeGoogleTranslate = () => {
      if (!isMounted) return;

      try {
        if (
          window.google &&
          window.google.translate &&
          window.google.translate.TranslateElement
        ) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,es,fr",
              autoDisplay: false,
            },
            "google_translate_element"
          );
          setIsInitialized(true);

          // Set initial language after initialization
          const currentLang = getCurrentGoogleLanguage();
          setSelectedLanguage(currentLang);
        }
      } catch (error) {
        console.error("Error initializing Google Translate:", error);
      }
    };

    const checkGoogleTranslateReady = () => {
      if (
        window.google &&
        window.google.translate &&
        window.google.translate.TranslateElement
      ) {
        initializeGoogleTranslate();
      } else {
        setTimeout(checkGoogleTranslateReady, 100);
      }
    };

    window.googleTranslateElementInit = () => {
      checkGoogleTranslateReady();
    };

    if (!document.querySelector('script[src*="translate.google.com"]')) {
      const script = document.createElement("script");
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else {
      checkGoogleTranslateReady();
    }

    return () => {
      isMounted = false;
      const script = document.querySelector(
        'script[src*="translate.google.com"]'
      );
      if (script) {
        script.remove();
      }
      delete window.googleTranslateElementInit;
    };
  }, []);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);

    const waitForElement = () => {
      const selectElement = document.querySelector(".goog-te-combo");
      if (selectElement) {
        try {
          selectElement.value = newLang;
          selectElement.dispatchEvent(new Event("change"));

          // Store the selected language
          localStorage.setItem("selectedLanguage", newLang);

          // Refresh the page after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 300);
        } catch (error) {
          console.error("Error changing language:", error);
        }
      } else {
        setTimeout(waitForElement, 100);
      }
    };

    waitForElement();
  };

  // Handler for language detection
  useEffect(() => {
    const detectBrowserLanguage = () => {
      const userLang = navigator.language || navigator.userLanguage;
      const langCode = userLang.split("-")[0];

      // Check if detected language is in our options
      const isSupported = languageOptions.some(
        (option) => option.value === langCode
      );
      return isSupported ? langCode : "en";
    };

    // If no language is selected, detect and set browser language
    if (!selectedLanguage) {
      const detectedLang = detectBrowserLanguage();
      setSelectedLanguage(detectedLang);
    }
  }, [selectedLanguage, languageOptions]);

  return (
    <div className="border-b pb-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-[black] mb-1">Language</h2>
          <p className="text-gray-500 text-sm">Select your language</p>
        </div>

        <select
          value={selectedLanguage}
          onChange={handleLanguageChange}
          className="border rounded-md px-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={!isInitialized}
        >
          {languageOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div
        id="google_translate_element"
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
};

export default CustomGoogleTranslate;
