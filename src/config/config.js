const config = {
  API_URL: import.meta.env.API_URL,
  GMAP_KEY: import.meta.env.VITE_GMAP_KEY,
  VITE_BASE_WEBSITE_URL: import.meta.env.VITE_BASE_WEBSITE_URL,
  VITE_BASE_VENDOR_URL: import.meta.env.VITE_BASE_VENDOR_URL,
  VITE_BASE_INFLUENCER_URL: import.meta.env.VITE_BASE_INFLUENCER_URL,
  VITE_BASE_ADMIN_URL: import.meta.env.VITE_BASE_ADMIN_URL,
  RAZORPAY_KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: import.meta.env.RAZORPAY_KEY_SECRET,
  FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  FIREBASE_authDomain: import.meta.env.VITE_FIREBASE_authDomain,
  FIREBASE_projectId: import.meta.env.VITE_FIREBASE_projectId,
  FIREBASE_storageBucket: import.meta.env.VITE_FIREBASE_storageBucket,
  FIREBASE_messagingSenderId: import.meta.env.VITE_FIREBASE_messagingSenderId,
  FIREBASE_appId: import.meta.env.VITE_FIREBASE_appId,
  FIREBASE_measurementId: import.meta.env.VITE_FIREBASE_measurementId,
  BRAND_NAME: import.meta.env.VITE_BRAND_NAME,
  VITE_OTPLESS_appId: import.meta.env.VITE_OTPLESS_appId,
  VITE_EMAIL_PROJECT_ID: import.meta.env.VITE_EMAIL_PROJECT_ID,
  VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  VITE_FACEBOOK_APP_ID: import.meta.env.VITE_FACEBOOK_APP_ID,
};

export default config;

// For sitemap generation: keep bottom code

// import dotenv from "dotenv";

// // Load environment variables from .env file for Node.js scripts
// if (typeof process !== "undefined" && process.env) {
//   dotenv.config();
// }

// // Use process.env for Node.js, import.meta.env for Vite
// const env =
//   typeof import.meta !== "undefined" && import.meta.env
//     ? import.meta.env
//     : process.env;

// const config = {
//   VITE_API_URL: env.VITE_API_URL || "https://ierada.com/api/",
//   VITE_TEST_API_URL: env.VITE_TEST_API_URL || "http://localhost:3000/api/",
//   GMAP_KEY: env.VITE_GMAP_KEY || "",
//   VITE_BASE_WEBSITE_URL: env.VITE_BASE_WEBSITE_URL || "/",
//   VITE_BASE_VENDOR_URL: env.VITE_BASE_VENDOR_URL || "/vendor",
//   VITE_BASE_INFLUENCER_URL: env.VITE_BASE_INFLUENCER_URL || "/influencer",
//   VITE_BASE_ADMIN_URL: env.VITE_BASE_ADMIN_URL || "/admin",
//   RAZORPAY_KEY_ID: env.VITE_RAZORPAY_KEY_ID || "",
//   RAZORPAY_KEY_SECRET: env.VITE_RAZORPAY_KEY_SECRET || "",
//   FIREBASE_API_KEY: env.VITE_FIREBASE_API_KEY || "",
//   FIREBASE_authDomain: env.VITE_FIREBASE_authDomain || "",
//   FIREBASE_projectId: env.VITE_FIREBASE_projectId || "",
//   FIREBASE_storageBucket: env.VITE_FIREBASE_storageBucket || "",
//   FIREBASE_messagingSenderId: env.VITE_FIREBASE_messagingSenderId || "",
//   FIREBASE_appId: env.VITE_FIREBASE_appId || "",
//   FIREBASE_measurementId: env.VITE_FIREBASE_measurementId || "",
//   BRAND_NAME: env.VITE_BRAND_NAME || "IERADA",
//   VITE_OTPLESS_appId: env.VITE_OTPLESS_appId || "",
//   VITE_EMAIL_PROJECT_ID: env.VITE_EMAIL_PROJECT_ID || "",
// };

// export default config;
