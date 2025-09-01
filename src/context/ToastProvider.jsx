import React, { createContext, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const notify = (message, type = 'default') => {
    return toast(message, {
      type,
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    });
  };

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <ToastContainer
        progressClassName='toastProgress'
        bodyClassName='toastBody'
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
