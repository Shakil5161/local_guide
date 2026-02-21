export type TourCategory =
  | "FOOD"
  | "ART"
  | "ADVENTURE"
  | "HISTORY"
  | "NIGHTLIFE"
  | "SHOPPING"
  | "CULTURE"
  | "NATURE"
  | "PHOTOGRAPHY"
  | "OTHER";

export const TOUR_CATEGORIES: { value: TourCategory | ""; label: string }[] = [
  { value: "", label: "All Categories" },
  { value: "FOOD", label: "🍜 Food" },
  { value: "ART", label: "🎨 Art" },
  { value: "ADVENTURE", label: "🧗 Adventure" },
  { value: "HISTORY", label: "🏛️ History" },
  { value: "NIGHTLIFE", label: "🎵 Nightlife" },
  { value: "SHOPPING", label: "🛍️ Shopping" },
  { value: "CULTURE", label: "🌏 Culture" },
  { value: "NATURE", label: "🌿 Nature" },
  { value: "PHOTOGRAPHY", label: "📷 Photography" },
  { value: "OTHER", label: "✨ Other" },
];

export interface Tour {
  id: string;
  title: string;
  description: string;
  category: TourCategory;
  price: number;
  duration: number;
  maxGroupSize: number;
  location: string;
  city: string;
  country: string;
  meetingPoint: string;
  images: string[];
  included: string[];
  excluded: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  guideId: string;
  guide: {
    id: string;
    email: string;
    profile: {
      name: string;
      profilePicture: string | null;
    } | null;
  };
  _count?: {
    reviews: number;
    bookings: number;
  };
  averageRating?: number;
  reviews?: TourReview[];
}

export interface TourReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    email: string;
    profile: {
      name: string;
      profilePicture: string | null;
    } | null;
  };
}

export interface ToursMeta {
  page: number;
  limit: number;
  total: number;
}
