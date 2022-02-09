import React from 'react';
import { ToastContainer } from 'react-toastify';
import Header from '../../components/Header';

export default function DashboardLayout({ children, ...props }) {
  return (
    <>
      <Header />
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
