"use client";

import { Player, APITeam, LocalTeam, AnyPlayer } from "@/lib/slices/teamsSlice";
import { useAppSelector } from "@/lib/hooks";
import { Plus, Minus } from "lucide-react";

interface PlayerCardProps {
  player: Player;
  onAddToTeam: (player: Player) => void;
  onRemoveFromTeam: (playerId: number) => void;
  teamId?: string | number;
}

export default function PlayerCard({
  player,
  onAddToTeam,
  onRemoveFromTeam,
  teamId,
}: PlayerCardProps) {
  const { apiTeams, localTeams } = useAppSelector((state) => state.teams);

  const allTeams: (APITeam | LocalTeam)[] = [...apiTeams, ...localTeams];
  const playerTeam = allTeams.find(
    (team) =>
      "players" in team &&
      team.players?.some((p: AnyPlayer) => p.id === player.id)
  );

  const isInCurrentTeam = teamId
    ? allTeams
        .find((t: APITeam | LocalTeam) => t.id === teamId)
        ?.players?.some((p: AnyPlayer) => p.id === player.id)
    : false;

  const canAddToTeam = !playerTeam && teamId && typeof teamId === "string";
  const canRemoveFromTeam = isInCurrentTeam;

  const handleAddToTeam = () => {
    console.log("Add to team clicked:", {
      player: player.first_name + " " + player.last_name,
      teamId,
      canAddToTeam,
      playerTeam: playerTeam?.name,
    });
    if (canAddToTeam) {
      onAddToTeam(player);
    }
  };

  const handleRemoveFromTeam = () => {
    console.log("Remove from team clicked:", {
      player: player.first_name + " " + player.last_name,
      teamId,
      canRemoveFromTeam,
    });
    if (canRemoveFromTeam) {
      onRemoveFromTeam(player.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {player.first_name} {player.last_name}
          </h3>
        </div>
        <div className="flex space-x-2">
          {canAddToTeam && (
            <button
              onClick={handleAddToTeam}
              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
              title="Add to team"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
          {canRemoveFromTeam && (
            <button
              onClick={handleRemoveFromTeam}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              title="Remove from team"
            >
              <Minus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Team:</span>{" "}
          {playerTeam?.name ||
            (player as Player & { team?: { name: string } }).team?.name ||
            "Free Agent"}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">City:</span>{" "}
          {player.team?.city || "N/A"}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Conference:</span>{" "}
          {player.team?.conference || "N/A"}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">National Team:</span>{" "}
          {(player as Player & { national_team?: string }).national_team ||
            "N/A"}
        </p>
      </div>

      {playerTeam && teamId && playerTeam.id !== teamId && (
        <div className="mt-3 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
          Player is on another team: {playerTeam.name}
        </div>
      )}

      {/* {process.env.NODE_ENV === "development" && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
          <p>
            Debug: teamId={teamId}, canAdd={String(canAddToTeam)}, canRemove=
            {String(canRemoveFromTeam)}
          </p>
          <p>Player in team: {playerTeam?.name || "None"}</p>
        </div>
      )} */}
    </div>
  );
}
