// src/utils/PrivateRoute.tsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks';
import { hasPermission } from './hasPermission';
import { RootState } from '../types/store';
import { getProfile } from '../store/slices/authSlice';
import { useState,useEffect } from 'react';

interface PrivateRouteProps {
  requiredPermission?: string;
}

// src/utils/PrivateRoute.tsx
const PrivateRoute = ({ requiredPermission }: PrivateRouteProps) => {
    const { isAuthenticated, user, error } = useAppSelector((state: RootState) => state.auth);
    const dispatch = useAppDispatch();
    const [isChecking, setIsChecking] = useState(true);
  
    useEffect(() => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && !isAuthenticated) {
        // If we have a token but not authenticated, try to fetch profile
        dispatch(getProfile())
          .unwrap()
          .then(() => {
            setIsChecking(false);
          })
          .catch(() => {
            // If profile fetch fails, clear everything
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsChecking(false);
          });
      } else if (!token && storedUser) {
        // If no token but have stored user, clear user data
        localStorage.removeItem('user');
        setIsChecking(false);
      } else {
        setIsChecking(false);
      }
    }, [isAuthenticated, dispatch]);
  
    // Show loading while checking
    if (isChecking) {
      return <div>Loading...</div>;
    }
  
    // Check if there's a valid token and no error
    const token = localStorage.getItem('token');
    if (!token || error) {
      return <Navigate to="/login" />;
    }
  
    // If there's a required permission, check if the user has it
    if (requiredPermission && user && !hasPermission(user, requiredPermission)) {
      return <Navigate to="/unauthorized" />;
    }
  
    return <Outlet />;
  };

export default PrivateRoute;