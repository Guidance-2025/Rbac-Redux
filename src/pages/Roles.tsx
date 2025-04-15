// src/pages/Roles.tsx
import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks';
import { 
  getAllRoles, 
  createRole, 
  updateRole,
  deleteRole 
} from '../store/slices/rolesSlice';
import Button from '../components/Button';
import Input from '../components/Input';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import { hasPermission } from '../utils/hasPermission';
import { useNavigate } from 'react-router-dom';

// Organize scopes into logical groups
const SCOPE_GROUPS = {
  administration: {
    label: 'Administration',
    scopes: ['manage_users', 'manage_roles']
  },
  access: {
    label: 'Access Control',
    scopes: ['view_dashboard']
  },
  content: {
    label: 'Content Management',
    scopes: ['create_content', 'edit_content', 'publish_content']
  }
};

const Roles = () => {
  const dispatch = useAppDispatch();
  const { roles, isLoading, error } = useAppSelector((state) => state.roles);
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [roleRank, setRoleRank] = useState<number>(1);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  
  useEffect(() => {
    dispatch(getAllRoles());
  }, [dispatch]);
  
  // Redirect if user doesn't have manage_roles permission
  useEffect(() => {
    if (currentUser && !hasPermission(currentUser, 'manage_roles')) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);
  
  const handleSelectRole = (roleId: string) => {
    console.log('Selecting role:', roleId);
    const role = roles.find(r => r._id === roleId);
    console.log('Found role:', role);
    
    if (role) {
      setSelectedRoleId(role._id);
      setRoleName(role.name || '');
      setSelectedPermissions(role.scopes || []);
      setRoleRank(role.rank || 1);
      setIsEditing(true);
    }
  };
  
  const handleCreateNew = () => {
    setSelectedRoleId(null);
    setRoleName('');
    setSelectedPermissions([]);
    setRoleRank(1);
    setIsEditing(true);
    setActiveTab('create');
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setSelectedRoleId(null);
    setRoleName('');
    setSelectedPermissions([]);
    setRoleRank(1);
    setFormError('');
  };
  
  const handlePermissionChange = (scope: string) => {
    setSelectedPermissions(prev => 
      prev.includes(scope)
        ? prev.filter(p => p !== scope)
        : [...prev, scope]
    );
  };
  
  const validateForm = () => {
    if (!roleName.trim()) {
      setFormError('Role name is required');
      return false;
    }
    
    if (selectedPermissions.length === 0) {
      setFormError('At least one permission must be selected');
      return false;
    }
    
    setFormError('');
    return true;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      if (selectedRoleId) {
        // Don't allow removing manage_roles from admin role
        if (roleName.toLowerCase() === 'admin' && !selectedPermissions.includes('manage_roles')) {
          setFormError("Cannot remove 'manage_roles' permission from the admin role");
          return;
        }
        
        // Update existing role
        await dispatch(updateRole({
          id: selectedRoleId,
          roleData: {
            name: roleName,
            scopes: selectedPermissions,
            rank: roleRank
          }
        })).unwrap();
        setSuccessMessage('Role updated successfully');
      } else {
        // Create new role
        await dispatch(createRole({
          name: roleName,
          scopes: selectedPermissions,
          rank: roleRank
        })).unwrap();
        setSuccessMessage('Role created successfully');
      }
      
      setIsEditing(false);
      setSelectedRoleId(null);
      setRoleName('');
      setSelectedPermissions([]);
      setRoleRank(1);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save role. Please try again.');
      setTimeout(() => setFormError(''), 5000);
    }
  };
  
  const handleDeleteRole = async (id: string) => {
    const role = roles.find(r => r._id === id);
    
    // Prevent deletion of admin role
    if (role && role.name && role.name.toLowerCase() === 'admin') {
      setFormError('Cannot delete the admin role');
      setTimeout(() => setFormError(''), 3000);
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      try {
        await dispatch(deleteRole(id)).unwrap();
        setSuccessMessage('Role deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err: any) {
        setFormError(err?.message || 'Failed to delete role');
        setTimeout(() => setFormError(''), 5000);
      }
    }
  };
  
  const renderScopeGroup = (groupKey: string, group: { label: string; scopes: string[] }, isDisabled: boolean = false) => (
    <div key={groupKey} className="mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-3">{group.label}</h3>
      <div className="bg-gray-50 p-4 rounded border border-gray-200 space-y-2">
        {group.scopes.map((scope) => (
          <div key={`${groupKey}-scope-${scope}`} className="flex items-center">
            <input
              type="checkbox"
              id={`${groupKey}-scope-${scope}`}
              checked={selectedPermissions.includes(scope)}
              onChange={() => handlePermissionChange(scope)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              disabled={isDisabled && roleName.toLowerCase() === 'admin' && scope === 'manage_roles'}
            />
            <label 
              htmlFor={`${groupKey}-scope-${scope}`}
              className="ml-3 text-sm text-gray-700 cursor-pointer flex items-center"
            >
              {scope}
              {scope === 'manage_roles' && roleName.toLowerCase() === 'admin' && (
                <span className="ml-2 text-xs text-gray-500">(Required for admin)</span>
              )}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRoleForm = (isEdit: boolean = false) => {
    console.log('Rendering form with:', {
      isEdit,
      selectedRoleId,
      roleName,
      selectedPermissions,
      roleRank
    });
    
    return (
      <div className="space-y-6">
        <div>
          <Input
            type="text"
            id="roleName"
            name="roleName"
            label="Role Name"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="Enter role name"
            required
            disabled={isEdit && roleName.toLowerCase() === 'admin'}
          />
          <p className="mt-1 text-sm text-gray-500">
            Choose a descriptive name for this role
          </p>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Role Permissions</h3>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {Object.entries(SCOPE_GROUPS).map(([key, group]) => 
              renderScopeGroup(key, group, isEdit)
            )}
          </div>
        </div>

        <div>
          <Input
            type="number"
            id="roleRank"
            name="roleRank"
            label="Role Rank"
            value={roleRank.toString()}
            onChange={(e) => setRoleRank(Number(e.target.value) || 1)}
            placeholder="Enter role rank (1-10)"
            min="1"
            max="10"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Higher rank roles have precedence over lower rank roles
          </p>
        </div>

        <div className="flex space-x-4 pt-4 border-t">
          <Button
            onClick={handleSubmit}
            variant="primary"
          >
            {isEdit ? 'Update Role' : 'Create Role'}
          </Button>
          <Button
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading) return <Loading />;
  
  if (currentUser && !hasPermission(currentUser, 'manage_roles')) {
    return <Alert type="error" message="You don't have permission to manage roles" />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
        {!isEditing && (
          <Button onClick={handleCreateNew} variant="primary">
            Create New Role
          </Button>
        )}
      </div>
      
      {error && <Alert type="error" message={error} />}
      {formError && <Alert type="error" message={formError} />}
      {successMessage && <Alert type="success" message={successMessage} />}
      
      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('create')}
            className={`${
              activeTab === 'create'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Create Role
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`${
              activeTab === 'manage'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Manage Roles
          </button>
        </nav>
      </div>
      
      {/* Create Role Section */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Create New Role</h2>
          {renderRoleForm(false)}
        </div>
      )}
      
      {/* Manage Roles Section */}
      {activeTab === 'manage' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Roles List */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Roles</h2>
                <Button
                  onClick={() => {
                    handleCreateNew();
                    setActiveTab('create');
                  }}
                  variant="primary"
                >
                  Create New
                </Button>
              </div>
              
              <div className="space-y-2">
                {roles.map((role) => (
                  <div 
                    key={role._id}
                    className={`p-3 rounded border cursor-pointer transition-colors ${
                      selectedRoleId === role._id
                        ? 'bg-blue-50 border-blue-300' 
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                    onClick={() => handleSelectRole(role._id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{role.name}</h3>
                        <p className="text-sm text-gray-500">Rank: {role.rank}</p>
                      </div>
                      {role.name.toLowerCase() !== 'admin' && (
                        <Button
                          variant="danger"
                          onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
                            if (e) {
                              e.stopPropagation();
                              handleDeleteRole(role._id);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {role.scopes.map(scope => (
                          <span 
                            key={`${role._id}-${scope}`}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {scope}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Role Editor */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">
                {selectedRoleId ? 'Edit Role' : 'Select a Role to Edit'}
              </h2>
              
              {selectedRoleId && (
                <div>
                  {renderRoleForm(true)}
                </div>
              )}
              
              {!selectedRoleId && (
                <div className="text-center text-gray-500 py-4">
                  Select a role from the list to edit its details
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;