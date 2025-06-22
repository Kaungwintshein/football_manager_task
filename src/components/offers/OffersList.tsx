"use client";

import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { updateOfferStatus, Offer } from "@/lib/slices/offersSlice";
import { transferPlayer, Team } from "@/lib/slices/teamsSlice";
import { Check, X, ArrowRight } from "lucide-react";

interface OffersListProps {
  teamId: string | number;
  allTeams: Team[];
}

export default function OffersList({ teamId, allTeams }: OffersListProps) {
  const dispatch = useAppDispatch();
  const { offers } = useAppSelector((state) => state.offers);
  const { localTeams } = useAppSelector((state) => state.teams);

  const incomingOffers = offers.filter(
    (offer) =>
      offer.toTeamId.toString() === teamId.toString() &&
      offer.status === "pending"
  );

  const getTeamName = (id: string | number) => {
    const team = allTeams.find((t) => t.id.toString() === id.toString());
    return team?.name || `Team ID: ${id}`;
  };

  const handleAcceptOffer = (offer: Offer) => {
    dispatch(
      transferPlayer({
        fromTeamId: offer.toTeamId,
        toTeamId: offer.fromTeamId,
        playerId: offer.playerId,
        price: offer.price,
      })
    );
    dispatch(updateOfferStatus({ offerId: offer.id, status: "accepted" }));
  };

  const handleRejectOffer = (offerId: string) => {
    dispatch(updateOfferStatus({ offerId, status: "rejected" }));
  };

  const canAcceptOffer = (offer: Offer) => {
    return localTeams.some(
      (t) => t.id.toString() === offer.fromTeamId.toString()
    );
  };

  if (incomingOffers.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-800">No Pending Offers</h3>
        <p className="text-gray-500 mt-1">
          You have no incoming offers for your players at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {incomingOffers.map((offer) => {
        const isAcceptable = canAcceptOffer(offer);
        return (
          <div
            key={offer.id}
            className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between"
          >
            <div>
              <p className="font-semibold text-gray-900">{offer.playerName}</p>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <span>From: {getTeamName(offer.fromTeamId)}</span>
                <ArrowRight className="h-4 w-4 mx-2 text-gray-400" />
                <span>Offer: €{offer.price.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="relative group">
                <button
                  onClick={() => isAcceptable && handleAcceptOffer(offer)}
                  disabled={!isAcceptable}
                  className="p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <Check className="h-5 w-5" />
                </button>
                {!isAcceptable && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Players can only be transferred to local teams.
                  </div>
                )}
              </div>
              <button
                onClick={() => handleRejectOffer(offer.id)}
                className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                title="Reject Offer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
