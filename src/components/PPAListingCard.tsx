import React from "react";
import { Star, MapPin, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { PPAListing } from "../types";

interface PPAListingCardProps {
  ppa: PPAListing;
  onViewDetails: (id: string) => void;
  key?: React.Key;
}

export default function PPAListingCard({ ppa, onViewDetails }: PPAListingCardProps) {
  // Define sector tag color styling based on sector name
  const getSectorStyle = (sector: string) => {
    switch (sector) {
      case "GOVERNMENT":
        return { bg: "bg-amber-100/80 text-amber-800", text: "GOVERNMENT" };
      case "FINANCE":
        return { bg: "bg-blue-100/80 text-blue-800", text: "FINANCE" };
      case "HEALTHCARE":
        return { bg: "bg-cyan-100/80 text-cyan-800", text: "HEALTHCARE" };
      case "OIL & GAS":
        return { bg: "bg-yellow-100/80 text-yellow-800", text: "OIL & GAS" };
      case "EDUCATION":
        return { bg: "bg-purple-100/80 text-purple-800", text: "EDUCATION" };
      case "TECH":
        return { bg: "bg-emerald-100/80 text-emerald-800", text: "TECH" };
      default:
        return { bg: "bg-gray-100/80 text-gray-800", text: sector };
    }
  };

  const sectorStyle = getSectorStyle(ppa.sector);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: "0 12px 24px rgba(1, 45, 29, 0.08)" }}
      transition={{ duration: 0.3 }}
      onClick={() => onViewDetails(ppa.id)}
      className="bg-white rounded-xl overflow-hidden border border-gray-100 cursor-pointer flex flex-col sm:flex-row h-full shadow-sm hover:border-primary-light/50 transition-colors"
    >
      {/* Cover Image */}
      <div 
        className="w-full sm:w-1/3 min-h-[160px] bg-center bg-cover relative"
        style={{ backgroundImage: `url('${ppa.imageUrl}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent sm:hidden" />
      </div>

      {/* Content */}
      <div className="w-full sm:w-2/3 p-5 flex flex-col justify-between">
        <div>
          {/* Header row: Sector and Rating */}
          <div className="flex justify-between items-center mb-3">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase ${sectorStyle.bg}`}>
              {sectorStyle.text}
            </span>
            <div className="flex items-center gap-1 bg-amber-50/80 px-2 py-0.5 rounded-full border border-amber-100">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="font-sans text-xs font-bold text-gray-800">{ppa.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-display text-lg font-bold text-primary mb-1 line-clamp-1 group-hover:text-primary-container">
            {ppa.name}
          </h3>

          {/* Location */}
          <div className="flex items-center text-gray-500 gap-1 mb-4">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-primary-container" />
            <span className="text-xs font-medium truncate">{ppa.location}</span>
          </div>
        </div>

        {/* Footer info: Reviews count and details button */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-2">
          <span className="text-xs text-gray-400 italic">
            {ppa.reviewsCount} reviews
          </span>
          <button 
            className="flex items-center text-primary-container font-sans font-bold text-xs gap-1 hover:text-primary transition-colors cursor-pointer group"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(ppa.id);
            }}
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
