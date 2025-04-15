// src/services/api.ts
import axios from 'axios';
import { LoginCredentials, RegisterData, RoleFormData, AssignRoleData } from '../types';

// Use the new deployed backend URL
const API_URL = 'https://rbac-backend-v2-0.vercel.app/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor for JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth services
export const authAPI = {
  login: (credentials: LoginCredentials) => 
    api.post('/auth/login', credentials),
  
  register: (userData: RegisterData) => 
    api.post('/auth/signup', userData),
  
  getProfile: () => 
    api.get('/auth/profile'),
};

// Users services
export const usersAPI = {
  getAllUsers: () => 
    api.get('/users'),
  
  updateProfile: (userData: Partial<RegisterData>) => 
    api.put('/users/profile', userData),
  
  assignRole: (data: AssignRoleData) => 
    api.post('/users/assign-role', data),
};

// Roles services
export const rolesAPI = {
  getAllRoles: () => 
    api.get('/roles'),
  
  getRoleById: (id: string) => 
    api.get(`/roles/${id}`),
  
  createRole: (roleData: RoleFormData) => 
    api.post('/roles', roleData),
  
  updateRole: (id: string, roleData: RoleFormData) => 
    api.put(`/roles/${id}`, roleData),
  
  deleteRole: (id: string) => 
    api.delete(`/roles/${id}`),
};

export default api;