"use client";

import { useState, useEffect } from "react";
import { LocalTeam } from "@/lib/slices/teamsSlice";
import { X, Save, Plus } from "lucide-react";
import { z } from "zod";

interface TeamFormProps {
  team?: LocalTeam;
  onSubmit: (teamData: Omit<LocalTeam, "id" | "isLocal">) => void;
  onCancel: () => void;
  existingTeamNames: string[];
  isOpen: boolean;
}

const createTeamSchema = (
  existingTeamNames: string[],
  isEditing: boolean,
  currentName: string
) =>
  z
    .object({
      name: z
        .string()
        .trim()
        .min(2, { message: "Team name must be at least 2 characters" })
        .max(50, { message: "Team name must be less than 50 characters" }),
      region: z
        .string()
        .trim()
        .min(2, { message: "Region must be at least 2 characters" })
        .max(50, { message: "Region must be less than 50 characters" }),
      country: z
        .string()
        .trim()
        .min(2, { message: "Country must be at least 2 characters" })
        .max(50, { message: "Country must be less than 50 characters" }),
    })
    .superRefine((data, ctx) => {
      const nameExists = existingTeamNames.some(
        (existingName) =>
          existingName.toLowerCase() === data.name.toLowerCase() &&
          (!isEditing ||
            existingName.toLowerCase() !== currentName.toLowerCase())
      );
      if (nameExists) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Team name already exists",
          path: ["name"],
        });
      }
    });

interface FormData {
  name: string;
  region: string;
  country: string;
}

interface FormErrors {
  name?: string;
  region?: string;
  country?: string;
}

export default function TeamForm({
  team,
  onSubmit,
  onCancel,
  existingTeamNames,
  isOpen,
}: TeamFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    region: "",
    country: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name,
        region: team.region,
        country: team.country,
      });
    } else {
      setFormData({
        name: "",
        region: "",
        country: "",
      });
    }
    setErrors({});
  }, [team]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const teamSchema = createTeamSchema(
      existingTeamNames,
      team !== undefined,
      team?.name || ""
    );
    const validationResult = teamSchema.safeParse(formData);

    if (!validationResult.success) {
      const newErrors: FormErrors = {};
      for (const issue of validationResult.error.issues) {
        if (issue.path[0]) {
          newErrors[issue.path[0] as keyof FormData] = issue.message;
        }
      }
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        ...validationResult.data,
        playerCount: team?.players?.length || 0,
        players: team?.players || [],
      });

      setFormData({
        name: "",
        region: "",
        country: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Error submitting team:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black opacity-100 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            {team ? (
              <>
                <Save className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Edit Team
                </h2>
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Create New Team
                </h2>
              </>
            )}
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Team Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter team name"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="region"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Region *
            </label>
            <input
              type="text"
              id="region"
              value={formData.region}
              onChange={(e) => handleInputChange("region", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.region ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter region"
              disabled={isSubmitting}
            />
            {errors.region && (
              <p className="mt-1 text-sm text-red-600">{errors.region}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Country *
            </label>
            <input
              type="text"
              id="country"
              value={formData.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.country ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter country"
              disabled={isSubmitting}
            />
            {errors.country && (
              <p className="mt-1 text-sm text-red-600">{errors.country}</p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <span>{team ? "Update Team" : "Create Team"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
