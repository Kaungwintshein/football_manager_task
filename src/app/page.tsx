"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { hydrate as hydrateAuth } from "@/lib/slices/authSlice";
import { hydrate as hydrateTeams } from "@/lib/slices/teamsSlice";
import { hydrate as hydratePlayers } from "@/lib/slices/playersSlice";
import LoginForm from "@/components/auth/LoginForm";
import Header from "@/components/layout/Header";
import Dashboard from "@/components/Dashboard";
import { Loader2 } from "lucide-react";

export default function Home() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);
  const { isHydrated: teamsHydrated } = useAppSelector((state) => state.teams);
  const { isHydrated: playersHydrated } = useAppSelector(
    (state) => state.players
  );

  useEffect(() => {
    dispatch(hydrateAuth());
    dispatch(hydrateTeams());
    dispatch(hydratePlayers());
  }, [dispatch]);

  if (!isHydrated || !teamsHydrated || !playersHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Header />
      <Dashboard />
    </div>
  );
}
