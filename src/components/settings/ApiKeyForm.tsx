"use client";

import { useState, useEffect } from "react";
import { Key, Eye, EyeOff, Save, Check } from "lucide-react";

export default function ApiKeyForm() {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedApiKey = localStorage.getItem("balldontlie_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem("balldontlie_api_key", apiKey.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleClear = () => {
    localStorage.removeItem("balldontlie_api_key");
    setApiKey("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!isClient) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Key className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            API Key Settings
          </h3>
        </div>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center space-x-2 mb-4">
        <Key className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          API Key Settings
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="apiKey"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            BallDontLie API Key
          </label>
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your API key"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Your API key is stored locally and never sent to our servers.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saved ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saved ? "Saved!" : "Save API Key"}</span>
          </button>

          {localStorage.getItem("balldontlie_api_key") && (
            <button
              onClick={handleClear}
              className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear
            </button>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            How to get your API key:
          </h4>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Visit the BallDontLie API website</li>
            <li>Sign up for an account</li>
            <li>Generate an API key from your dashboard</li>
            <li>Copy and paste the key above</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
