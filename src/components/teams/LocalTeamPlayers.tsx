"use client";

import { LocalTeam, AnyPlayer, Player } from "@/lib/slices/teamsSlice";
import { Users } from "lucide-react";
import PlayerCard from "../players/PlayerCard";

interface LocalTeamPlayersProps {
  team: LocalTeam;
}

export default function LocalTeamPlayers({ team }: LocalTeamPlayersProps) {
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
