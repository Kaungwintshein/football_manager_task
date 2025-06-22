"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchTeams,
  createLocalTeam,
  updateLocalTeam,
  deleteLocalTeam,
  deleteApiTeam,
  restoreApiTeam,
  clearCache,
} from "@/lib/slices/teamsSlice";
import { LocalTeam, APITeam, Team } from "@/lib/slices/teamsSlice";
import TeamCard from "./TeamCard";
import TeamForm from "./TeamForm";
import TeamPlayers from "./TeamPlayers";
import {
  Plus,
  ArrowLeft,
  Loader2,
  Key,
  Settings,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Search,
  Filter,
  Globe,
} from "lucide-react";
import LocalTeamPlayers from "./LocalTeamPlayers";
import PlayersList from "../players/PlayersList";
import OffersList from "../offers/OffersList";
import TransferHistory from "../transfers/TransferHistory";
import PlayerForm from "../players/PlayerForm";
import OfferModal from "../players/OfferModal";

type Tab = "roster" | "offers" | "history";

export default function TeamsList() {
  const dispatch = useAppDispatch();
  const { apiTeams, localTeams, loading, error, lastApiFetch, hiddenApiTeams } =
    useAppSelector((state: any) => state.teams);
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<LocalTeam | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | number | null>(
    null
  );
  const [showDeletedTeams, setShowDeletedTeams] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    team: LocalTeam | APITeam;
    isApiTeam: boolean;
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const allTeams = useMemo(
    () => [...apiTeams, ...localTeams],
    [apiTeams, localTeams]
  );

  const existingTeamNames = useMemo(
    () => allTeams.map((t) => t.name),
    [allTeams]
  );

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  const handleCreateTeam = (teamData: Omit<LocalTeam, "id" | "isLocal">) => {
    dispatch(createLocalTeam(teamData));
    setShowForm(false);
  };

  const handleUpdateTeam = (teamData: Omit<LocalTeam, "id" | "isLocal">) => {
    if (editingTeam) {
      dispatch(updateLocalTeam({ ...editingTeam, ...teamData }));
      setEditingTeam(null);
      setShowForm(false);
    }
  };

  const handleDeleteTeam = (team: LocalTeam | APITeam) => {
    const isApiTeam = !("isLocal" in team);
    setShowDeleteConfirm({ team, isApiTeam });
  };

  const confirmDelete = () => {
    if (!showDeleteConfirm) return;

    const { team, isApiTeam } = showDeleteConfirm;

    if (isApiTeam) {
      dispatch(deleteApiTeam(team as APITeam));
    } else {
      dispatch(deleteLocalTeam((team as LocalTeam).id));
    }

    setShowDeleteConfirm(null);
  };

  const handleRestoreTeam = (team: APITeam) => {
    dispatch(restoreApiTeam(team));
  };

  const handleClearCache = () => {
    if (
      confirm(
        "Are you sure you want to clear the cache? This will refresh all API data."
      )
    ) {
      dispatch(clearCache());
      dispatch(fetchTeams());
    }
  };

  const handleRefreshTeams = () => {
    dispatch(clearCache());
    dispatch(fetchTeams());
  };

  const handleEditTeam = (team: LocalTeam) => {
    setEditingTeam(team);
    setShowForm(true);
  };

  const handleViewPlayers = (teamId: string | number) => {
    setSelectedTeamId(teamId);
  };

  const handleBackToTeams = () => {
    setSelectedTeamId(null);
  };

  const handleOpenCreateForm = () => {
    setEditingTeam(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTeam(null);
  };

  const filteredAndSortedTeams = useMemo(() => {
    const allTeams = [...apiTeams, ...localTeams];

    let filteredTeams = allTeams;

    if (searchTerm.trim() !== "") {
      filteredTeams = filteredTeams.filter((team) =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filteredTeams.sort((a, b) => a.name.localeCompare(b.name));
  }, [apiTeams, localTeams, searchTerm]);

  const selectedTeam = useMemo(() => {
    return allTeams.find((team: any) => team.id === selectedTeamId);
  }, [allTeams, selectedTeamId]);

  const [activeTab, setActiveTab] = useState<Tab>("roster");
  const [isPlayerFormOpen, setPlayerFormOpen] = useState(false);
  const [isOfferModalOpen, setOfferModalOpen] = useState(false);

  if (selectedTeam) {
    return (
      <div className="container mx-auto p-4">
        <button
          onClick={handleBackToTeams}
          className="mb-4 text-blue-600 hover:underline"
        >
          &larr; Back to Teams
        </button>
        <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2 text-gray-900">
                {selectedTeam.name}
              </h1>
              <p className="text-gray-900 mb-4">
                {"isLocal" in selectedTeam
                  ? `${selectedTeam.region} - ${selectedTeam.country} (Custom Team)`
                  : `${selectedTeam.city}, ${selectedTeam.stadium}`}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setOfferModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <span>Make Offer</span>
              </button>
              {"isLocal" in selectedTeam && (
                <button
                  onClick={() => setPlayerFormOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <span>Create New Player</span>
                </button>
              )}
            </div>
          </div>

          <div>
            <div className="border-b border-gray-200 mt-4">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab("roster")}
                  className={`${
                    activeTab === "roster"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Roster
                </button>
                <button
                  onClick={() => setActiveTab("offers")}
                  className={`${
                    activeTab === "offers"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Offers
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`${
                    activeTab === "history"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Transfer History
                </button>
              </nav>
            </div>
            <div className="mt-6">
              {activeTab === "roster" &&
                ("isLocal" in selectedTeam ? (
                  <LocalTeamPlayers team={selectedTeam as LocalTeam} />
                ) : (
                  <TeamPlayers
                    teamId={selectedTeam.id as number}
                    teamName={selectedTeam.name}
                    onBack={handleBackToTeams}
                  />
                ))}
              {activeTab === "offers" && (
                <OffersList teamId={selectedTeam.id} allTeams={allTeams} />
              )}
              {activeTab === "history" && (
                <TransferHistory teamId={selectedTeam.id} allTeams={allTeams} />
              )}
            </div>
          </div>
        </div>
        {isPlayerFormOpen && "isLocal" in selectedTeam && (
          <PlayerForm
            isOpen={isPlayerFormOpen}
            onCancel={() => setPlayerFormOpen(false)}
            teamId={selectedTeam.id}
          />
        )}
        <OfferModal
          isOpen={isOfferModalOpen}
          onClose={() => setOfferModalOpen(false)}
          offeringTeam={selectedTeam}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && error.includes("API key")) {
    return (
      <div className="text-center py-8">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center mb-4">
            <Key className="h-12 w-12 text-yellow-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            API Key Required
          </h3>
          <p className="text-gray-600 mb-4">
            To fetch teams from the BallDontLie API, you need to configure your
            API key.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => (window.location.href = "#settings")}
              className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Settings className="h-4 w-4" />
              <span>Go to Settings</span>
            </button>
            <p className="text-sm text-gray-500">
              You can still create and manage local teams without an API key.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={() => dispatch(fetchTeams())}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">Teams</h1>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleRefreshTeams}
            className="flex items-center space-x-2 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            title="Refresh API data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeletedTeams(!showDeletedTeams)}
            className="flex items-center space-x-2 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            title="Show/hide deleted API teams"
          >
            <Trash2 className="h-4 w-4" />
            <span>({hiddenApiTeams.length})</span>
          </button>
          <button
            onClick={handleOpenCreateForm}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Team</span>
          </button>
        </div>
      </div>

      <TeamForm
        isOpen={showForm}
        onCancel={handleCloseForm}
        onSubmit={handleCreateTeam}
        existingTeamNames={existingTeamNames}
        team={editingTeam || undefined}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedTeams.map((team: any) => (
          <TeamCard
            key={team.id}
            team={team}
            onEdit={handleEditTeam}
            onDelete={handleDeleteTeam}
            onViewPlayers={handleViewPlayers}
          />
        ))}
      </div>

      {showDeletedTeams && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            <span>Hidden API Teams ({hiddenApiTeams.length})</span>
          </h3>
          {hiddenApiTeams.length > 0 ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-4">
                These teams are hidden from the main list. You can restore them
                at any time.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hiddenApiTeams.map((team: APITeam) => (
                  <div
                    key={team.id}
                    className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{team.name}</p>
                        <p className="text-sm text-gray-500">{team.city}</p>
                      </div>
                      <button
                        onClick={() => handleRestoreTeam(team)}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Restore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No teams have been hidden.</p>
            </div>
          )}
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center space-x-3 p-6 border-b border-gray-200">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Action
              </h3>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to{" "}
                {showDeleteConfirm.isApiTeam ? "hide" : "delete"} the team{" "}
                <span className="font-semibold">
                  "{showDeleteConfirm.team.name}"
                </span>
                ?
              </p>
              {showDeleteConfirm.isApiTeam ? (
                <p className="text-sm text-gray-500 mb-4">
                  This will hide the team from view. You can restore it later
                  from the hidden teams section.
                </p>
              ) : (
                <p className="text-sm text-red-600 mb-4">
                  This action is permanent and cannot be undone.
                </p>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  {showDeleteConfirm.isApiTeam ? "Hide Team" : "Delete Team"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
