// src/pages/Users.tsx
import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks';
import { getAllUsers, assignRole } from '../store/slices/usersSlice';
import { getAllRoles } from '../store/slices/rolesSlice';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import { hasPermission } from '../utils/hasPermission';

const Users = () => {
  const dispatch = useAppDispatch();
  const { users, isLoading, error } = useAppSelector((state) => state.users);
  const { roles } = useAppSelector((state) => state.roles);
  const { user: currentUser } = useAppSelector((state) => state.auth);
  
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(getAllRoles());
  }, [dispatch]);
  
  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRoleId) return;
    
    setSuccessMessage('');
    setErrorMessage('');
    
    console.log('Selected User ID:', selectedUserId);
    console.log('Selected Role ID:', selectedRoleId);
    console.log('All users:', users);
    console.log('All roles:', roles);
    
    try {
      const result = await dispatch(assignRole({
        userId: selectedUserId,
        roleId: selectedRoleId
      })).unwrap();
      
      console.log('Role assignment result:', result);
      setSuccessMessage('Role assigned successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Refresh the users list to show updated roles
      dispatch(getAllUsers());
      
      // Reset selections
      setSelectedUserId('');
      setSelectedRoleId('');
    } catch (err: any) {
      console.error('Failed to assign role:', err);
      setErrorMessage(err?.message || 'Failed to assign role. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };
  
  // Check if current user is admin
  const isAdmin = currentUser && hasPermission(currentUser, 'manage_roles');
  
  // Filter available roles for managers (they shouldn't be able to assign admin roles)
  const availableRoles = roles.filter(role => {
    // If user is admin, show all roles
    if (isAdmin) return true;
    // Otherwise, don't show admin roles
    return role.name.toLowerCase() !== 'admin';
  });
  
  if (isLoading) return <Loading />;
  
  if (error) return <Alert type="error" message={error} />;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">User Management</h1>
      
      {successMessage && <Alert type="success" message={successMessage} />}
      {errorMessage && <Alert type="error" message={errorMessage} />}
      
      {/* Only show role assignment to users with manage_roles permission */}
      {currentUser && hasPermission(currentUser, 'manage_roles') && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Assign Role to User</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="userId" className="block text-gray-700 text-sm font-bold mb-2">
                Select User
              </label>
              <select
                id="userId"
                value={selectedUserId}
                onChange={(e) => {
                  const value = e.target.value;
                  console.log("Selected user value:", value);
                  setSelectedUserId(value);
                }}
                className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">Select a user</option>
                {users.map((user) => {
                  console.log(`User option - id: ${user._id || user.id}, name: ${user.name}`);
                  return (
                    <option key={user.id || user._id} value={user._id || user.id}>
                      {user.name} ({user.email})
                    </option>
                  );
                })}
              </select>
            </div>
            
            <div>
              <label htmlFor="roleId" className="block text-gray-700 text-sm font-bold mb-2">
                Select Role
              </label>
              <select
                id="roleId"
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">Select a role</option>
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={handleAssignRole}
                disabled={!selectedUserId || !selectedRoleId}
              >
                Assign Role
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scopes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className={user.id === currentUser?.id ? 'bg-blue-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.name}
                    {/* {user.id === currentUser?.id && (
                      <span className="ml-2 text-xs text-blue-600">(You)</span>
                    )} */}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {user.role ? (typeof user.role === 'string' ? user.role : user.role.name) : 'No Role'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.role && typeof user.role !== 'string' && Array.isArray(user.role.scopes) ? (
                    <div className="flex flex-wrap gap-1">
                      {user.role.scopes.map((scope) => (
                        <span key={scope} className="px-2 py-1 text-xs bg-gray-100 rounded">
                          {scope}
                        </span>
                      ))}
                    </div>
                  ) : (
                    'N/A'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;