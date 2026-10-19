import React, { useState, useEffect } from "react";
import { Search, MapPin, SlidersHorizontal, Layers } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase"; // adjust import path if needed
import { PPAListing } from "../types";
import PPAListingCard from "./PPAListingCard";

// Dictionary mapping ONLY Oyo and Lagos to their respective LGAs
const STATE_LGA_DATA: Record<string, string[]> = {
  Oyo: [
    "Ibadan North",
    "Ibadan North-East",
    "Ibadan North-West",
    "Ibadan South-East",
    "Ibadan South-West",
    "Ogbomosho North",
    "Ogbomosho South",
    "Oyo East",
    "Oyo West",
    "Iseyin", // approx 33 local governments in ibadan basically going to concentrate on only ibadan for the mean time
  ],
  Lagos: [
    "Ikeja",
    "Lagos Island",
    "Lagos Mainland",
    "Eti-Osa",
    "Alimosho",
    "Surulere",
    "Ikorodu",
    "Kosofe",
    "Oshodi-Isolo",
    "Badagry",
  ],
};

interface PPASectionProps {
  onViewDetails: (id: string) => void;
  searchTerm: string; // From the search input in the Navbar
}

export default function PPASection({
  onViewDetails,
  searchTerm,
}: PPASectionProps) {
  const [selectedSector, setSelectedSector] = useState<string>("ALL");
  // const [showSectorFilters, setShowSectorFilters] = useState(false);
  const [limit, setLimit] = useState(4); // Grid starts as 2x2 (4 items)

  // Managing dynamic filter selections (Defaulting to Oyo)
  const [formSearch, setFormSearch] = useState("");
  const [formState, setFormState] = useState<string>("Oyo");
  const [formLga, setFormLga] = useState<string>("ALL");

  // Use TanStack Form to manage form state context smoothly
  const form = useForm({
    defaultValues: {
      searchText: "",
      selectedState: "Oyo",
      selectedLga: "ALL",
    },
    onSubmit: async ({ value }) => {
      console.log("Searching with parameters:", value);
    },
  });

  // Automatically reset LGA selection to "ALL" if the user picks a different state
  useEffect(() => {
    setFormLga("ALL");
    form.setFieldValue("selectedLga", "ALL");
  }, [formState]);

  // Live Supabase Query replacing MOCK_PPAS
  const { data: ppas, isLoading } = useQuery<PPAListing[]>({
    queryKey: [
      "ppas",
      formSearch,
      formState,
      formLga,
      selectedSector,
      searchTerm,
    ],
    queryFn: async () => {
      // Fetch PPAs with nested reviews attached
      let query = supabase.from("ppas").select("*, reviews(*)");

      // 1. Filter by State if selected
      if (formState && formState !== "ALL") {
        query = query.ilike("state", formState);
      }

      // 2. Filter by LGA if selected
      if (formLga && formLga !== "ALL") {
        query = query.ilike("lga", formLga);
      }

      // 3. Filter by Sector/Category if selected
      if (selectedSector && selectedSector !== "ALL") {
        query = query.ilike("category", selectedSector);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching PPAs from Supabase:", error.message);
        throw new Error(error.message);
      }

      const combinedSearch = (formSearch || searchTerm || "")
        .toLowerCase()
        .trim();

      // Transform, calculate real ratings, and client-filter text query
      const formattedPPAs: PPAListing[] = (data || [])
        .map((row: any) => {
          const reviewsList = row.reviews || [];

          // Safe Rating Calculation
          const totalRating = reviewsList.reduce(
            (acc: number, r: any) => acc + (Number(r.rating) || 0),
            0,
          );

          const calculatedAvg =
            reviewsList.length > 0
              ? totalRating / reviewsList.length
              : Number(row.rating) || 0;

          // Safe fallback for location & LGA values
          const resolvedLga = row.lga || row.location || "N/A";
          const resolvedState = row.state || formState || "N/A";
          const resolvedLocation =
            row.address || `${resolvedLga}, ${resolvedState}`;

          return {
            id: row.id,
            name: row.name || "Unnamed PPA",
            state: resolvedState,
            lga: resolvedLga,
            sector: row.category || row.sector || "GOVERNMENT",
            location: resolvedLocation,
            imageUrl:
              row.image_url ||
              "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000",
            rating: Number(row.rating) || 0.0, //Number(calculatedAvg.toFixed(1))
            reviewCount: reviewsList.length || row.reviews_count || 0,
            reviewsCount: reviewsList.length || row.reviews_count || 0,
            capacity: row.capacity || "5-10 slots",
            capacitySubtext: row.capacity_subtext || "Open for intake",
            cultureRating: row.culture_rating || "4.5/5",
            cultureSubtext: row.culture_subtext || "Friendly environment",
            status: row.status || "Accepting",
            statusSubtext: row.status_subtext || "Batch A & B active",
            officialSiteUrl: row.official_site_url || "https://nysc.gov.ng",
            allowCorpsMembers: row.allow_corps_members ?? true,
            reviews: reviewsList.map((r: any) => ({
              id: r.id,
              authorName: r.author_name || "Anonymous Corper",
              batch: r.batch || "Batch A, 2026",
              rating: Number(r.rating) || 4,
              comment: r.comment || "",
              stipendAmount: r.stipend_amount || "₦0",
              workCulture: r.work_culture || "Good",
              createdAt: r.created_at,
            })),
          };
        })
        .filter((ppa) => {
          if (!combinedSearch) return true;
          return (
            ppa.name.toLowerCase().includes(combinedSearch) ||
            ppa.lga.toLowerCase().includes(combinedSearch) ||
            ppa.location.toLowerCase().includes(combinedSearch) ||
            ppa.state.toLowerCase().includes(combinedSearch)
          );
        });

      return formattedPPAs;
    },
  });

  // const sectors = [
  //   "ALL",
  //   "GOVERNMENT",
  //   "FINANCE",
  //   "HEALTHCARE",
  //   "OIL & GAS",
  //   "EDUCATION",
  //   "TECH",
  // ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden text-center mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-primary leading-tight mb-6">
            Find Your Perfect Place of{" "}
            <span className="text-[#1B4332] bg-[#c1ecd4]/40 px-2 rounded-lg">
              Primary Assignment
            </span>
          </h1>
          <p className="text-gray-600 text-lg sm:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
            Connect with accredited organizations and see authentic reviews from
            fellow corps members across Oyo and Lagos states.
          </p>
        </motion.div>

        {/* Hero Advanced Search Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="max-w-4xl mx-auto p-2 bg-white rounded-2xl shadow-xl border border-gray-100"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="flex flex-col md:flex-row gap-2 divide-y md:divide-y-0 md:divide-x divide-gray-150"
          >
            {/* Search Input Field */}
            <div className="flex-grow flex items-center px-4 py-3">
              <Search className="text-[#1B4332] w-5 h-5 mr-3 shrink-0" />
              <form.Field
                name="searchText"
                children={(field) => (
                  <input
                    type="text"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      setFormSearch(e.target.value);
                    }}
                    placeholder="Search by PPA name or area..."
                    className="w-full border-none outline-none focus:ring-0 text-sm text-gray-800 placeholder-gray-400"
                  />
                )}
              />
            </div>

            {/* State Select Dropdown (Limited to Oyo and Lagos) */}
            <div className="flex items-center px-4 py-3 shrink-0">
              <MapPin className="text-[#1B4332] w-5 h-5 mr-2 shrink-0" />
              <form.Field
                name="selectedState"
                children={(field) => (
                  <select
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      setFormState(e.target.value);
                    }}
                    className="bg-transparent border-none outline-none focus:ring-0 font-sans font-bold text-primary pr-8 text-sm cursor-pointer"
                  >
                    <option value="Oyo">Oyo</option>
                    <option value="Lagos">Lagos</option>
                  </select>
                )}
              />
            </div>

            {/* Dynamic Local Government Area (LGA) Dropdown */}
            <div className="flex items-center px-4 py-3 shrink-0">
              <Layers className="text-[#1B4332] w-5 h-5 mr-2 shrink-0" />
              <form.Field
                name="selectedLga"
                children={(field) => (
                  <select
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      setFormLga(e.target.value);
                    }}
                    className="bg-transparent border-none outline-none focus:ring-0 font-sans font-bold text-primary pr-8 text-sm cursor-pointer"
                  >
                    <option value="ALL">All LGAs</option>
                    {(STATE_LGA_DATA[formState] || []).map((lga) => (
                      <option key={lga} value={lga}>
                        {lga}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
          </form>
        </motion.div>
      </section>

      {/* Directory Grid Section */}
      <section className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-primary">
              Top Rated PPAs
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Recommended based on career growth and community feedback in{" "}
              {formState}.
            </p>
          </div>

          {/* Sector toggle trigger */}
          {/* <button
            onClick={() => setShowSectorFilters(!showSectorFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl font-sans font-semibold text-xs hover:bg-gray-50 active:scale-95 transition-all cursor-pointer shadow-sm text-primary"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter Sector</span>
          </button> */}
        </div>

        {/* <AnimatePresence>
          {(showSectorFilters || selectedSector !== "ALL") && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl border border-gray-150">
                {sectors.map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setSelectedSector(sec)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selectedSector === sec
                        ? "bg-primary text-white shadow-sm"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence> */}

        {/* Loading Spinner / Data Display Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#c1ecd4] border-t-primary rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm mt-4 font-medium animate-pulse">
              Loading accredited organizations...
            </p>
          </div>
        ) : ppas && ppas.length > 0 ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {ppas.slice(0, limit).map((ppa) => (
                <PPAListingCard
                  key={ppa.id}
                  ppa={ppa}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>

            {/* Load More Button */}
            {ppas.length > limit && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => setLimit((prev) => prev + 2)}
                  className="bg-white border-2 border-primary text-primary px-10 py-3 rounded-full font-sans font-bold text-sm hover:bg-primary hover:text-white hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  Load More PPAs
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-12 text-center max-w-xl mx-auto">
            <SlidersHorizontal className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <h3 className="font-display text-lg font-bold text-gray-800">
              No organizations match your filters
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              Try searching with other key terms, selecting a different LGA, or
              clearing the sector filter.
            </p>
            <button
              onClick={() => {
                setFormSearch("");
                setSelectedSector("ALL");
                setFormState("Oyo");
                setFormLga("ALL");
              }}
              className="mt-4 bg-primary text-white px-5 py-2 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
