// src/pages/Dashboard.tsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import Alert from '../components/Alert';
import { Link } from 'react-router-dom';
import { getAllUsers } from '../store/slices/usersSlice';
import { getAllRoles } from '../store/slices/rolesSlice';
import { User, Role } from '../types';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user, isLoading } = useSelector((state: RootState) => state.auth);
  const { users, isLoading: usersLoading } = useSelector((state: RootState) => state.users);
  const { roles, isLoading: rolesLoading } = useSelector((state: RootState) => state.roles);

  useEffect(() => {
    if (user?.role === 'admin') {
      dispatch(getAllUsers());
      dispatch(getAllRoles());
    }
  }, [dispatch, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Alert type="info" message="Please login to view dashboard" />;
  }

  if (!user) {
    return <Alert type="error" message="User data not found" />;
  }

  const isAdmin = user.role === 'admin';

  const getRoleName = (role: string | Role | undefined): string => {
    if (!role) return 'No Role';
    if (typeof role === 'string') return role;
    return role.name;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user.name || user.email}!
            {isAdmin && <span className="ml-2 text-sm text-red-600 font-normal">(Admin)</span>}
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Profile Card - Visible to all users */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Your Profile</h2>
                {/* <Link
                  to="/profile"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit Profile
                </Link> */}
              </div>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Personal Information</h3>
                  <dl className="mt-2 space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Role</dt>
                      <dd className="mt-1">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                          {getRoleName(user.role)}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
                <div>
                  {/* <h3 className="text-sm font-medium text-gray-500">Permissions</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {user.permissions?.map((permission) => (
                      <span
                        key={permission}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {permission}
                      </span>
                    )) || <span className="text-sm text-gray-500">No permissions assigned</span>}
                  </div> */}
                </div>
              </div>
            </div>
          </div>

          {/* Admin-specific sections */}
          {isAdmin && (
            <>
              {/* Users Management Section */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">User Management</h2>
                    <div className="flex space-x-3">
                      <Link
                        to="/users/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Add User
                      </Link>
                      <Link
                        to="/users"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Manage Users
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  {usersLoading ? (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.slice(0, 5).map((user) => (
                            <tr key={user.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                  {getRoleName(user.role)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Active
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex space-x-3">
                                  <Link
                                    to={`/users/${user.id}`}
                                    className="text-indigo-600 hover:text-indigo-900"
                                  >
                                    Edit
                                  </Link>
                                  <button
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {users.length > 5 && (
                        <div className="mt-4 text-center">
                          <Link
                            to="/users"
                            className="text-sm text-indigo-600 hover:text-indigo-900"
                          >
                            View all users ({users.length})
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Roles Management Section */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">Role Management</h2>
                    <div className="flex space-x-3">
                      <Link
                        to="/roles/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Add Role
                      </Link>
                      <Link
                        to="/roles"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Manage Roles
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  {rolesLoading ? (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {roles.slice(0, 5).map((role) => (
                            <tr key={role.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-wrap gap-1">
                                  {role.scopes.map((scope) => (
                                    <span
                                      key={scope}
                                      className="px-2 py-1 text-xs bg-gray-100 rounded"
                                    >
                                      {scope}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {users.filter(u => u.role === role.name).length} users
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex space-x-3">
                                  <Link
                                    to={`/roles/${role.id}`}
                                    className="text-indigo-600 hover:text-indigo-900"
                                  >
                                    Edit
                                  </Link>
                                  <button
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {roles.length > 5 && (
                        <div className="mt-4 text-center">
                          <Link
                            to="/roles"
                            className="text-sm text-indigo-600 hover:text-indigo-900"
                          >
                            View all roles ({roles.length})
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;