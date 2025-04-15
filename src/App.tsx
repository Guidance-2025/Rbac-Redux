
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import PrivateRoute from './utils/PrivateRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Users from './pages/Users';
import Roles from './pages/Roles';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Private Routes - Basic user access */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            
            {/* Private Routes - Admin access */}
            <Route element={<PrivateRoute requiredPermission="manage_users" />}>
              <Route path="/users" element={<Users />} />
            </Route>
            
            <Route element={<PrivateRoute requiredPermission="manage_roles" />}>
              <Route path="/roles" element={<Roles />} />
            </Route>
            
            {/* Redirect and Not Found */}
            <Route path="/" element={
               localStorage.getItem('token') 
              ? <Navigate to="/dashboard" /> 
               : <Navigate to="/login" />
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
};

export default App;