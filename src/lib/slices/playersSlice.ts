import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface Player {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  height_feet: number | null;
  height_inches: number | null;
  weight_pounds: number | null;
  team: {
    id: number;
    name: string;
    city: string;
    conference: string;
    division: string;
  };
}

export interface CustomPlayer {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  position: string;
  national_team: string;
  height: number;
  weight: number;
  birth_date: string;
  isCustom: true;
}

interface PlayersState {
  allPlayers: Player[];
  customPlayers: CustomPlayer[];
  displayedPlayers: Player[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  displayLimit: number;
  isHydrated: boolean;
  lastApiFetch: number | null;
  cacheExpiry: number;
  totalPlayersFetched: number;
}

const CACHE_EXPIRY_TIME = 5 * 60 * 1000;
const DISPLAY_LIMIT = 10;

const initialState: PlayersState = {
  allPlayers: [],
  customPlayers: [],
  displayedPlayers: [],
  loading: false,
  loadingMore: false,
  error: null,
  hasMore: true,
  currentPage: 1,
  displayLimit: DISPLAY_LIMIT,
  isHydrated: false,
  lastApiFetch: null,
  cacheExpiry: CACHE_EXPIRY_TIME,
  totalPlayersFetched: 0,
};

export const fetchAllPlayers = createAsyncThunk(
  "players/fetchAllPlayers",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { players: PlayersState };
      const { lastApiFetch, cacheExpiry, allPlayers } = state.players;

      const now = Date.now();
      if (
        lastApiFetch &&
        now - lastApiFetch < cacheExpiry &&
        allPlayers.length > 0
      ) {
        return { fromCache: true };
      }

      const apiKey =
        process.env.NEXT_PUBLIC_BALLDONTLIE_API_KEY ||
        localStorage.getItem("balldontlie_api_key");

      if (!apiKey) {
        return rejectWithValue(
          "API key is required. Please add your API key in the settings."
        );
      }

      let allPlayersData: Player[] = [];
      let currentPage = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const response = await fetch(
          `https://www.balldontlie.io/api/v1/players?page=${currentPage}&per_page=100`,
          {
            headers: {
              Authorization: apiKey,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            return rejectWithValue(
              "Invalid API key. Please check your API key."
            );
          }
          return rejectWithValue(
            `API request failed: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        if (data.data && data.data.length > 0) {
          const newPlayers = data.data.filter(
            (player: Player) =>
              !allPlayersData.some(
                (existingPlayer) => existingPlayer.id === player.id
              )
          );
          allPlayersData = [...allPlayersData, ...newPlayers];
          currentPage++;

          if (data.data.length < 100) {
            hasMorePages = false;
          }
        } else {
          hasMorePages = false;
        }
      }

      return {
        data: { data: allPlayersData },
        fromCache: false,
        totalFetched: allPlayersData.length,
      };
    } catch (error) {
      return rejectWithValue("Failed to fetch players");
    }
  }
);

const playersSlice = createSlice({
  name: "players",
  initialState,
  reducers: {
    hydrate: (state) => {
      if (typeof window !== "undefined") {
        const savedLastFetch = localStorage.getItem("playersLastApiFetch");
        const savedAllPlayers = localStorage.getItem("allPlayers");
        const savedCurrentPage = localStorage.getItem("playersCurrentPage");

        if (savedLastFetch) {
          state.lastApiFetch = parseInt(savedLastFetch);
        }
        if (savedAllPlayers) {
          const parsedPlayers = JSON.parse(savedAllPlayers);

          const uniquePlayers = parsedPlayers.filter(
            (player: Player, index: number, self: Player[]) =>
              index === self.findIndex((p) => p.id === player.id)
          );

          state.allPlayers = uniquePlayers;

          const savedPage = savedCurrentPage ? parseInt(savedCurrentPage) : 1;
          state.currentPage = savedPage;

          const endIndex = Math.min(
            savedPage * state.displayLimit,
            uniquePlayers.length
          );
          state.displayedPlayers = uniquePlayers.slice(0, endIndex);
          state.hasMore = endIndex < uniquePlayers.length;
        }

        const savedCustomPlayers = localStorage.getItem("customPlayers");
        if (savedCustomPlayers) {
          state.customPlayers = JSON.parse(savedCustomPlayers);
        }
      }
      state.isHydrated = true;
    },
    clearCache: (state) => {
      state.lastApiFetch = null;
      state.allPlayers = [];
      state.customPlayers = [];
      state.displayedPlayers = [];
      state.currentPage = 1;
      state.hasMore = true;
      state.totalPlayersFetched = 0;
      if (typeof window !== "undefined") {
        localStorage.removeItem("playersLastApiFetch");
        localStorage.removeItem("allPlayers");
        localStorage.removeItem("playersCurrentPage");
        localStorage.removeItem("customPlayers");
      }
    },
    resetPlayers: (state) => {
      state.displayedPlayers = [];
      state.currentPage = 1;
      state.hasMore = true;
      state.error = null;
    },

    loadMorePlayers: (state) => {
      if (state.loadingMore) return;

      if (state.displayedPlayers.length >= state.allPlayers.length) {
        console.warn("CRITICAL: Displayed players exceed total, resetting...", {
          displayed: state.displayedPlayers.length,
          total: state.allPlayers.length,
        });
        state.displayedPlayers = state.allPlayers.slice(0, state.displayLimit);
        state.currentPage = 1;
        state.hasMore = state.allPlayers.length > state.displayLimit;
        state.loadingMore = false;
        return;
      }

      const nextPage = state.currentPage + 1;
      const startIndex = (nextPage - 1) * state.displayLimit;

      if (startIndex >= state.allPlayers.length) {
        state.hasMore = false;
        return;
      }

      if (state.displayedPlayers.length >= state.allPlayers.length) {
        state.hasMore = false;
        return;
      }

      state.loadingMore = true;

      const endIndex = Math.min(
        startIndex + state.displayLimit,
        state.allPlayers.length
      );
      const newPlayers = state.allPlayers.slice(startIndex, endIndex);

      const existingPlayerIds = new Set(
        state.displayedPlayers.map((player) => player.id)
      );
      const uniqueNewPlayers = newPlayers.filter(
        (player) => !existingPlayerIds.has(player.id)
      );

      console.log("Loading more players:", {
        currentPage: state.currentPage,
        nextPage,
        startIndex,
        endIndex,
        newPlayersCount: newPlayers.length,
        uniqueNewPlayersCount: uniqueNewPlayers.length,
        currentDisplayedCount: state.displayedPlayers.length,
        totalPlayers: state.allPlayers.length,
      });

      state.displayedPlayers = [...state.displayedPlayers, ...uniqueNewPlayers];
      state.currentPage = nextPage;
      state.hasMore = endIndex < state.allPlayers.length;
      state.loadingMore = false;

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "playersCurrentPage",
          state.currentPage.toString()
        );
      }
    },
    createCustomPlayer: (
      state,
      action: PayloadAction<Omit<CustomPlayer, "id" | "name" | "isCustom">>
    ) => {
      const { first_name, last_name } = action.payload;
      const fullName = `${first_name} ${last_name}`.toLowerCase();

      const nameExists = [...state.allPlayers, ...state.customPlayers].some(
        (p) => `${p.first_name} ${p.last_name}`.toLowerCase() === fullName
      );

      if (nameExists) {
        console.error("Player with this name already exists.");
        return;
      }

      const newPlayer: CustomPlayer = {
        ...action.payload,
        id: `custom_${Date.now()}`,
        name: `${first_name} ${last_name}`,
        isCustom: true,
      };
      state.customPlayers.push(newPlayer);
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "customPlayers",
          JSON.stringify(state.customPlayers)
        );
      }
    },
    addCustomPlayerToTeam: (
      state,
      action: PayloadAction<{ teamId: string | number; player: CustomPlayer }>
    ) => {},

    resetPagination: (state) => {
      state.currentPage = 1;
      const resetEndIndex = Math.min(
        state.displayLimit,
        state.allPlayers.length
      );
      state.displayedPlayers = state.allPlayers.slice(0, resetEndIndex);
      state.hasMore = resetEndIndex < state.allPlayers.length;

      if (typeof window !== "undefined") {
        localStorage.setItem("playersCurrentPage", "1");
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPlayers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPlayers.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.fromCache) {
          return;
        }

        if (action.payload.data) {
          const { data, totalFetched } = action.payload;

          const uniquePlayers = data.data.filter(
            (player: Player, index: number, self: Player[]) =>
              index === self.findIndex((p) => p.id === player.id)
          );

          state.allPlayers = uniquePlayers;
          state.totalPlayersFetched = totalFetched || uniquePlayers.length;

          state.currentPage = 1;
          const initialEndIndex = Math.min(
            state.displayLimit,
            uniquePlayers.length
          );
          state.displayedPlayers = uniquePlayers.slice(0, initialEndIndex);
          state.hasMore = initialEndIndex < uniquePlayers.length;

          state.lastApiFetch = Date.now();

          if (typeof window !== "undefined") {
            localStorage.setItem(
              "playersLastApiFetch",
              state.lastApiFetch.toString()
            );
            localStorage.setItem(
              "allPlayers",
              JSON.stringify(state.allPlayers)
            );
            localStorage.setItem("playersCurrentPage", "1");
          }
        }
      })
      .addCase(fetchAllPlayers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  hydrate,
  clearCache,
  resetPlayers,
  loadMorePlayers,
  createCustomPlayer,
  addCustomPlayerToTeam,
  resetPagination,
} = playersSlice.actions;

export default playersSlice.reducer;
