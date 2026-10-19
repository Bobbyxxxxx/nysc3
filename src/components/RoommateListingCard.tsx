import React from "react";
import { MapPin, MessageSquare } from "lucide-react";
import { motion } from "motion/react";
import { RoommateProfile } from "../types";

interface RoommateListingCardProps {
  profile: RoommateProfile;
  key?: React.Key;
}

export default function RoommateListingCard({ profile }: RoommateListingCardProps) {
  // Styles based on gender
  const isFemale = profile.gender === "FEMALE";
  const genderBadgeStyle = isFemale
    ? "bg-[#FADBD8] text-[#943126]"
    : "bg-[#D6EAF8] text-[#1B4F72]";

  const handleWhatsAppChat = () => {
    const text = encodeURIComponent(
      `Hello ${profile.name}, I saw your profile on NYSC Help Roommate Finder! I am also looking for a roommate. Let's connect!`
    );
    window.open(`https://wa.me/${profile.whatsAppNo}?text=${text}`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(27, 67, 50, 0.08)" }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl p-6 border border-gray-100 flex flex-col h-full shadow-sm"
    >
      {/* Top row: Avatar & Gender badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/10 bg-gray-100 shrink-0">
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider ${genderBadgeStyle}`}>
          {profile.gender}
        </span>
      </div>

      {/* Name and budget */}
      <div className="flex-grow">
        <h3 className="font-display text-xl font-bold text-gray-900 mb-1">
          {profile.name}
        </h3>
        <div className="text-secondary font-bold text-base mb-2 font-mono">
          {profile.budget}
        </div>

        {/* Target Area */}
        <p className="text-gray-500 text-sm mb-4 flex items-start gap-2 leading-relaxed">
          <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>{profile.targetArea}</span>
        </p>

        {/* Lifestyle Tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {profile.tags.map((tag, i) => (
            <span
              key={i}
              className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-[11px] font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Contact CTA Button */}
      <button
        onClick={handleWhatsAppChat}
        className="w-full bg-[#1B4332] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#123023] active:scale-95 transition-all cursor-pointer shadow-sm hover:shadow-md"
      >
        <MessageSquare className="w-4 h-4 fill-white" />
        <span>Chat on WhatsApp</span>
      </button>
    </motion.div>
  );
}
