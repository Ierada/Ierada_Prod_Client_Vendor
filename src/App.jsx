import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import VendorRoutes from "./Routes/index";
import { ToastContainer } from "react-toastify";
import { HelmetProvider } from "react-helmet-async";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const App = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AuthProvider>
      <AppProvider>
        <ToastContainer />
        <HelmetProvider>
          <VendorRoutes />
        </HelmetProvider>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
