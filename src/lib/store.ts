import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import playersReducer from "./slices/playersSlice";
import teamsReducer from "./slices/teamsSlice";
import offersReducer from "./slices/offersSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    players: playersReducer,
    teams: teamsReducer,
    offers: offersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
