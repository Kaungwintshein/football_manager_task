"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  createCustomPlayer,
  addCustomPlayerToTeam,
  Player,
  CustomPlayer,
} from "@/lib/slices/playersSlice";
import { X, UserPlus } from "lucide-react";
import { z } from "zod";

const createPlayerSchema = (existingNames: string[]) =>
  z
    .object({
      first_name: z
        .string()
        .trim()
        .min(2, "First name must be at least 2 characters"),
      last_name: z
        .string()
        .trim()
        .min(2, "Last name must be at least 2 characters"),
      position: z.string().trim().min(2, "Position is required"),
      national_team: z.string().trim().min(2, "National Team is required"),
      height: z
        .number()
        .min(100, "Height must be at least 100cm")
        .max(250, "Height must be less than 250cm"),
      weight: z
        .number()
        .min(40, "Weight must be at least 40kg")
        .max(150, "Weight must be less than 150kg"),
      birth_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format",
      }),
    })
    .superRefine((data, ctx) => {
      const fullName = `${data.first_name} ${data.last_name}`.toLowerCase();
      if (existingNames.includes(fullName)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A player with this name already exists.",
          path: ["first_name"],
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A player with this name already exists.",
          path: ["last_name"],
        });
      }
    });

interface FormData {
  first_name: string;
  last_name: string;
  position: string;
  national_team: string;
  height: string;
  weight: string;
  birth_date: string;
}

type FormErrors = {
  [K in keyof FormData]?: string;
};

interface PlayerFormProps {
  isOpen: boolean;
  onCancel: () => void;
  teamId: string | number;
}

export default function PlayerForm({
  isOpen,
  onCancel,
  teamId,
}: PlayerFormProps) {
  const dispatch = useAppDispatch();
  const { allPlayers, customPlayers } = useAppSelector(
    (state) => state.players
  );

  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    position: "",
    national_team: "",
    height: "",
    weight: "",
    birth_date: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const existingApiNames = allPlayers.map((p: Player) =>
      `${p.first_name} ${p.last_name}`.toLowerCase()
    );
    const existingCustomNames = customPlayers.map((p: CustomPlayer) =>
      `${p.first_name} ${p.last_name}`.toLowerCase()
    );
    const allExistingNames = [...existingApiNames, ...existingCustomNames];

    const schema = createPlayerSchema(allExistingNames);
    const validationResult = schema.safeParse({
      ...formData,
      height: Number(formData.height),
      weight: Number(formData.weight),
    });

    if (!validationResult.success) {
      const newErrors: FormErrors = {};
      for (const issue of validationResult.error.issues) {
        if (issue.path[0]) {
          newErrors[issue.path[0] as keyof FormData] = issue.message;
        }
      }
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const { first_name, last_name } = validationResult.data;
      const newPlayer: CustomPlayer = {
        ...validationResult.data,
        id: `custom_${Date.now()}`,
        name: `${first_name} ${last_name}`,
        isCustom: true,
      };

      dispatch(createCustomPlayer(newPlayer));
      dispatch(addCustomPlayerToTeam({ teamId, player: newPlayer }));

      onCancel();
      setFormData({
        first_name: "",
        last_name: "",
        position: "",
        national_team: "",
        height: "",
        weight: "",
        birth_date: "",
      });
    } catch (error: unknown) {
      console.error("Error creating player:", error);
      setErrors({
        first_name:
          error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <UserPlus className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Create New Player
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                First Name *
              </label>
              <input
                type="text"
                id="first_name"
                value={formData.first_name}
                onChange={(e) =>
                  handleInputChange("first_name", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.first_name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g. Kadan"
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Last Name *
              </label>
              <input
                type="text"
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.last_name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g. Young"
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="position"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Position *
            </label>
            <input
              type="text"
              id="position"
              value={formData.position}
              onChange={(e) => handleInputChange("position", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.position ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g. Left Winger"
            />
            {errors.position && (
              <p className="mt-1 text-sm text-red-600">{errors.position}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="national_team"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              National Team *
            </label>
            <input
              type="text"
              id="national_team"
              value={formData.national_team}
              onChange={(e) =>
                handleInputChange("national_team", e.target.value)
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.national_team ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g. England"
            />
            {errors.national_team && (
              <p className="mt-1 text-sm text-red-600">
                {errors.national_team}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label
                htmlFor="height"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Height (cm) *
              </label>
              <input
                type="number"
                id="height"
                value={formData.height}
                onChange={(e) => handleInputChange("height", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.height ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g. 176"
              />
              {errors.height && (
                <p className="mt-1 text-sm text-red-600">{errors.height}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="weight"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Weight (kg) *
              </label>
              <input
                type="number"
                id="weight"
                value={formData.weight}
                onChange={(e) => handleInputChange("weight", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.weight ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g. 67"
              />
              {errors.weight && (
                <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="birth_date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Birth Date *
              </label>
              <input
                type="date"
                id="birth_date"
                value={formData.birth_date}
                onChange={(e) =>
                  handleInputChange("birth_date", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.birth_date ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.birth_date && (
                <p className="mt-1 text-sm text-red-600">{errors.birth_date}</p>
              )}
            </div>
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
              className="flex-1 px-4 py-2 text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                "Create Player"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
