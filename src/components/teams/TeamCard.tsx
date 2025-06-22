"use client";

import { APITeam, LocalTeam, Player, AnyPlayer } from "@/lib/slices/teamsSlice";
import { Edit, Trash2, Users, Plus } from "lucide-react";

type Team = APITeam | LocalTeam;

interface TeamCardProps {
  team: Team;
  onEdit?: (team: LocalTeam) => void;
  onDelete?: (team: Team) => void;
  onViewPlayers: (teamId: string | number) => void;
  onAddPlayers?: (teamId: string | number) => void;
}

export default function TeamCard({
  team,
  onEdit,
  onDelete,
  onViewPlayers,
  onAddPlayers,
}: TeamCardProps) {
  const isLocalTeam = "isLocal" in team;
  const hasPlayers = isLocalTeam && team.players.length > 0;
  const apiTeamPlayerCount =
    !isLocalTeam && team.players ? team.players.length : 0;

  const handleDelete = () => {
    onDelete?.(team);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {team.name}
          </h3>
          <div className="space-y-1 text-sm text-gray-600">
            {!isLocalTeam && (
              <>
                <p>
                  <span className="font-medium">City:</span> {team.city}
                </p>
                <p>
                  <span className="font-medium">Conference:</span>{" "}
                  {team.conference}
                </p>
                <p>
                  <span className="font-medium">Division:</span> {team.division}
                </p>
                {apiTeamPlayerCount > 0 && (
                  <p>
                    <span className="font-medium">Players:</span>{" "}
                    {apiTeamPlayerCount}
                  </p>
                )}
              </>
            )}
            {isLocalTeam && (
              <>
                <p>
                  <span className="font-medium">Region:</span> {team.region}
                </p>
                <p>
                  <span className="font-medium">Country:</span> {team.country}
                </p>
                <p>
                  <span className="font-medium">Players:</span>{" "}
                  {team.playerCount}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          {isLocalTeam && onAddPlayers && (
            <button
              onClick={() => onAddPlayers(team.id)}
              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
              title="Add players"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onViewPlayers(team.id)}
            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
            title="View players"
          >
            <Users className="h-4 w-4" />
          </button>
          {isLocalTeam && onEdit && (
            <button
              onClick={() => onEdit(team)}
              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
              title="Edit team"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
              title={isLocalTeam ? "Delete team" : "Hide from API teams"}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {hasPlayers && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Team Players:
          </h4>
          <div className="space-y-1">
            {(team.players as AnyPlayer[]).slice(0, 3).map((player, idx) => {
              if (
                "first_name" in player &&
                "last_name" in player &&
                "position" in player
              ) {
                return (
                  <p key={player.id} className="text-xs text-gray-600">
                    {player.first_name} {player.last_name} ({player.position})
                  </p>
                );
              }
              return null;
            })}
            {team.players.length > 3 && (
              <p className="text-xs text-gray-500">
                +{team.players.length - 3} more players
              </p>
            )}
          </div>
        </div>
      )}

      {!isLocalTeam && (
        <div className="mt-4 p-2 bg-blue-50 rounded text-xs text-blue-700">
          API Team - Click view players to see team roster
        </div>
      )}
    </div>
  );
}
