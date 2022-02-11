import React from 'react';
import { ToastContainer } from 'react-toastify';

export default function DashboardLayout({ children, ...props }) {
  return (
    <>
      {React.cloneElement(children)}
      <ToastContainer
        autoClose={5000}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}
