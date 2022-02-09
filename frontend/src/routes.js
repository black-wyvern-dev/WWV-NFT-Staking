import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import Home from './pages/Home';

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      path: '/',
      element: <DashboardLayout><Home /></DashboardLayout>,
      children: [
        { element: <Navigate to="/" replace /> },
        { path: '', element: <Home /> }
      ]
    },
    { path: '*', element: <Navigate to="/" replace /> }
  ]);
}
