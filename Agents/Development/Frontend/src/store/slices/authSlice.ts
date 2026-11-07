import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserBO } from '@/types/orchestration/AccessBO.ts';

interface AuthState {
  user: UserBO | null;
}
const initialState: AuthState = { user: null };
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signIn: (state, action: PayloadAction<UserBO>): void => {
      state.user = action.payload;
    },
    signOut: (state): void => {
      state.user = null;
    },
  },
});
export const { signIn, signOut } = authSlice.actions;
export const authReducer = authSlice.reducer;
