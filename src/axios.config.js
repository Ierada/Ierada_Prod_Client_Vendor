import axios from "axios";
import configure from "./config/config";
import { getRoleFromPath, getUserToken } from "./utils/userIdentifier";

const apiClient = axios.create({
  // baseURL: import.meta.env.VITE_TEST_API_URL,
  baseURL: import.meta.env.VITE_API_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    // Retrieve the token from cookies
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    };

    const pathname = window.location ? window.location.pathname : "/";
    const role = getRoleFromPath(pathname);
    const userToken = getUserToken(role);

    const passwordToken = getCookie("passwordToken");
    if (userToken) {
      config.headers["auth-token"] = userToken;
    }
    if (passwordToken) {
      config.headers["password-token"] = passwordToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;

// keep below for sitemap generation

// import axios from "axios";
// import configure from "./config/config.js";

// // Use environment variables for Node.js or fallback to configure
// const isNode = typeof process !== "undefined" && process.env;
// const baseURL = isNode
//   ? process.env.VITE_API_URL || configure.VITE_API_URL
//   : configure.VITE_API_URL;
// // const baseURL = isNode
// //   ? process.env.VITE_TEST_API_URL || configure.VITE_TEST_API_URL
// //   : configure.VITE_TEST_API_URL;

// const apiClient = axios.create({
//   baseURL,
// });

// // Request interceptor
// apiClient.interceptors.request.use(
//   (config) => {
//     // Browser environment: Use cookies
//     if (typeof document !== "undefined") {
//       const getCookie = (name) => {
//         const value = `; ${document.cookie}`;
//         const parts = value.split(`; ${name}=`);
//         if (parts.length === 2) return parts.pop().split(";").shift();
//       };

//       const userToken = getCookie(`${configure.BRAND_NAME}userToken`);
//       const passwordToken = getCookie("passwordToken");
//       if (userToken) {
//         config.headers["auth-token"] = userToken;
//       }
//       if (passwordToken) {
//         config.headers["password-token"] = passwordToken;
//       }
//     }

//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// export default apiClient;
