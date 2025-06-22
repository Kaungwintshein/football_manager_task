import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { addCustomPlayerToTeam, CustomPlayer } from "./playersSlice";

export interface Player {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  team: {
    id: number;
    name: string;
    city: string;
    conference: string;
    division: string;
    stadium?: string;
  };
}

export interface APITeam {
  id: number;
  name: string;
  city: string;
  conference: string;
  division: string;
  stadium?: string;
  players?: Player[];
}

export type AnyPlayer = Player | CustomPlayer;

export interface TransferRecord {
  playerId: string | number;
  playerName: string;
  fromTeamName: string;
  toTeamName: string;
  price: number;
  date: string;
}

export interface LocalTeam {
  id: string;
  name: string;
  playerCount: number;
  region: string;
  country: string;
  players: AnyPlayer[];
  isLocal: true;
  transferHistory?: TransferRecord[];
}

export type Team = APITeam | LocalTeam;

interface TeamsState {
  apiTeams: APITeam[];
  localTeams: LocalTeam[];
  loading: boolean;
  error: string | null;
  teamPlayersLoading: Record<number, boolean>;
  teamPlayersError: Record<number, string | null>;
  isHydrated: boolean;
  lastApiFetch: number | null;
  hiddenApiTeams: APITeam[];
  cacheExpiry: number;
  transferredPlayerIds: Record<number, number[]>;
}

const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

const initialState: TeamsState = {
  apiTeams: [],
  localTeams: [],
  loading: false,
  error: null,
  teamPlayersLoading: {},
  teamPlayersError: {},
  isHydrated: false,
  lastApiFetch: null,
  hiddenApiTeams: [],
  cacheExpiry: CACHE_EXPIRY_TIME,
  transferredPlayerIds: {},
};

