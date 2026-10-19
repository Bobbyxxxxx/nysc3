export interface PPAReview {
  id: string;
  author: string;
  batch: string; // e.g., "Batch A, 2023"
  rating: number; // 1-5
  monthlyStipend: string; // e.g., "₦35,000"
  paymentStatus: "Promptly paid" | "Sometimes late" | "Rarely paid";
  text: string;
  tags: string[]; // e.g., ["#PublicService", "#ACLife"]
}

export interface PPAListing {
  id: string;
  name: string;
  sector:
    | "GOVERNMENT"
    | "FINANCE"
    | "HEALTHCARE"
    | "OIL & GAS"
    | "EDUCATION"
    | "TECH";
  rating: number;
  location: string; // e.g., "Maitama District, Abuja Municipal"
  state: "Lagos" | "FCT" | "Rivers" | "Oyo" | "Kano";
  lga: string; // e.g., "Abuja Municipal"
  reviewsCount: number;
  imageUrl: string;
  capacity: string; // e.g., "50+"
  capacitySubtext: string; // e.g., "Corpers/Year"
  cultureRating: string; // e.g., "4.2/5"
  cultureSubtext: string; // e.g., "Work-Life Balance"
  status: "Open" | "Closed" | "Limited";
  statusSubtext: string; // e.g., "Batch C Stream II"
  officialSiteUrl: string;
  allowCorpsMembers: Boolean;
  reviews: PPAReview[];
}

export interface RoommateProfile {
  id: string;
  name: string;
  gender: "FEMALE" | "MALE";
  avatarUrl: string;
  budget: string;
  targetArea: string;
  state: string;
  lga: string;
  tags: string[];
  whatsAppNo: string;
  createdAt?: string;
}
