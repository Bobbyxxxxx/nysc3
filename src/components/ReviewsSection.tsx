import React, { useState } from "react";
import { MessageSquare, Star, Search, Filter } from "lucide-react";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { MOCK_PPAS } from "../mockData";

export default function ReviewsSection() {
  const [payFilter, setPayFilter] = useState<string>("ALL");
  const [searchText, setSearchText] = useState("");

  const { data: allReviews, isLoading } = useQuery({
    queryKey: ["all-reviews", payFilter, searchText],
    queryFn: async () => {
      // Simulate fetch
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Aggregate all reviews across PPAs and link each back to its parent PPA
      const aggregated = MOCK_PPAS.flatMap((ppa) =>
        ppa.reviews.map((rev) => ({
          ...rev,
          ppaName: ppa.name,
          ppaId: ppa.id,
          ppaSector: ppa.sector,
        }))
      );

      // Filter by stipend/payment status or search query
      return aggregated.filter((rev) => {
        const matchesPay = payFilter === "ALL" || rev.paymentStatus === payFilter;
        const matchesSearch =
          searchText.trim() === "" ||
          rev.text.toLowerCase().includes(searchText.toLowerCase()) ||
          rev.ppaName.toLowerCase().includes(searchText.toLowerCase()) ||
          rev.author.toLowerCase().includes(searchText.toLowerCase());

        return matchesPay && matchesSearch;
      });
    },
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
          Unfiltered PPA Reviews
        </h1>
        <p className="text-gray-500 text-sm sm:text-base mt-2">
          Read genuine experiences from corps members across Nigeria regarding stipends, bosses, and work culture.
        </p>
      </header>

      {/* Filter and search panel */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-xl border border-gray-100 shadow-sm justify-between items-center">
        {/* Search */}
        <div className="w-full md:max-w-md flex items-center bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg focus-within:ring-2 focus-within:ring-primary-light">
          <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search reviews or PPA names..."
            className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Payment Filter */}
        <div className="w-full md:w-auto flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary shrink-0" />
          <select
            value={payFilter}
            onChange={(e) => setPayFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-bold text-gray-700 cursor-pointer outline-none focus:ring-2 focus:ring-primary-light w-full md:w-48"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="Promptly paid">Promptly Paid</option>
            <option value="Sometimes late">Sometimes Late</option>
            <option value="Rarely paid">Rarely Paid</option>
          </select>
        </div>
      </div>

      {/* Reviews feed */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-emerald-100 border-t-primary rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm mt-4 font-semibold animate-pulse">Loading reviews...</p>
        </div>
      ) : allReviews && allReviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allReviews.map((rev) => (
            <motion.div
              key={rev.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">
                      PPA Organization
                    </span>
                    <span className="font-display font-black text-sm text-primary line-clamp-1">
                      {rev.ppaName}
                    </span>
                  </div>
                  <span className="bg-primary-light/20 text-[#1b4332] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {rev.ppaSector}
                  </span>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-gray-500 font-medium">
                    By {rev.author} ({rev.batch})
                  </span>
                  <div className="flex items-center gap-0.5 text-yellow-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? "fill-yellow-500" : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                      Monthly Stipend
                    </p>
                    <p className="text-sm font-bold text-primary">
                      {rev.monthlyStipend}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                      Payment Status
                    </p>
                    <div className="flex items-center gap-1">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          rev.paymentStatus === "Promptly paid"
                            ? "bg-green-500 animate-pulse"
                            : rev.paymentStatus === "Sometimes late"
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                      />
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
                {rev.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[11px] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-12 text-center max-w-xl mx-auto">
          <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <h3 className="font-display text-lg font-bold text-gray-800">No reviews found</h3>
          <p className="text-gray-500 text-sm mt-2">
            Try adjusting your search query or selecting a different payment status filter.
          </p>
        </div>
      )}
    </div>
  );
}
