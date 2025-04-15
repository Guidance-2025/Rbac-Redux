import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { deleteRole } from '../store/slices/rolesSlice';
import { AppDispatch } from '../store';

const RoleList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { roles, isLoading } = useSelector((state: RootState) => state.roles);

  const handleDelete = async (roleId: string) => {
    try {
      await dispatch(deleteRole(roleId)).unwrap();
    } catch (error) {
      console.error('Failed to delete role:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Roles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div key={role._id} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">{role.name}</h2>
            <p className="text-gray-600 mb-4">Rank: {role.rank}</p>
            <div className="mb-4">
              <h3 className="font-medium mb-2">Scopes:</h3>
              <ul className="list-disc list-inside">
                {role.scopes.map((scope) => (
                  <li key={scope} className="text-gray-600">
                    {scope}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => handleDelete(role._id)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete Role
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleList; 