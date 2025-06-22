"use client";

import { useAppSelector } from "@/lib/hooks";
import { TransferRecord, Team } from "@/lib/slices/teamsSlice";
import { Calendar, User, Repeat } from "lucide-react";

interface TransferHistoryProps {
  teamId: string | number;
  allTeams: Team[];
}

export default function TransferHistory({
  teamId,
  allTeams,
}: TransferHistoryProps) {
  const team = allTeams.find((t) => t.id.toString() === teamId.toString());
  const history = team && "transferHistory" in team ? team.transferHistory : [];

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-800">
          No Transfer History
        </h3>
        <p className="text-gray-500 mt-1">
          There have been no player transfers for this team yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((record, index) => (
        <div
          key={index}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <div className="flex items-center space-x-3">
            <Repeat className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-semibold text-gray-900">
                {record.playerName} transferred from {record.fromTeamName} to{" "}
                {record.toTeamName}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span>Price: €{record.price.toLocaleString()}</span>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(record.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
