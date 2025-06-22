"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/store";
import HydrationProvider from "./HydrationProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <HydrationProvider>{children}</HydrationProvider>
    </Provider>
  );
}