export const fetchTeams = createAsyncThunk(
  "teams/fetchTeams",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { teams: TeamsState };
      const { lastApiFetch, cacheExpiry } = state.teams;

      const now = Date.now();
      if (lastApiFetch && now - lastApiFetch < cacheExpiry) {
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

      const response = await fetch(
        "https://api.balldontlie.io/epl/v1/teams?season=2024",
        {
          headers: {
            Authorization: apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          return rejectWithValue("Invalid API key. Please check your API key.");
        }
        return rejectWithValue(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return { data, fromCache: false };
    } catch {
      return rejectWithValue("Failed to fetch teams");
    }
  }
);

export const fetchTeamPlayers = createAsyncThunk(
  "teams/fetchTeamPlayers",
  async (teamId: number, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { teams: TeamsState };
      const { apiTeams } = state.teams;

      const team = apiTeams.find((t) => t.id === teamId);
      if (team?.players) {
        return { teamId, data: { data: team.players }, fromCache: true };
      }

      const apiKey =
        process.env.NEXT_PUBLIC_BALLDONTLIE_API_KEY ||
        localStorage.getItem("balldontlie_api_key");

      if (!apiKey) {
        return rejectWithValue(
          "API key is required. Please add your API key in the settings."
        );
      }

      const response = await fetch(
        `https://api.balldontlie.io/epl/v1/teams/${teamId}/players?season=2024`,
        {
          headers: {
            Authorization: apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          return rejectWithValue("Invalid API key. Please check your API key.");
        }
        return rejectWithValue(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return { teamId, data, fromCache: false };
    } catch {
      return rejectWithValue("Failed to fetch team players");
    }
  }
);

const teamsSlice = createSlice({
  name: "teams",
  initialState,
  reducers: {
    hydrate: (state) => {
      if (typeof window !== "undefined") {
        const savedApiTeams = localStorage.getItem("apiTeams");
        const savedLocalTeams = localStorage.getItem("localTeams");
        const savedHiddenTeams = localStorage.getItem("hiddenApiTeams");
        const savedLastFetch = localStorage.getItem("lastApiFetch");
        const savedTransferred = localStorage.getItem("transferredPlayerIds");

        if (savedApiTeams) {
          state.apiTeams = JSON.parse(savedApiTeams);
        }
        if (savedLocalTeams) {
          state.localTeams = JSON.parse(savedLocalTeams);
        }
        if (savedHiddenTeams) {
          state.hiddenApiTeams = JSON.parse(savedHiddenTeams);
        }
        if (savedLastFetch) {
          state.lastApiFetch = parseInt(savedLastFetch);
        }
        if (savedTransferred) {
          state.transferredPlayerIds = JSON.parse(savedTransferred);
        }
      }
      state.isHydrated = true;
    },
    createLocalTeam: (
      state,
      action: PayloadAction<Omit<LocalTeam, "id" | "isLocal">>
    ) => {
      const newTeam: LocalTeam = {
        ...action.payload,
        id: Date.now().toString(),
        isLocal: true,
      };
      state.localTeams.push(newTeam);
      if (typeof window !== "undefined") {
        localStorage.setItem("localTeams", JSON.stringify(state.localTeams));
      }
    },
    updateLocalTeam: (state, action: PayloadAction<LocalTeam>) => {
      const index = state.localTeams.findIndex(
        (team) => team.id === action.payload.id
      );
      if (index !== -1) {
        state.localTeams[index] = action.payload;
        if (typeof window !== "undefined") {
          localStorage.setItem("localTeams", JSON.stringify(state.localTeams));
        }
      }
    },
    deleteLocalTeam: (state, action: PayloadAction<string>) => {
      state.localTeams = state.localTeams.filter(
        (team) => team.id !== action.payload
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("localTeams", JSON.stringify(state.localTeams));
      }
    },
    deleteApiTeam: (state, action: PayloadAction<APITeam>) => {
      const teamToHide = action.payload;
      if (!state.hiddenApiTeams.some((t) => t.id === teamToHide.id)) {
        state.hiddenApiTeams.push(teamToHide);
        state.apiTeams = state.apiTeams.filter(
          (team) => team.id !== teamToHide.id
        );
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "hiddenApiTeams",
            JSON.stringify(state.hiddenApiTeams)
          );
          localStorage.setItem("apiTeams", JSON.stringify(state.apiTeams));
        }
      }
    },
    restoreApiTeam: (state, action: PayloadAction<APITeam>) => {
      const teamToRestore = action.payload;
      state.apiTeams.push(teamToRestore);
      state.hiddenApiTeams = state.hiddenApiTeams.filter(
        (team) => team.id !== teamToRestore.id
      );
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "hiddenApiTeams",
          JSON.stringify(state.hiddenApiTeams)
        );
        localStorage.setItem("apiTeams", JSON.stringify(state.apiTeams));
      }
    },
    clearCache: (state) => {
      state.lastApiFetch = null;
      state.apiTeams = [];
      state.hiddenApiTeams = [];
      if (typeof window !== "undefined") {
        localStorage.removeItem("lastApiFetch");
        localStorage.removeItem("apiTeams");
        localStorage.removeItem("hiddenApiTeams");
      }
    },
    addPlayerToTeam: (
      state,
      action: PayloadAction<{ teamId: string | number; player: Player }>
    ) => {
      console.log("addPlayerToTeam action called:", {
        teamId: action.payload.teamId,
        player:
          action.payload.player.first_name +
          " " +
          action.payload.player.last_name,
        localTeamsCount: state.localTeams.length,
      });

      const localTeam = state.localTeams.find(
        (t) => t.id === action.payload.teamId
      );

      console.log("Found local team:", localTeam?.name || "Not found");

      if (localTeam) {
        const playerInOtherTeam = [...state.apiTeams, ...state.localTeams].some(
          (t) =>
            t.id !== action.payload.teamId &&
            "players" in t &&
            t.players &&
            t.players.some((p) => p.id === action.payload.player.id)
        );

        console.log("Player in other team:", playerInOtherTeam);

        if (
          !playerInOtherTeam &&
          !localTeam.players.some((p) => p.id === action.payload.player.id)
        ) {
          console.log("Adding player to team:", localTeam.name);
          localTeam.players.push(action.payload.player);
          localTeam.playerCount = localTeam.players.length;
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "localTeams",
              JSON.stringify(state.localTeams)
            );
          }
        } else {
          console.log("Player not added - already in team or in other team");
        }
      } else {
        console.log("Local team not found for teamId:", action.payload.teamId);
      }
    },
    removePlayerFromTeam: (
      state,
      action: PayloadAction<{ teamId: string | number; playerId: number }>
    ) => {
      const localTeam = state.localTeams.find(
        (t) => t.id === action.payload.teamId
      );
      if (localTeam) {
        localTeam.players = localTeam.players.filter(
          (p) => p.id !== action.payload.playerId
        );
        localTeam.playerCount = localTeam.players.length;
        if (typeof window !== "undefined") {
          localStorage.setItem("localTeams", JSON.stringify(state.localTeams));
        }
      }
    },
    transferPlayer: (
      state,
      action: PayloadAction<{
        fromTeamId: string | number;
        toTeamId: string | number;
        playerId: string | number;
        price: number;
      }>
    ) => {
      const { fromTeamId, toTeamId, playerId, price } = action.payload;

      const toTeam = state.localTeams.find(
        (t) => t.id.toString() === toTeamId.toString()
      );
      if (!toTeam) return;

      let playerToTransfer: AnyPlayer | undefined;
      let fromTeam: APITeam | LocalTeam | undefined;

      fromTeam = state.localTeams.find(
        (t) => t.id.toString() === fromTeamId.toString()
      );
      if (fromTeam) {
        const playerIndex = fromTeam.players.findIndex(
          (p) => p.id.toString() === playerId.toString()
        );
        if (playerIndex > -1) {
          [playerToTransfer] = fromTeam.players.splice(playerIndex, 1);
          fromTeam.playerCount = fromTeam.players.length;
        }
      } else {
        fromTeam = state.apiTeams.find(
          (t) => t.id.toString() === fromTeamId.toString()
        );
        if (fromTeam) {
          playerToTransfer = fromTeam.players?.find(
            (p) => p.id.toString() === playerId.toString()
          );
          if (playerToTransfer) {
            if (!state.transferredPlayerIds[fromTeam.id]) {
              state.transferredPlayerIds[fromTeam.id] = [];
            }
            const numPlayerId =
              typeof playerId === "string" ? parseInt(playerId, 10) : playerId;
            if (
              !state.transferredPlayerIds[fromTeam.id].includes(numPlayerId)
            ) {
              state.transferredPlayerIds[fromTeam.id].push(numPlayerId);
            }
          }
        }
      }

      if (playerToTransfer && fromTeam) {
        toTeam.players.push(playerToTransfer);
        toTeam.playerCount = toTeam.players.length;

        const transferRecord: TransferRecord = {
          playerId,
          playerName: `${playerToTransfer.first_name} ${playerToTransfer.last_name}`,
          fromTeamName: fromTeam.name,
          toTeamName: toTeam.name,
          price,
          date: new Date().toISOString(),
        };

        if (!toTeam.transferHistory) toTeam.transferHistory = [];
        toTeam.transferHistory.push({ ...transferRecord });

        if ("isLocal" in fromTeam) {
          if (!fromTeam.transferHistory) fromTeam.transferHistory = [];
          fromTeam.transferHistory.push({ ...transferRecord });
        }
      }

      localStorage.setItem("localTeams", JSON.stringify(state.localTeams));
      localStorage.setItem(
        "transferredPlayerIds",
        JSON.stringify(state.transferredPlayerIds)
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.fromCache) {
          return;
        }

        if (action.payload.data) {
          const hiddenTeamIds = state.hiddenApiTeams.map((t) => t.id);
          const filteredTeams = action.payload.data.data.filter(
            (team: APITeam) => !hiddenTeamIds.includes(team.id)
          );

          state.apiTeams = filteredTeams;
          state.lastApiFetch = Date.now();

          if (typeof window !== "undefined") {
            localStorage.setItem("lastApiFetch", state.lastApiFetch.toString());
            localStorage.setItem("apiTeams", JSON.stringify(state.apiTeams));
          }
        }
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTeamPlayers.pending, (state, action) => {
        const teamId = action.meta.arg;
        state.teamPlayersLoading[teamId] = true;
        state.teamPlayersError[teamId] = null;
      })
      .addCase(fetchTeamPlayers.fulfilled, (state, action) => {
        const { teamId, data, fromCache } = action.payload;
        state.teamPlayersLoading[teamId] = false;

        if (fromCache) {
          return;
        }

        if (data.data) {
          const team = state.apiTeams.find((t) => t.id === teamId);
          if (team) {
            team.players = data.data;
          }
        }
      })
      .addCase(fetchTeamPlayers.rejected, (state, action) => {
        const teamId = action.meta.arg;
        state.teamPlayersLoading[teamId] = false;
        state.teamPlayersError[teamId] = action.payload as string;
      })
      .addCase(addCustomPlayerToTeam, (state, action) => {
        const { teamId, player } = action.payload;
        const team = state.localTeams.find((t) => t.id === teamId);
        if (team) {
          team.players.push(player);
          team.playerCount = team.players.length;
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "localTeams",
              JSON.stringify(state.localTeams)
            );
          }
        }
      });
  },
});

export const {
  hydrate,
  createLocalTeam,
  updateLocalTeam,
  deleteLocalTeam,
  deleteApiTeam,
  restoreApiTeam,
  clearCache,
  addPlayerToTeam,
  removePlayerFromTeam,
  transferPlayer,
} = teamsSlice.actions;

export default teamsSlice.reducer;
