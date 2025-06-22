import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Offer {
  id: string;
  fromTeamId: string | number;
  toTeamId: string | number;
  playerId: string | number;
  playerName: string;
  price: number;
  status: "pending" | "accepted" | "rejected";
}

interface OffersState {
  offers: Offer[];
}

const initialState: OffersState = {
  offers: [],
};

const offersSlice = createSlice({
  name: "offers",
  initialState,
  reducers: {
    hydrateOffers: (state) => {
      if (typeof window !== "undefined") {
        const savedOffers = localStorage.getItem("offers");
        if (savedOffers) {
          state.offers = JSON.parse(savedOffers);
        }
      }
    },
    createOffer: (
      state,
      action: PayloadAction<Omit<Offer, "id" | "status">>
    ) => {
      const newOffer: Offer = {
        ...action.payload,
        id: `offer_${Date.now()}`,
        status: "pending",
      };
      state.offers.push(newOffer);
      if (typeof window !== "undefined") {
        localStorage.setItem("offers", JSON.stringify(state.offers));
      }
    },
    updateOfferStatus: (
      state,
      action: PayloadAction<{
        offerId: string;
        status: "accepted" | "rejected";
      }>
    ) => {
      const offer = state.offers.find((o) => o.id === action.payload.offerId);
      if (offer) {
        offer.status = action.payload.status;
        if (typeof window !== "undefined") {
          localStorage.setItem("offers", JSON.stringify(state.offers));
        }
      }
    },
  },
});

export const { createOffer, updateOfferStatus, hydrateOffers } =
  offersSlice.actions;

export default offersSlice.reducer;
