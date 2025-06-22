"use client";

import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import {
  LocalTeam,
  AnyPlayer,
  Team,
  APITeam,
  Player,
  fetchTeamPlayers,
} from "@/lib/slices/teamsSlice";
import { createOffer } from "@/lib/slices/offersSlice";
import { X, Euro, ChevronDown } from "lucide-react";

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  offeringTeam: Team;
}

export default function OfferModal({
  isOpen,
  onClose,
  offeringTeam,
}: OfferModalProps) {
  const dispatch = useAppDispatch();
  const { apiTeams, localTeams, teamPlayersLoading, transferredPlayerIds } =
    useAppSelector((state) => state.teams);

  const [selectedTeamId, setSelectedTeamId] = useState<string | number | "">(
    ""
  );
  const [selectedPlayerId, setSelectedPlayerId] = useState<
    string | number | ""
  >("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  const allTeams: (APITeam | LocalTeam)[] = [...apiTeams, ...localTeams];
  const otherTeams = allTeams.filter(
    (team) => team.id.toString() !== offeringTeam.id.toString()
  );
  const selectedTeam = allTeams.find(
    (team) => team.id.toString() === selectedTeamId.toString()
  );

  let isPlayerListLoading = false;
  if (selectedTeam && !("isLocal" in selectedTeam)) {
    isPlayerListLoading = teamPlayersLoading[selectedTeam.id];
  }

  useEffect(() => {
    if (
      selectedTeam &&
      !("isLocal" in selectedTeam) &&
      !selectedTeam.players &&
      !isPlayerListLoading
    ) {
      dispatch(fetchTeamPlayers(selectedTeam.id));
    }
  }, [selectedTeamId, selectedTeam, dispatch, isPlayerListLoading]);

  const handleOfferSubmit = () => {
    if (!selectedPlayerId || !selectedTeamId) return;

    const selectedPlayer = selectedTeam?.players?.find(
      (p: AnyPlayer) => p.id.toString() === selectedPlayerId.toString()
    );
    if (!selectedPlayer) return;

    const offerPrice = Number(price);
    if (isNaN(offerPrice) || offerPrice <= 0) {
      setError("Please enter a valid offer price.");
      return;
    }

    dispatch(
      createOffer({
        fromTeamId: offeringTeam.id,
        toTeamId: selectedTeamId,
        playerId: selectedPlayer.id,
        playerName: `${selectedPlayer.first_name} ${selectedPlayer.last_name}`,
        price: offerPrice,
      })
    );
    handleClose();
  };

  const resetForm = () => {
    setSelectedTeamId("");
    setSelectedPlayerId("");
    setPrice("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Make an Offer</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          <div>
            <label
              htmlFor="team-select"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              1. Select a Team
            </label>
            <div className="relative">
              <select
                id="team-select"
                value={selectedTeamId}
                onChange={(e) => {
                  setSelectedTeamId(e.target.value);
                  setSelectedPlayerId("");
                }}
                className="w-full appearance-none bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Select a team...
                </option>
                {otherTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className={!selectedTeamId ? "opacity-50" : ""}>
            <label
              htmlFor="player-select"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              2. Select a Player & Make Offer
            </label>
            <div className="relative">
              <select
                id="player-select"
                value={selectedPlayerId}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
                disabled={!selectedTeamId || isPlayerListLoading}
                className="w-full appearance-none bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              >
                {isPlayerListLoading ? (
                  <option>Loading players...</option>
                ) : (
                  <>
                    <option value="" disabled>
                      Select a player...
                    </option>
                    {(() => {
                      if (
                        !selectedTeam?.players ||
                        selectedTeam.players.length === 0
                      ) {
                        return (
                          <option disabled>
                            No players found for this team
                          </option>
                        );
                      }

                      let availablePlayers = selectedTeam.players;
                      if (!("isLocal" in selectedTeam)) {
                        const transferredIds =
                          transferredPlayerIds[selectedTeam.id] || [];
                        availablePlayers = availablePlayers.filter(
                          (p) => !transferredIds.includes(p.id as number)
                        );
                      }

                      if (availablePlayers.length === 0) {
                        return (
                          <option disabled>
                            All players on this team have been transferred
                          </option>
                        );
                      }

                      return availablePlayers.map((player: AnyPlayer) => (
                        <option key={player.id} value={player.id}>
                          {player.first_name} {player.last_name}
                        </option>
                      ));
                    })()}
                  </>
                )}
              </select>
              <ChevronDown className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {selectedPlayerId && (
              <div className="mt-4">
                <label
                  htmlFor="offer-price"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Offer Price
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Euro className="h-5 w-5" />
                  </span>
                  <input
                    type="number"
                    id="offer-price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 border-gray-300"
                    placeholder="Enter offer amount"
                  />
                </div>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={handleOfferSubmit}
            disabled={!selectedPlayerId || !price || isPlayerListLoading}
            className="px-6 py-2 text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Offer
          </button>
        </div>
      </div>
    </div>
  );
}
