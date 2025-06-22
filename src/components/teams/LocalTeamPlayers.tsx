"use client";

import { useAppDispatch } from "@/lib/hooks";
import { removePlayerFromTeam } from "@/lib/slices/teamsSlice";
import { LocalTeam, AnyPlayer, Player } from "@/lib/slices/teamsSlice";
import { Users, Minus } from "lucide-react";
import PlayerCard from "../players/PlayerCard";

interface LocalTeamPlayersProps {
  team: LocalTeam;
}

export default function LocalTeamPlayers({ team }: LocalTeamPlayersProps) {
  const dispatch = useAppDispatch();

  const handleRemovePlayer = (playerId: number) => {
    dispatch(removePlayerFromTeam({ teamId: team.id, playerId }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mt-6 border-t pt-6">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-900">
            Team Roster ({team.playerCount})
          </h2>
        </div>
      </div>

      {team.players.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">
            No players in this team yet
          </p>
          <p className="text-gray-400 text-sm">
            Make an offer for an existing player or create one to build your
            roster.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.players.map((player: AnyPlayer) => (
            <div
              key={player.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <PlayerCard
                player={player as Player}
                onAddToTeam={() => {}}
                onRemoveFromTeam={() => {}}
              />
              {/* <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {player.first_name} {player.last_name}
                  </h3>
                  <p className="text-sm text-gray-600 capitalize">
                    Position: {player.position || "N/A"}
                  </p>
                </div>
                <button
                  onClick={() => handleRemovePlayer(player.id as number)}
                  className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                  title="Remove from team"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>

              <div className="text-xs text-gray-500 mt-2">
                <p>
                  {"isCustom" in player
                    ? `National Team: ${player.national_team}`
                    : `Original Team: ${
                        (player as Player).team?.name || "N/A"
                      }`}
                </p>
              </div> */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
