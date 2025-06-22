"use client";

import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchTeamPlayers, Player } from "@/lib/slices/teamsSlice";
import PlayerCard from "../players/PlayerCard";
import { Loader2, Users, ArrowLeft } from "lucide-react";

interface TeamPlayersProps {
  teamId: number;
  teamName: string;
  onBack: () => void;
}

export default function TeamPlayers({
  teamId,
  teamName,
  onBack,
}: TeamPlayersProps) {
  const dispatch = useAppDispatch();
  const {
    apiTeams,
    teamPlayersLoading,
    teamPlayersError,
    transferredPlayerIds,
  } = useAppSelector((state: any) => state.teams);

  const observer = useRef<IntersectionObserver | null>(null);
  const displayLimit = 10;

  const team = apiTeams.find((t: any) => t.id === teamId);

  const allTeamPlayers = useMemo(() => {
    const players = team?.players || [];
    const transferredIds = transferredPlayerIds[teamId] || [];
    return players.filter(
      (player: Player) => !transferredIds.includes(player.id)
    );
  }, [team?.players, transferredPlayerIds, teamId]);

  const [displayedPlayers, setDisplayedPlayers] = useState<Player[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!team?.players && !teamPlayersLoading[teamId]) {
      dispatch(fetchTeamPlayers(teamId));
    }
  }, [dispatch, teamId, team, teamPlayersLoading]);

  useEffect(() => {
    if (allTeamPlayers.length > 0) {
      const initialPlayers = allTeamPlayers.slice(0, displayLimit);
      setDisplayedPlayers(initialPlayers);
      setCurrentPage(1);
      setHasMore(allTeamPlayers.length > displayLimit);
    }
  }, [allTeamPlayers]);

  useEffect(() => {
    if (currentPage === 1 || allTeamPlayers.length === 0) return;

    const start = (currentPage - 1) * displayLimit;
    const end = start + displayLimit;
    const newPlayers = allTeamPlayers.slice(start, end);

    setDisplayedPlayers((prev) => {
      const existingIds = new Set(prev.map((p: any) => p.id));
      const uniqueNew = newPlayers.filter(
        (p: Player) => !existingIds.has(p.id)
      );
      return [...prev, ...uniqueNew];
    });

    setHasMore(end < allTeamPlayers.length);
  }, [currentPage, allTeamPlayers]);

  const loadMorePlayers = () => {
    if (!hasMore || teamPlayersLoading[teamId]) return;
    setCurrentPage((prev) => prev + 1);
  };

  const lastPlayerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (teamPlayersLoading[teamId]) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMorePlayers();
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore, teamPlayersLoading, teamId]
  );

  const handleRetry = () => {
    dispatch(fetchTeamPlayers(teamId));
    setDisplayedPlayers([]);
    setCurrentPage(1);
    setHasMore(true);
  };

  const renderHeader = () => (
    <div className="flex items-center space-x-4">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Teams</span>
      </button>
    </div>
  );

  if (teamPlayersLoading[teamId] && displayedPlayers.length === 0) {
    return (
      <div className="space-y-6">
        {/* {renderHeader()} */}
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading team players...</p>
        </div>
      </div>
    );
  }

  if (teamPlayersError[teamId]) {
    return (
      <div className="space-y-6">
        {/* {renderHeader()} */}
        <div className="text-center py-8">
          <p className="text-red-600">Error: {teamPlayersError[teamId]}</p>
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* {renderHeader()} */}

      <div className="bg-white rounded-lg p-6">
        {/* <div className="flex items-center space-x-3 mb-6">
          <Users className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            {teamName} - Players
          </h2>
        </div> */}

        <div className="mb-4 text-sm text-gray-600">
          <p>Total Players: {allTeamPlayers.length}</p>
          <p>
            Showing: {displayedPlayers.length} of {allTeamPlayers.length}
          </p>
        </div>

        {displayedPlayers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No players found for this team.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedPlayers.map((player, index) => (
              <div
                key={player.id}
                ref={
                  index === displayedPlayers.length - 1 && hasMore
                    ? lastPlayerRef
                    : undefined
                }
              >
                <PlayerCard
                  player={player}
                  onAddToTeam={() => {}}
                  onRemoveFromTeam={() => {}}
                />
              </div>
            ))}
          </div>
        )}

        {teamPlayersLoading[teamId] && displayedPlayers.length > 0 && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}

        {!hasMore && displayedPlayers.length > 0 && (
          <div className="text-center py-4">
            <p className="text-gray-500">
              All {displayedPlayers.length} team players loaded.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
