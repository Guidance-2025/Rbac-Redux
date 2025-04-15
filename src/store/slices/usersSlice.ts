import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, UsersState, AssignRoleData } from '../../types';
import axios from 'axios';
import { usersAPI } from '../../services/api';

// Use the new deployed backend URL
const API_URL = 'https://rbac-backend-v2-0.vercel.app/api';

const initialState: UsersState = {
  users: [],
  isLoading: false,
  error: null
};

// Thunk for fetching users
export const getAllUsers = createAsyncThunk(
  'users/getAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching users');
      
      const response = await axios.get(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch users:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch users'
      );
    }
  }
);

// Update profile thunk
export const updateProfile = createAsyncThunk(
  'users/updateProfile',
  async (userData: { name: string, email: string, gender: string, age: number }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Updating profile with data:', userData);
      
      const response = await axios.put(`${API_URL}/users/profile`, userData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Profile update error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to update profile'
      );
    }
  }
);

// Assign role thunk
export const assignRole = createAsyncThunk(
  'users/assignRole',
  async (assignData: AssignRoleData, { rejectWithValue, getState }) => {
    try {
      console.log('Assigning role with data:', assignData);
      
      // Check if userId contains extra information (like name and email)
      const state = getState() as any;
      const users = state.users.users;
      const roles = state.roles.roles;
      
      // Try to find user and role by ID
      let userId = assignData.userId;
      let roleId = assignData.roleId;
      
      // If userId doesn't look like a valid MongoDB ObjectId, try to find the user
      if (userId && (userId.includes('(') || userId.includes('@') || userId.includes(' '))) {
        const foundUser = users.find((u: any) => 
          `${u.name} (${u.email})` === userId || u.name === userId
        );
        if (foundUser) {
          console.log('Found user by name:', foundUser);
          userId = foundUser._id || foundUser.id; // Try both _id and id since MongoDB sometimes uses _id
        }
      }
      
      // If role is a name and not an ID (especially for "admin")
      if (roleId === 'admin' || roleId === 'user' || roleId === 'manager' || 
          (typeof roleId === 'string' && !roleId.match(/^[0-9a-fA-F]{24}$/))) {
        // Look for the role by name in the roles array
        const foundRole = roles.find((r: any) => 
          r.name.toLowerCase() === roleId.toLowerCase()
        );
        
        if (foundRole) {
          console.log('Found role object by name:', foundRole);
          roleId = foundRole._id || foundRole.id;
        } else {
          console.log('No role found with name:', roleId);
          // If role not found, this will fail on the backend
        }
      }
      
      // Match the backend API's expected format exactly
      const payload = {
        userId: userId?.trim(),
        roleId: roleId?.trim()
      };
      
      console.log('Sending payload:', payload);
      
      // Use the API service instead of direct axios call
      const response = await usersAPI.assignRole(payload);
      console.log('Assignment response:', response.data);
      return response.data.user || response.data;
    } catch (error: any) {
      console.error('Role assignment error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      return rejectWithValue(errorMessage || 'Failed to assign role');
    }
  }
);

// Slice definition
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Synchronous actions
    addUserLocal: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    updateUserLocal: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    removeUserLocal: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(user => user.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    // Fetch users reducers
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Update profile reducers
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        // If the updated user is in the users list, update their info
        if (action.payload && action.payload.id) {
          const index = state.users.findIndex(user => user.id === action.payload.id);
          if (index !== -1) {
            state.users[index] = action.payload;
          }
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Assign role reducers
    builder
      .addCase(assignRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(assignRole.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the user with the new role
        const updatedUser = action.payload;
        const index = state.users.findIndex(user => user.id === updatedUser.id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      })
      .addCase(assignRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { addUserLocal, updateUserLocal, removeUserLocal } = usersSlice.actions;
export default usersSlice.reducer; 