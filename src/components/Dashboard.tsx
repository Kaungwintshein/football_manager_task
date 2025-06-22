"use client";

import { useState } from "react";
import { useAppSelector } from "@/lib/hooks";
import TeamsList from "./teams/TeamsList";
import ApiKeyForm from "./settings/ApiKeyForm";
import { Users, Settings } from "lucide-react";

type Tab = "teams" | "settings";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("teams");
  const { lastApiFetch: teamsLastFetch } = useAppSelector(
    (state) => state.teams
  );

  const teamsCacheAge = teamsLastFetch ? Date.now() - teamsLastFetch : null;
  const teamsCacheMinutes = teamsCacheAge
    ? Math.floor(teamsCacheAge / (1000 * 60))
    : null;

  const tabs = [
    { id: "teams" as Tab, label: "Teams", icon: Users },
    { id: "settings" as Tab, label: "Settings", icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Cache Status</h3>
        <div className="flex flex-wrap gap-4 text-xs text-blue-700">
          <div className="flex items-center space-x-2">
            <span>Teams:</span>
            <span className="font-medium">
              {teamsCacheMinutes !== null
                ? `${teamsCacheMinutes}m old`
                : "Not cached"}
            </span>
          </div>
          <div className="text-blue-600">Cache expires after 5 minutes</div>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-6">
        {activeTab === "teams" && <TeamsList />}
        {activeTab === "settings" && <ApiKeyForm />}
      </div>
    </div>
  );
}
