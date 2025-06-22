"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchTeams,
  createLocalTeam,
  deleteLocalTeam,
  deleteApiTeam,
  restoreApiTeam,
  clearCache,
} from "@/lib/slices/teamsSlice";
import { LocalTeam, APITeam } from "@/lib/slices/teamsSlice";
import TeamCard from "./TeamCard";
import TeamForm from "./TeamForm";
import TeamPlayers from "./TeamPlayers";
import {
  Plus,
  Loader2,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Search,
} from "lucide-react";
import LocalTeamPlayers from "./LocalTeamPlayers";
import OffersList from "../offers/OffersList";
import TransferHistory from "../transfers/TransferHistory";
import PlayerForm from "../players/PlayerForm";
import OfferModal from "../players/OfferModal";

type Tab = "roster" | "offers" | "history";

export default function TeamsList() {
  const dispatch = useAppDispatch();
  const { apiTeams, localTeams, loading, error } = useAppSelector(
    (state) => state.teams
  );
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<LocalTeam | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | number | null>(
    null
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    team: LocalTeam | APITeam;
    isApiTeam: boolean;
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

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

  const handleUpdateTeam = (teamData: Omit<LocalTeam, "id" | "isLocal">) => {
    if (editingTeam) {
      // You may want to dispatch an update action here
      setEditingTeam(null);
      setShowForm(false);
    }
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
    return allTeams.find(
      (team: LocalTeam | APITeam) => team.id === selectedTeamId
    );
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
                  <Plus className="h-4 w-4" />
                  <span>Create Player</span>
                </button>
              )}
            </div>
          </div>

          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "roster" as Tab, label: "Roster" },
                { id: "offers" as Tab, label: "Offers" },
                { id: "history" as Tab, label: "Transfer History" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {activeTab === "roster" && (
            <div>
              {"isLocal" in selectedTeam ? (
                <LocalTeamPlayers team={selectedTeam} />
              ) : (
                <TeamPlayers
                  teamId={selectedTeam.id}
                  teamName={selectedTeam.name}
                  onBack={handleBackToTeams}
                />
              )}
            </div>
          )}

          {activeTab === "offers" && (
            <OffersList teamId={selectedTeam.id} allTeams={allTeams} />
          )}

          {activeTab === "history" && (
            <TransferHistory teamId={selectedTeam.id} allTeams={allTeams} />
          )}
        </div>

        {isPlayerFormOpen && (
          <PlayerForm
            isOpen={isPlayerFormOpen}
            onCancel={() => setPlayerFormOpen(false)}
            teamId={selectedTeam.id}
          />
        )}

        {isOfferModalOpen && (
          <OfferModal
            isOpen={isOfferModalOpen}
            onClose={() => setOfferModalOpen(false)}
            offeringTeam={selectedTeam}
          />
        )}
      </div>
    );
  }

  if (loading && apiTeams.length === 0) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading teams...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => dispatch(fetchTeams())}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-600 mt-1">
            Manage your basketball teams and players
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleRefreshTeams}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenCreateForm}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Create Team</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <span>API Teams: {apiTeams.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Local Teams: {localTeams.length}</span>
            </div>
          </div>
        </div>

        {filteredAndSortedTeams.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchTerm
                ? "No teams found matching your search."
                : "No teams available."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onEdit={handleEditTeam}
                onDelete={handleDeleteTeam}
                onViewPlayers={handleViewPlayers}
                onAddPlayers={handleViewPlayers}
              />
            ))}
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Delete
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &quot;
              {showDeleteConfirm.team.name}&quot;?
              {!showDeleteConfirm.isApiTeam && (
                <span className="block mt-2 text-sm text-red-600">
                  This will also remove all players from this team.
                </span>
              )}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <TeamForm
          isOpen={showForm}
          onCancel={handleCloseForm}
          onSubmit={editingTeam ? handleUpdateTeam : handleCreateTeam}
          existingTeamNames={existingTeamNames}
          team={editingTeam || undefined}
        />
      )}
    </div>
  );
}
