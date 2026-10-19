import React, { useState, useEffect } from "react";
import {
  SlidersHorizontal,
  UserPlus,
  Sparkles,
  MapPin,
  Layers,
  Wallet,
  Search,
  Users,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { RoommateProfile } from "../types";
import RoommateListingCard from "./RoommateListingCard";
import { supabase } from "../lib/supabase";

// Restrict state data dictionary to Oyo and Lagos
const STATE_LGA_DATA: Record<string, string[]> = {
  Oyo: [
    "Ibadan North",
    "Ibadan Southwest",
    "Ogbomosho North",
    "Oyo East",
    "Iseyin",
  ],
  Lagos: [
    "Ikeja",
    "Lagos Island",
    "Eti-Osa",
    "Alimosho",
    "Surulere",
    "Ikorodu",
    "Badagry",
  ],
};

interface RoommatesDirectorySectionProps {
  searchTerm: string;
}

export default function RoommatesDirectorySection({
  searchTerm,
}: RoommatesDirectorySectionProps) {
  const queryClient = useQueryClient();
  const [genderFilter, setGenderFilter] = useState<"ALL" | "FEMALE" | "MALE">(
    "ALL",
  );
  const [budgetFilter, setBudgetFilter] = useState<string>("ALL");

  // Default to "Oyo" state
  const [formState, setFormState] = useState<string>("Oyo");
  const [formLga, setFormLga] = useState<string>("ALL");
  const [formArea, setFormArea] = useState("");
  const [limit, setLimit] = useState(6);
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);

  // Form states for creating a roommate profile
  const [newName, setNewName] = useState("");
  const [newGender, setNewGender] = useState<"FEMALE" | "MALE">("FEMALE");
  const [newBudget, setNewBudget] = useState("₦50,000 - ₦80,000");
  const [newArea, setNewArea] = useState("");
  const [newTagsString, setNewTagsString] = useState("");
  const [newPhone, setNewPhone] = useState("2348000000000");

  // Reset LGA to "ALL" if user switches states to avoid empty queries
  useEffect(() => {
    setFormLga("ALL");
  }, [formState]);

  // ---------------------------------------------------------------------------
  // LIVE SUPABASE FETCH QUERY
  // ---------------------------------------------------------------------------
  const { data: roommates, isLoading } = useQuery<RoommateProfile[]>({
    queryKey: [
      "roommates",
      genderFilter,
      budgetFilter,
      formState,
      formLga,
      formArea,
      searchTerm,
    ],
    queryFn: async () => {
      let query = supabase
        .from("roommates")
        .select("*")
        .eq("state", formState)
        .order("created_at", { ascending: false });

      if (genderFilter !== "ALL") {
        query = query.eq("gender", genderFilter);
      }

      if (formLga !== "ALL") {
        query = query.eq("lga", formLga);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching roommates from Supabase:", error.message);
        throw new Error(error.message);
      }

      // Safe fallback mapping for DB values
      const mappedProfiles: RoommateProfile[] = (data || []).map(
        (item: any) => ({
          id: item.id,
          name: item.name || "Anonymous Corper",
          gender: item.gender || "FEMALE",
          avatarUrl:
            item.avatar_url ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
          budget: item.budget || "₦50,000 - ₦80,000",
          targetArea: item.target_area || item.lga || "Target Area N/A",
          state: item.state || formState,
          lga: item.lga || "N/A",
          tags: Array.isArray(item.tags) ? item.tags : ["Corper"],
          whatsAppNo: item.whatsapp_no || "2348000000000",
          createdAt: item.created_at,
        }),
      );

      return mappedProfiles.filter((profile) => {
        const combinedSearch = (searchTerm || formArea).toLowerCase().trim();
        const targetAreaText = (profile.targetArea || "").toLowerCase();
        const profileName = (profile.name || "").toLowerCase();

        const matchesSearch =
          combinedSearch === "" ||
          profileName.includes(combinedSearch) ||
          targetAreaText.includes(combinedSearch) ||
          profile.tags.some((t) => t.toLowerCase().includes(combinedSearch));

        let matchesBudget = true;
        if (budgetFilter !== "ALL") {
          const numbers = profile.budget.replace(/[^0-9,-]/g, "").split("-");
          const firstVal = parseInt(numbers[0]) || 0;
          const secondVal = parseInt(numbers[1] || "0") || firstVal;
          const avgBudget = (firstVal + secondVal) / 2;

          if (budgetFilter === "LOW") {
            matchesBudget = avgBudget < 65000;
          } else if (budgetFilter === "MEDIUM") {
            matchesBudget = avgBudget >= 65000 && avgBudget <= 85000;
          } else if (budgetFilter === "HIGH") {
            matchesBudget = avgBudget > 85000;
          }
        }

        return matchesSearch && matchesBudget;
      });
    },
  });

  // ---------------------------------------------------------------------------
  // LIVE SUPABASE INSERT MUTATION
  // ---------------------------------------------------------------------------
  const addProfileMutation = useMutation({
    mutationFn: async (newProfile: Omit<RoommateProfile, "id">) => {
      const { data, error } = await supabase
        .from("roommates")
        .insert([
          {
            name: newProfile.name,
            gender: newProfile.gender,
            avatar_url: newProfile.avatarUrl,
            budget: newProfile.budget,
            target_area: newProfile.targetArea,
            state: newProfile.state,
            lga: newProfile.lga,
            tags: newProfile.tags,
            whatsapp_no: newProfile.whatsAppNo,
          },
        ])
        .select();

      if (error) {
        console.error("Error creating profile in Supabase:", error.message);
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roommates"] });
      setShowAddProfileModal(false);
      setNewName("");
      setNewTagsString("");
      setNewArea("");
    },
  });

  const handleAddProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const tagsArray = newTagsString
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");

    const avatar =
      newGender === "FEMALE"
        ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400"
        : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400";

    addProfileMutation.mutate({
      name: newName,
      gender: newGender,
      avatarUrl: avatar,
      budget: newBudget,
      targetArea: newArea || "Near Secretariat",
      state: formState,
      lga:
        formLga !== "ALL"
          ? formLga
          : STATE_LGA_DATA[formState]?.[0] || "Ibadan North",
      tags: tagsArray.length > 0 ? tagsArray : ["Clean", "Peaceful"],
      whatsAppNo: newPhone.replace(/[^0-9]/g, ""),
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header Section */}
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="font-display text-3xl font-black text-primary tracking-tight">
            Roommate Matcher Directory
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Currently filtering listings across{" "}
            <span className="text-secondary font-bold">{formState} State</span>
          </p>
        </div>
        <button
          onClick={() => setShowAddProfileModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl hover:bg-[#123023] active:scale-95 transition-all cursor-pointer font-bold text-xs shadow-md self-start sm:self-center shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Post Your Profile</span>
        </button>
      </header>

      {/* Asymmetric Sidebar Layout Container */}
      <div className="w-full flex flex-col lg:flex-row gap-8 items-start relative">
        {/* Left Sticky Side Navigation Bar */}
        <aside className="w-full lg:w-64 shrink-0 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm lg:sticky lg:top-6 z-20">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-4 pb-3 border-b border-gray-50">
            <Users className="w-4 h-4 text-secondary" />
            <span>Gender Matching</span>
          </div>

          <div className="bg-gray-100 p-1 rounded-xl flex flex-row lg:flex-col gap-1 w-full justify-center items-center">
            {(["ALL", "FEMALE", "MALE"] as const).map((gen) => (
              <button
                key={gen}
                onClick={() => setGenderFilter(gen)}
                className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold transition-all text-center lg:text-left cursor-pointer ${
                  genderFilter === gen
                    ? "bg-[#1B4332] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-200/60"
                }`}
              >
                {gen.charAt(0) + gen.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/40 mt-6 hidden lg:block">
            <p className="text-[11px] text-[#1B4332]/80 leading-relaxed font-medium">
              💡 Always verify deployment details or meet up at the NYSC
              Secretariat during early housing inspections.
            </p>
          </div>
        </aside>

        {/* Right Main Dynamic Workspace Content Feed */}
        <div className="flex-1 w-full min-w-0">
          {/* Main Context Filters Form Bar Deck */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-center">
            {/* 1. Target Area Text Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formArea}
                onChange={(e) => setFormArea(e.target.value)}
                placeholder="Search target area/tags..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* 2. Parent State Selector Dropdown (Restricted to Oyo and Lagos) */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-1">
              <MapPin className="w-4 h-4 text-secondary shrink-0 mr-1.5" />
              <select
                value={formState}
                onChange={(e) => setFormState(e.target.value)}
                className="w-full bg-transparent border-none outline-none focus:ring-0 font-sans font-bold text-primary py-2 text-xs cursor-pointer"
              >
                <option value="Oyo">Oyo</option>
                <option value="Lagos">Lagos</option>
              </select>
            </div>

            {/* 3. Child LGA Synchronized Dropdown */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-1">
              <Layers className="w-4 h-4 text-secondary shrink-0 mr-1.5" />
              <select
                value={formLga}
                onChange={(e) => setFormLga(e.target.value)}
                className="w-full bg-transparent border-none outline-none focus:ring-0 font-sans font-bold text-primary py-2 text-xs cursor-pointer"
              >
                <option value="ALL">All LGAs</option>
                {(STATE_LGA_DATA[formState] || []).map((lga) => (
                  <option key={lga} value={lga}>
                    {lga}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Budget Selection Dropdown */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-1">
              <Wallet className="w-4 h-4 text-secondary shrink-0 mr-1.5" />
              <select
                value={budgetFilter}
                onChange={(e) => setBudgetFilter(e.target.value)}
                className="w-full bg-transparent border-none outline-none focus:ring-0 font-sans font-bold text-primary py-2 text-xs cursor-pointer"
              >
                <option value="ALL">All Budgets</option>
                <option value="LOW">Under ₦65,000</option>
                <option value="MEDIUM">₦65,000 - ₦85,000</option>
                <option value="HIGH">Above ₦85,000</option>
              </select>
            </div>
          </div>

          {/* Grid Engine & Dynamic Feedback States */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-50 rounded-2xl shadow-sm">
              <div className="w-10 h-10 border-4 border-emerald-100 border-t-primary rounded-full animate-spin"></div>
              <p className="text-gray-400 text-xs mt-4 font-semibold animate-pulse">
                Loading verified profiles...
              </p>
            </div>
          ) : roommates && roommates.length > 0 ? (
            <>
              {/* Responsive Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {roommates.slice(0, limit).map((profile) => (
                  <RoommateListingCard key={profile.id} profile={profile} />
                ))}
              </div>

              {/* Load More Controller */}
              {roommates.length > limit && (
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={() => setLimit((prev) => prev + 3)}
                    className="border-2 border-primary text-primary px-8 py-2.5 rounded-full font-sans font-bold text-xs hover:bg-primary hover:text-white transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    Load More Profiles
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm">
              <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-4 animate-pulse" />
              <h3 className="font-display text-base font-bold text-gray-800">
                No matching roommate profiles found
              </h3>
              <p className="text-gray-400 text-xs mt-2 max-w-xs mx-auto leading-relaxed">
                No active corps members have posted under these specifications
                yet. Try selecting a different LGA or altering the area filters.
              </p>
              <button
                onClick={() => {
                  setGenderFilter("ALL");
                  setBudgetFilter("ALL");
                  setFormLga("ALL");
                  setFormArea("");
                }}
                className="mt-5 bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-[#123023] transition-all"
              >
                Clear Roommate Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Profile Modal */}
      <AnimatePresence>
        {showAddProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <h3 className="font-display text-lg font-black text-primary mb-1">
                Post Roommate Profile
              </h3>
              <p className="text-gray-400 text-xs mb-6">
                Your profile will be automatically categorized under your
                selected parameters.
              </p>

              <form onSubmit={handleAddProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., Tunde O., Chidimma A."
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-gray-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">
                      Gender
                    </label>
                    <select
                      value={newGender}
                      onChange={(e: any) => setNewGender(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-semibold text-gray-700 bg-white cursor-pointer focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none"
                    >
                      <option value="FEMALE">Female</option>
                      <option value="MALE">Male</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">
                      Monthly Budget
                    </label>
                    <input
                      type="text"
                      required
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      placeholder="e.g., ₦60,000 - ₦90,000"
                      className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">
                    Target Area Location
                  </label>
                  <input
                    type="text"
                    required
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    placeholder="e.g., Near custom junction, Bodija"
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">
                    Habit Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={newTagsString}
                    onChange={(e) => setNewTagsString(e.target.value)}
                    placeholder="e.g., Early Bird, Quiet, Gym Goer"
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="e.g., 2348034567890"
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-gray-700"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowAddProfileModal(false)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addProfileMutation.isPending}
                    className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-[#123023] disabled:opacity-50 cursor-pointer"
                  >
                    {addProfileMutation.isPending
                      ? "Posting..."
                      : "Publish Profile"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
