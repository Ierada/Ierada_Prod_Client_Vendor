import Cookies from "js-cookie";
import config from "../config/config";
import { jwtDecode } from "jwt-decode";

export const getUserIdentifier = (role = "customer") => {
  const tokenKey = `${config.BRAND_NAME}${
    role.charAt(0).toUpperCase() + role.slice(1)
  }Token`;
  const userKey = `${config.BRAND_NAME}${
    role.charAt(0).toUpperCase() + role.slice(1)
  }User`;
  const guestKey = `${config.BRAND_NAME}guestUserId`;

  // Check for existing user token
  const userToken = Cookies.get(tokenKey);
  let loggedUser = null;

  if (userToken) {
    try {
      loggedUser = jwtDecode(userToken);
      localStorage.setItem(userKey, JSON.stringify(loggedUser));
    } catch (error) {
      console.error(`Error decoding ${role} token:`, error);
      Cookies.remove(tokenKey);
    }
  }

  // Fallback to stored user data
  if (!loggedUser) {
    const storedUser = localStorage.getItem(userKey);
    if (storedUser) {
      loggedUser = JSON.parse(storedUser);
    }
  }

  let userId = localStorage.getItem(guestKey);
  if (loggedUser && loggedUser.role === role) {
    userId = loggedUser.id;
  }

  if (!userId && role === "customer") {
    // Generate guest ID for customers only
    userId = "guest_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(guestKey, userId);
  }

  return userId;
};

export const getUserToken = (role = "customer") => {
  const tokenKey = `${config.BRAND_NAME}${
    role.charAt(0).toUpperCase() + role.slice(1)
  }Token`;
  return Cookies.get(tokenKey);
};

export const getRoleFromPath = (pathname) => {
  const pathParts = pathname.split("/").filter(Boolean);
  const panel =
    pathParts[0] === "admin"
      ? "admin"
      : pathParts[0] === "vendor"
      ? "vendor"
      : "website";
  return panel === "website" ? "customer" : panel;
};

// Helper function to get role-specific key
export const getUserStorageKey = (role) => {
  const capitalizedRole = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : "Customer";
  return `${config.BRAND_NAME}${capitalizedRole}User`;
};

export const setUserCookie = (token, user, role) => {
  const tokenKey = `${config.BRAND_NAME}${
    role.charAt(0).toUpperCase() + role.slice(1)
  }Token`;
  const userKey = `${config.BRAND_NAME}${
    role.charAt(0).toUpperCase() + role.slice(1)
  }User`;

  Cookies.set(tokenKey, token, {
    expires: 30,
    path: "/",
    secure: true,
    sameSite: "Lax",
  });

  localStorage.setItem(userKey, JSON.stringify(user));

  if (role === "customer") {
    localStorage.removeItem(`${config.BRAND_NAME}guestUserId`);
  }
};
