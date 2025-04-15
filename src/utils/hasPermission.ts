import { User } from '../types';

export const hasPermission = (user: User, requiredScope: string): boolean => {
  // If user has no role, they don't have the permission
  if (!user || !user.role) return false;
  
  // If role is just a string, check if it's "admin" which has all permissions
  if (typeof user.role === 'string') {
    // If the role string is "admin", grant all permissions
    if (user.role.toLowerCase() === 'admin') {
      return true;
    }
    
    // Also check the permissions array directly since backend might send that
    if (user.permissions && Array.isArray(user.permissions)) {
      return user.permissions.includes(requiredScope);
    }
    
    return false;
  }
  
  // Check if the role name is admin (special case)
  if (user.role.name && user.role.name.toLowerCase() === 'admin') {
    return true;
  }
  
  // Check if user's role has the required scope
  return user.role.scopes && Array.isArray(user.role.scopes) && 
         user.role.scopes.includes(requiredScope);
};

