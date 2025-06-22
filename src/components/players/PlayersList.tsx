"use client";

import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchAllPlayers, clearCache } from "@/lib/slices/playersSlice";
import {
  addPlayerToTeam,
  removePlayerFromTeam,
  AnyPlayer,
} from "@/lib/slices/teamsSlice";
import { Player } from "@/lib/slices/teamsSlice";
import PlayerCard from "./PlayerCard";
import { Loader2, RefreshCw, Users, Database } from "lucide-react";

interface PlayersListProps {
  teamId?: string | number;
}

export default function PlayersList({ teamId }: PlayersListProps) {
  const dispatch = useAppDispatch();
  const {
    allPlayers,
    customPlayers,
    displayedPlayers,
    loading,
    loadingMore,
    error,
    hasMore,
    currentPage,
    displayLimit,
    lastApiFetch,
  } = useAppSelector((state) => state.players);
  const { localTeams } = useAppSelector((state) => state.teams);
  const observer = useRef<IntersectionObserver | null>(null);

  const combinedPlayers = useMemo(() => {
    const all = [...allPlayers, ...customPlayers];
    return all.filter(
      (player, index, self) =>
        index === self.findIndex((p) => p.id === player.id)
    );
  }, [allPlayers, customPlayers]);

  const [currentDisplay, setCurrentDisplay] = useState<AnyPlayer[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const initialDisplay = combinedPlayers.slice(0, displayLimit);
    setCurrentDisplay(initialDisplay);
    setPage(1);
  }, [combinedPlayers, displayLimit]);

  const fetchMore = useCallback(() => {
    if (loadingMore || currentDisplay.length >= combinedPlayers.length) return;

    const nextPage = page + 1;
    const nextPlayers = combinedPlayers.slice(0, nextPage * displayLimit);
    setCurrentDisplay(nextPlayers);
    setPage(nextPage);
  }, [
    page,
    combinedPlayers,
    displayLimit,
    loadingMore,
    currentDisplay.length,
    allPlayers.length,
    displayedPlayers.length,
  ]);

  const hasMoreToLoad = currentDisplay.length < combinedPlayers.length;

  const lastPlayerElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading || loadingMore) return;

      if (displayedPlayers.length >= allPlayers.length) {
        console.warn(
          "CRITICAL: Not setting up observer - displayed exceeds total",
          {
            displayed: displayedPlayers.length,
            total: allPlayers.length,
          }
        );
        return;
      }

      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreToLoad) {
          fetchMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMoreToLoad, fetchMore]
  );

  const cacheAge = lastApiFetch ? Date.now() - lastApiFetch : null;
  const cacheAgeMinutes = cacheAge ? Math.floor(cacheAge / (1000 * 60)) : null;
  const isCacheValid = cacheAge && cacheAge < 5 * 60 * 1000;

  const isLocalTeam =
    teamId &&
    typeof teamId === "string" &&
    localTeams.some((team: { id: string | number }) => team.id === teamId);

  const filteredPlayers =
    teamId && !isLocalTeam
      ? currentDisplay.filter((player: AnyPlayer) => {
          if ("team" in player) {
            return player.team?.id === teamId;
          }
          return false;
        })
      : currentDisplay;

  useEffect(() => {
    if (allPlayers.length === 0 || !isCacheValid) {
      dispatch(fetchAllPlayers());
    }
  }, [dispatch, allPlayers.length, isCacheValid]);

  const handleAddToTeam = (player: Player) => {
    if (teamId) {
      dispatch(addPlayerToTeam({ teamId, player }));
    }
  };

  const handleRemoveFromTeam = (playerId: number) => {
    if (teamId) {
      dispatch(removePlayerFromTeam({ teamId, playerId }));
    }
  };

  const handleRefresh = () => {
    dispatch(clearCache());
    dispatch(fetchAllPlayers());
  };

  useEffect(() => {
    if (displayedPlayers.length > allPlayers.length) {
      console.warn("Displayed players count exceeds total players:", {
        displayed: displayedPlayers.length,
        total: allPlayers.length,
        hasMore,
        currentPage,
      });
    }
  }, [displayedPlayers.length, allPlayers.length, hasMore, currentPage]);

  if (error && error.includes("API key")) {
    return (
      <div className="text-center py-8">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center mb-4">
            <Users className="h-12 w-12 text-yellow-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            API Key Required
          </h3>
          <p className="text-gray-600 mb-4">
            To fetch players from the BallDontLie API, you need to configure
            your API key.
          </p>
          <button
            onClick={() => (window.location.href = "#settings")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Settings
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={() => dispatch(fetchAllPlayers())}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {teamId
              ? isLocalTeam
                ? "Add Players to Team"
                : "Team Players"
              : "All Players"}
          </h2>
          {cacheAgeMinutes !== null && (
            <p className="text-sm text-gray-500 mt-1">
              Cache: {cacheAgeMinutes} minutes old
              {isCacheValid && <span className="text-green-600"> (Valid)</span>}
            </p>
          )}
          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Total: {combinedPlayers.length} players available</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Showing: {currentDisplay.length} players</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {loading && allPlayers.length === 0 ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading players...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player: AnyPlayer, index: number) => (
            <div
              key={player.id}
              ref={
                index === filteredPlayers.length - 1
                  ? lastPlayerElementRef
                  : null
              }
            >
              <PlayerCard
                player={player as Player}
                onAddToTeam={handleAddToTeam}
                onRemoveFromTeam={handleRemoveFromTeam}
                teamId={teamId}
              />
            </div>
          ))}
        </div>
      )}

      {loadingMore && (
        <div className="text-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 mt-2">Loading more players...</p>
        </div>
      )}

      {!loading && !loadingMore && hasMoreToLoad && (
        <div className="text-center">
          <button
            onClick={fetchMore}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Load More Players
          </button>
        </div>
      )}

      {!loading &&
        !loadingMore &&
        !hasMoreToLoad &&
        filteredPlayers.length > 0 && (
          <div className="text-center py-4">
            <p className="text-gray-500">All players loaded</p>
          </div>
        )}
    </div>
  );
}
