export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export interface Booking {
  id: string;
  touristId: string;
  guideId: string;
  tourId: string;
  bookingDate: string;
  numberOfPeople: number;
  totalPrice: number;
  status: BookingStatus;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  tour: {
    id: string;
    title: string;
    city: string;
    country: string;
    images: string[];
    price: number;
    duration: number;
    category: string;
  };
  guide?: {
    email: string;
    profile: {
      name: string;
      phone?: string;
      profilePicture?: string | null;
    } | null;
  };
  tourist?: {
    email: string;
    profile: {
      name: string;
      phone?: string;
      profilePicture?: string | null;
    } | null;
  };
  payment?: {
    id: string;
    paymentStatus: string;
    amount: number;
    paymentMethod: string;
    transactionId?: string | null;
  } | null;
}

export const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  PENDING: {
    label: "Pending",
    color: "text-amber-700",
    bg: "bg-amber-50",
    dot: "bg-amber-400",
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "text-sky-700",
    bg: "bg-sky-50",
    dot: "bg-sky-500",
  },
  COMPLETED: {
    label: "Completed",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    dot: "bg-emerald-500",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-slate-600",
    bg: "bg-slate-100",
    dot: "bg-slate-400",
  },
  REJECTED: {
    label: "Rejected",
    color: "text-rose-700",
    bg: "bg-rose-50",
    dot: "bg-rose-400",
  },
};
