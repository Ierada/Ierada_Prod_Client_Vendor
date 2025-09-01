// src/utils/auth.js
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import config from "../config/config";

export const getUserFromToken = () => {
  const token = Cookies.get(`${config.BRAND_NAME}userToken`);
  if (!token) return null;
  return jwtDecode(token);
};

export const validateUserSession = (navigate) => {
  const token = Cookies.get(`${config.BRAND_NAME}userToken`);
  if (!token) navigate("/login");
};