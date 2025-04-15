import { AuthState, UsersState, RolesState } from './index';

export interface RootState {
  auth: AuthState;
  users: UsersState;
  roles: RolesState;
} 