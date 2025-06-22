import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isHydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<string>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("user", action.payload);
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
      }
    },
    hydrate: (state) => {
      if (typeof window !== "undefined") {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          state.user = savedUser;
          state.isAuthenticated = true;
        }
      }
      state.isHydrated = true;
    },
  },
});

export const { login, logout, hydrate } = authSlice.actions;
export default authSlice.reducer;
