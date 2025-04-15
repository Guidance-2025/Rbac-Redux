// src/types/index.ts

export interface User {
    id: string;
    _id?: string;
    username: string;
    name: string;
    email: string;
    gender: string;
    age?: number;
    roles: string[];
    permissions: string[];
    role?: string | Role;
}

export interface Role {
    id?: string;
    _id: string;
    name: string;
    scopes: string[];
    rank: number;
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
}

export interface UsersState {
    users: User[];
    isLoading: boolean;
    error: string | null;
}

export interface RolesState {
    roles: Role[];
    isLoading: boolean;
    error: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    gender: string;
    age: number;
}

export interface RoleFormData {
    name: string;
    scopes: string[];
    rank?: number;
}

export interface AssignRoleData {
    userId: string;
    roleId: string;
}