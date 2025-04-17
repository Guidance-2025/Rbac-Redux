// src/components/Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { logout } from '../store/slices/authSlice';
import { hasPermission } from '../utils/hasPermission';

const Navbar = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">RBAC</Link>
        
        <div className="flex space-x-4">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hover:text-gray-300">Dashboard</Link>
              
              {/* Only show Users link if user has manage_users permission */}
              {user && hasPermission(user, 'manage_users') && (
                <Link to="/users" className="hover:text-gray-300">Users</Link>
              )}
              
              {/* Only show Roles link if user has manage_roles permission */}
              {user && hasPermission(user, 'manage_roles') && (
                <Link to="/roles" className="hover:text-gray-300">Roles</Link>
              )}
              
              <Link to="/profile" className="hover:text-gray-300">Profile</Link>
              <button 
                onClick={handleLogout}
                className="hover:text-gray-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-300">Login</Link>
              <Link to="/register" className="hover:text-gray-300">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
