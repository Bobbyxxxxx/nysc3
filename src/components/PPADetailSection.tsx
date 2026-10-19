import { useState, useEffect } from "react";
import {
  ChevronRight,
  Bookmark,
  ExternalLink,
  Star,
  Edit,
  ArrowRight,
  Home,
  X,
  Building2,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { PPAListing, PPAReview } from "../types";
import { useAppStore } from "../store/useAppStore";

interface PPADetailSectionProps {
  ppaId: string;
  onNavigateToRoommates: () => void;
  onBack: () => void;
}

export default function PPADetailSection({
  ppaId,
  onNavigateToRoommates,
  onBack,
}: PPADetailSectionProps) {
  const queryClient = useQueryClient();
  const { savedPpaIds, toggleSavePPA } = useAppStore();
  const isSaved = savedPpaIds.includes(ppaId);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Form states for writing a review
  const [newAuthor, setNewAuthor] = useState("");
  const [newBatch, setNewBatch] = useState("Batch A, 2026");
  const [newRating, setNewRating] = useState(5);
  const [newStipend, setNewStipend] = useState("₦30,000");
  const [newPaymentStatus, setNewPaymentStatus] = useState<
    "Promptly paid" | "Sometimes late" | "Rarely paid"
  >("Promptly paid");
  const [newReviewText, setNewReviewText] = useState("");
  const [newTags, setNewTags] = useState("");

  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowReviewModal(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch single PPA + attached reviews
  const {
    data: ppa,
    isLoading,
    error,
  } = useQuery<PPAListing | null>({
    queryKey: ["ppa", ppaId],
    queryFn: async () => {
      console.log("Fetching PPA details for ID:", ppaId);

      const { data, error } = await supabase
        .from("ppas")
        .select("*, reviews(*)")
        .eq("id", ppaId)
        .single();

      if (error) {
        console.error("Error fetching PPA details:", error.message, error);
        throw new Error(error.message);
      }

      if (!data) return null;

      const rawReviews = data.reviews || [];

      // Calculate dynamic rating or fall back to column rating
      const totalRating = rawReviews.reduce(
        (acc: number, r: any) => acc + (Number(r.rating) || 0),
        0,
      );
      const avgRating =
        rawReviews.length > 0
          ? totalRating / rawReviews.length
          : Number(data.rating) || 0;

      const formattedPPA: PPAListing = {
        id: data.id,
        name: data.name || "Unnamed PPA",
        state: data.state || "N/A",
        lga: data.lga || "N/A",
        sector: data.category || data.sector || "GOVERNMENT",
        location: data.address || `${data.lga || ""}, ${data.state || ""}`,
        imageUrl:
          data.image_url ||
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000",
        rating: Number(avgRating.toFixed(1)),
        reviewsCount: rawReviews.length,
        capacity: data.capacity || "5-10 slots",
        capacitySubtext: data.capacity_subtext || "Open for intake",
        cultureRating: data.culture_rating || "4.5/5",
        cultureSubtext: data.culture_subtext || "Friendly environment",
        status: data.status || "Accepting",
        statusSubtext: data.status_subtext || "Batch A & B active",
        officialSiteUrl: data.official_site_url || "https://nysc.gov.ng",
        allowCorpsMembers: data.allow_corps_members ?? true,
        reviews: rawReviews.map((r: any) => ({
          id: r.id,
          author: r.author_name || "Anonymous Corper",
          batch: r.batch || "Batch A, 2026",
          rating: Number(r.rating) || 5,
          monthlyStipend: r.stipend_amount || "₦30,000",
          paymentStatus: r.payment_status || "Promptly paid",
          text: r.comment || "",
          tags: r.tags || ["#CommunityReview"],
        })),
      };

      return formattedPPA;
    },
  });

  // Supabase Mutation for inserting a review into `reviews`
  const addReviewMutation = useMutation({
    mutationFn: async (reviewPayload: {
      ppa_id: string;
      author_name: string;
      batch: string;
      rating: number;
      stipend_amount: string;
      payment_status: string;
      comment: string;
      tags: string[];
    }) => {
      const { data, error } = await supabase
        .from("reviews")
        .insert([reviewPayload])
        .select();

      if (error) {
        console.error("Error submitting review:", error.message);
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ppa", ppaId] });
      queryClient.invalidateQueries({ queryKey: ["ppas"] });

      setShowReviewModal(false);
      setNewAuthor("");
      setNewReviewText("");
      setNewTags("");
    },
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newReviewText.trim()) return;

    const parsedTags = newTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "")
      .map((t) => (t.startsWith("#") ? t : `#${t}`));

    addReviewMutation.mutate({
      ppa_id: ppaId,
      author_name: newAuthor,
      batch: newBatch,
      rating: newRating,
      stipend_amount: newStipend,
      payment_status: newPaymentStatus,
      comment: newReviewText,
      tags: parsedTags.length > 0 ? parsedTags : ["#CommunityReview"],
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 max-w-7xl mx-auto">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-700 rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm mt-4 font-semibold animate-pulse">
          Loading organization details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 max-w-7xl mx-auto px-4">
        <Building2 className="w-12 h-12 text-red-300 mx-auto mb-3" />
        <p className="text-red-500 font-bold text-lg">
          Unable to load organization details.
        </p>
        <p className="text-gray-500 text-sm mt-1">{error.message}</p>
        <button
          onClick={onBack}
          className="mt-6 bg-[#1B4332] text-white px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer hover:bg-emerald-900 transition-colors"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  if (!ppa) {
    return (
      <div className="text-center py-20 max-w-7xl mx-auto px-4">
        <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-red-500 font-bold text-lg">
          Organization not found!
        </p>
        <p className="text-gray-500 text-sm mt-1">
          This listing might have been updated or removed.
        </p>
        <button
          onClick={onBack}
          className="mt-6 bg-[#1B4332] text-white px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer hover:bg-emerald-900 transition-colors"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb Nav */}
      <div className="flex items-center gap-2 text-gray-400 mb-6 font-sans font-medium text-xs flex-wrap">
        <button
          onClick={onBack}
          className="hover:text-emerald-700 transition-colors cursor-pointer"
        >
          Directory
        </button>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <span className="text-gray-500">{ppa.state}</span>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <span className="text-gray-500">{ppa.lga}</span>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <span className="text-emerald-800 font-bold truncate max-w-[200px]">
          {ppa.name}
        </span>
      </div>

      {/* Main PPA Detail Card */}
      <section className="mb-10">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Image banner area */}
            <div className="lg:w-1/2 h-64 lg:h-auto min-h-[320px] relative overflow-hidden bg-gray-100">
              <div
                className="w-full h-full bg-cover bg-center transition-transform hover:scale-105 duration-700"
                style={{ backgroundImage: `url('${ppa.imageUrl}')` }}
                role="img"
                aria-label={ppa.name}
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 bg-amber-400 text-amber-950 font-sans font-extrabold text-xs rounded-full uppercase shadow-md tracking-wider">
                  {ppa.sector}
                </span>
              </div>
            </div>

            {/* Content Details area */}
            <div className="lg:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h1 className="font-display text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight leading-tight">
                    {ppa.name}
                  </h1>
                  <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl shrink-0">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-amber-900 text-sm">
                      {ppa.rating > 0 ? ppa.rating.toFixed(1) : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-500 mb-6">
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="text-sm font-semibold">{ppa.location}</span>
                </div>

                {/* High-Fidelity Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                  {/* Stat block 1 */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                      Capacity
                    </p>
                    <p className="font-display text-xl sm:text-2xl font-black text-emerald-900">
                      {ppa.capacity}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      {ppa.capacitySubtext}
                    </p>
                  </div>

                  {/* Stat block 2 */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                      Culture
                    </p>
                    <p className="font-display text-xl sm:text-2xl font-black text-emerald-900">
                      {ppa.cultureRating}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      {ppa.cultureSubtext}
                    </p>
                  </div>

                  {/* Stat block 3 */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 col-span-2 sm:col-span-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                      Status
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                      <p className="font-display text-xl sm:text-2xl font-black text-emerald-900">
                        {ppa.status}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 font-medium leading-none mt-0.5">
                      {ppa.statusSubtext}
                    </p>
                  </div>
                </div>
              </div>

              {/* Save/CTA Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => toggleSavePPA(ppaId)}
                  className={`px-6 py-3.5 rounded-xl font-sans font-bold text-sm flex items-center gap-2 cursor-pointer transition-all ${
                    isSaved
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-sm"
                      : "bg-[#1B4332] text-white hover:bg-emerald-900"
                  }`}
                >
                  <Bookmark
                    className={`w-4 h-4 ${
                      isSaved ? "fill-emerald-700 text-emerald-700" : ""
                    }`}
                  />
                  <span>{isSaved ? "Saved ✅" : "Save for Later"}</span>
                </button>

                <a
                  href={ppa.officialSiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3.5 border-2 border-emerald-900 text-emerald-900 rounded-xl font-sans font-bold text-sm hover:bg-emerald-50 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>View Official Site</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roommate Matchmaker Call-To-Action Banner */}
      <section className="mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-6 sm:p-10 text-white shadow-xl overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full -ml-20 -mb-20 blur-2xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-3 bg-white/10 px-3 py-1 rounded-full w-fit border border-white/10 text-xs font-bold uppercase tracking-widest text-amber-300">
                <Home className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                <span>Roommate Matchmaker</span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl lg:text-2.5xl font-black leading-tight mb-3 text-white">
                Heading to {ppa.lga}? Find other incoming corpers to share rent
                and split costs!
              </h2>
              <p className="text-emerald-100 text-sm opacity-90 leading-relaxed">
                Don't break the bank on accommodation. Connect with verified
                corpers also posted to {ppa.lga}.
              </p>
            </div>

            <button
              onClick={onNavigateToRoommates}
              className="group bg-amber-400 text-amber-950 px-8 py-4 rounded-full font-display font-extrabold text-sm sm:text-base flex items-center gap-2 hover:bg-amber-300 hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer shadow-lg shrink-0"
            >
              <span>Find Roommates</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* "The Tea" (Reviews) Section */}
      <section className="mb-12">
        <div className="flex items-end justify-between border-b border-gray-150 pb-4 mb-6">
          <div>
            <h2 className="font-display text-2xl font-black text-emerald-950">
              "The Tea"
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Unfiltered insights from corpers who have walked these halls.
            </p>
          </div>

          <button
            onClick={() => setShowReviewModal(true)}
            className="flex items-center gap-1.5 text-[#1B4332] hover:text-emerald-900 font-sans font-bold text-sm cursor-pointer hover:underline"
          >
            <span>Write a Review</span>
            <Edit className="w-4 h-4" />
          </button>
        </div>

        {/* Reviews Grid */}
        {ppa.reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ppa.reviews.map((rev: PPAReview) => (
              <motion.div
                key={rev.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-[#1b4332] border border-emerald-100 font-bold">
                      {rev.author ? rev.author.charAt(0).toUpperCase() : "A"}
                    </div>

                    <div className="text-right">
                      <div className="flex items-center justify-end gap-0.5 text-amber-400 mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 font-medium">
                        {rev.batch}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                        Monthly Stipend
                      </p>
                      <p className="text-sm font-bold text-emerald-900">
                        {rev.monthlyStipend}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                        Payment Status
                      </p>
                      <div className="flex items-center gap-1.5">
                        {rev.paymentStatus === "Promptly paid" && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        {rev.paymentStatus === "Sometimes late" && (
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        {rev.paymentStatus === "Rarely paid" && (
                          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        )}
                        <span className="text-xs font-bold text-gray-700">
                          {rev.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm italic leading-relaxed mb-4">
                    "{rev.text}"
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-100 mt-2">
                  {rev.tags.map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[11px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center max-w-md mx-auto">
            <p className="text-gray-500 text-sm">
              No reviews for this PPA yet. Be the first to share "The Tea"!
            </p>
            <button
              onClick={() => setShowReviewModal(true)}
              className="mt-4 bg-[#1B4332] text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-emerald-900 transition-colors"
            >
              Write First Review
            </button>
          </div>
        )}
      </section>

      {/* Write Review Dialog (Slide-In Overlay) */}
      <AnimatePresence>
        {showReviewModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowReviewModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh] relative"
            >
              <button
                onClick={() => setShowReviewModal(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-display text-xl font-extrabold text-emerald-950 mb-1">
                Share "The Tea" on {ppa.name}
              </h3>
              <p className="text-gray-500 text-xs mb-6">
                Your review helps future corps members navigate their service
                year with confidence.
              </p>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Your Name / Pseudonym
                  </label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="e.g., Kunle O., Anonymous Corper"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Stipend Allowance
                    </label>
                    <input
                      type="text"
                      required
                      value={newStipend}
                      onChange={(e) => setNewStipend(e.target.value)}
                      placeholder="e.g., ₦30,000"
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Service Batch
                    </label>
                    <select
                      value={newBatch}
                      onChange={(e) => setNewBatch(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white cursor-pointer"
                    >
                      <option>Batch A, 2026</option>
                      <option>Batch B, 2026</option>
                      <option>Batch C, 2025</option>
                      <option>Batch B, 2025</option>
                      <option>Batch A, 2025</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Rating (1-5 Stars)
                    </label>
                    <div className="flex gap-1 items-center py-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setNewRating(i + 1)}
                          className="text-amber-400 hover:scale-110 transition-all cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              i < newRating
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Payment Status
                    </label>
                    <select
                      value={newPaymentStatus}
                      onChange={(e: any) => setNewPaymentStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white cursor-pointer"
                    >
                      <option value="Promptly paid">Promptly paid</option>
                      <option value="Sometimes late">Sometimes late</option>
                      <option value="Rarely paid">Rarely paid</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Review Text
                  </label>
                  <textarea
                    required
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    rows={4}
                    placeholder="Tell corpers about work hours, boss behavior, extra duties, lunch, or transport access..."
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="e.g., PublicService, GoodVibes, NoStress"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addReviewMutation.isPending}
                    className="px-6 py-2.5 bg-[#1B4332] text-white rounded-lg text-sm font-bold hover:bg-emerald-900 disabled:opacity-50 cursor-pointer transition-colors"
                  >
                    {addReviewMutation.isPending ? "Posting..." : "Post Review"}
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
