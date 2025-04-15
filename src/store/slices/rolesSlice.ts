import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Role, RolesState, RoleFormData } from '../../types';
import axios from 'axios';
import { RootState } from '../../store';

// Use the new deployed backend URL
const API_URL = 'https://rbac-backend-v2-0.vercel.app/api';

const initialState: RolesState = {
  roles: [],
  isLoading: false,
  error: null
};

// Thunk for fetching roles - renamed to getAllRoles to match imports
export const getAllRoles = createAsyncThunk(
  'roles/getAllRoles',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/roles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch roles:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch roles'
      );
    }
  }
);

// Create role thunk
export const createRole = createAsyncThunk(
  'roles/createRole',
  async (roleData: RoleFormData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        name: roleData.name.trim(),
        scopes: roleData.scopes || [],
        rank: Number(roleData.rank || 1)
      };
      
      const response = await axios.post(`${API_URL}/roles`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to create role'
      );
    }
  }
);

// Update role thunk
export const updateRole = createAsyncThunk(
  'roles/updateRole',
  async ({ id, roleData }: { id: string, roleData: RoleFormData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Updating role with data:', { id, roleData });
      
      // Ensure payload matches the backend API's expected format
      const payload = {
        name: roleData.name,
        scopes: roleData.scopes,  // Backend expects 'scopes'
        rank: roleData.rank || 1
      };
      
      console.log('Updating role with payload:', JSON.stringify(payload, null, 2));
      
      const response = await axios.put(`${API_URL}/roles/${id}`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.role || response.data;
    } catch (error: any) {
      console.error('Role update error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to update role'
      );
    }
  }
);

// Delete role thunk
export const deleteRole = createAsyncThunk(
  'roles/deleteRole',
  async (roleId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const roleToDelete = state.roles.roles.find(role => role.id === roleId);

      if (roleToDelete?.name.toLowerCase() === 'admin') {
        return rejectWithValue('Cannot delete the admin role');
      }

      await axios.delete(`${API_URL}/roles/${roleId}`, {
        headers: {
          'Authorization': `Bearer ${state.auth.token}`
        }
      });
      return roleId;
    } catch (error: any) {
      console.error('Role deletion error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to delete role'
      );
    }
  }
);

// Slice definition
const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    // Synchronous actions
    addRoleLocal: (state, action: PayloadAction<Role>) => {
      state.roles.push(action.payload);
    },
    updateRoleLocal: (state, action: PayloadAction<Role>) => {
      const index = state.roles.findIndex(role => role._id === action.payload._id);
      if (index !== -1) {
        state.roles[index] = action.payload;
      }
    },
    removeRoleLocal: (state, action: PayloadAction<string>) => {
      state.roles = state.roles.filter(role => role._id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    // Get all roles reducers
    builder
      .addCase(getAllRoles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllRoles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roles = action.payload;
      })
      .addCase(getAllRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Create role reducers
    builder
      .addCase(createRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roles.push(action.payload);
      })
      .addCase(createRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
    // Update role reducers
    builder
      .addCase(updateRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.roles.findIndex(role => role.id === action.payload.id);
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
    // Delete role reducers
    builder
      .addCase(deleteRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roles = state.roles.filter(role => role.id !== action.payload);
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { addRoleLocal, updateRoleLocal, removeRoleLocal } = rolesSlice.actions;
export default rolesSlice.reducer; 