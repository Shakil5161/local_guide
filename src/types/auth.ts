export type UserRole = "TOURIST" | "GUIDE" | "ADMIN";

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  status?: string;
};

export type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    role: Exclude<UserRole, "ADMIN">;
    name: string;
    phone?: string;
    city?: string;
    country?: string;
  }) => Promise<void>;
  logout: () => void;
  refetchMe: () => Promise<void>;
};
