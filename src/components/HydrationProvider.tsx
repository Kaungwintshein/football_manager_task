"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { hydrate as hydrateAuth } from "@/lib/slices/authSlice";
import { hydrate as hydrateTeams } from "@/lib/slices/teamsSlice";
import { hydrate as hydratePlayers } from "@/lib/slices/playersSlice";
import { hydrateOffers } from "@/lib/slices/offersSlice";

interface HydrationProviderProps {
  children: React.ReactNode;
}

export default function HydrationProvider({
  children,
}: HydrationProviderProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(hydrateAuth());
    dispatch(hydrateTeams());
    dispatch(hydratePlayers());
    dispatch(hydrateOffers());
  }, [dispatch]);

  return <>{children}</>;
}
