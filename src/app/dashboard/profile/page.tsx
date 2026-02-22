"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/shared/page-loader";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Camera,
  Briefcase,
  Star,
  DollarSign,
  Languages,
  Heart,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";

// ─── Profile shape from /users/:id ───────────────────────────────────────────

interface UserProfile {
  id: string;
  email: string;
  role: "TOURIST" | "GUIDE" | "ADMIN";
  profile: {
    id: string;
    name: string;
    bio: string | null;
    phone: string | null;
    city: string | null;
    country: string | null;
    profilePicture: string | null;
    languages: string[];
    expertise: string[];
    travelPreferences: string[];
    dailyRate: number | null;
    yearsOfExperience: number | null;
    isVerified: boolean;
  } | null;
}

// ─── Tag input helper (comma-separated to/from array) ─────────────────────────

function TagInput({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  color = "sky",
}: {
  label: string;
  icon: React.ElementType;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  color?: string;
}) {
  const [raw, setRaw] = useState(value.join(", "));

  const handleBlur = () => {
    const arr = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    onChange(arr);
    setRaw(arr.join(", "));
  };

  const colorMap: Record<string, string> = {
    sky: "bg-sky-50 text-sky-700 ring-sky-100",
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
  };

  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
        <Icon className="h-3.5 w-3.5" />
        {label}
        <span className="font-normal text-slate-400">(comma-separated)</span>
      </label>
      <input
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
      />
      {/* Tag previews */}
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <span
              key={tag}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${colorMap[color] ?? colorMap.sky}`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
      <div className="rounded-lg bg-sky-50 p-1.5">
        <Icon className="h-4 w-4 text-sky-600" />
      </div>
      <h3 className="font-semibold text-slate-700">{title}</h3>
    </div>
  );
}

// ─── Input field ──────────────────────────────────────────────────────────────

const fieldCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100";

// ─── Profile Page Content ─────────────────────────────────────────────────────

function ProfileContent() {
  const { user, refetchMe } = useAuth();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [expertise, setExpertise] = useState<string[]>([]);
  const [travelPreferences, setTravelPreferences] = useState<string[]>([]);
  const [dailyRate, setDailyRate] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    setLoadingProfile(true);
    try {
      const res = await api.get(`/users/${user.id}`);
      const data: UserProfile = res.data?.data;
      setProfileData(data);

      const p = data.profile;
      if (p) {
        setName(p.name ?? "");
        setBio(p.bio ?? "");
        setPhone(p.phone ?? "");
        setCity(p.city ?? "");
        setCountry(p.country ?? "");
        setProfilePicture(p.profilePicture ?? "");
        setLanguages(p.languages ?? []);
        setExpertise(p.expertise ?? []);
        setTravelPreferences(p.travelPreferences ?? []);
        setDailyRate(p.dailyRate != null ? String(p.dailyRate) : "");
        setYearsOfExperience(
          p.yearsOfExperience != null ? String(p.yearsOfExperience) : ""
        );
      }
    } catch {
      toast.error("Failed to load profile.");
    } finally {
      setLoadingProfile(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !name.trim()) {
      toast.error("Name is required.");
      return;
    }
    setSaving(true);
    const toastId = toast.loading("Saving profile…");
    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        bio: bio.trim() || null,
        phone: phone.trim() || null,
        city: city.trim() || null,
        country: country.trim() || null,
        profilePicture: profilePicture.trim() || null,
        languages,
        expertise,
        travelPreferences,
      };

      if (user.role === "GUIDE") {
        payload.dailyRate = dailyRate ? Number(dailyRate) : null;
        payload.yearsOfExperience = yearsOfExperience
          ? Number(yearsOfExperience)
          : null;
      }

      await api.patch(`/users/profile/${user.id}`, payload);
      await refetchMe();
      await fetchProfile();
      toast.success("Profile updated successfully!", { id: toastId });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to save profile";
      toast.error(msg, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loadingProfile) return <PageLoader message="Loading your profile…" />;

  const avatarSrc =
    profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=0ea5e9&color=fff&size=200`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-sky-700 to-indigo-700 px-4 pb-16 pt-10 text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-bold md:text-3xl">My Profile</h1>
          <p className="mt-1 text-sky-100">
            Manage your personal information and preferences
          </p>
        </div>
      </div>

      {/* Card lifted over banner */}
      <div className="mx-auto max-w-3xl px-4">
        <div className="-mt-10 rounded-2xl border border-slate-200 bg-white shadow-lg">
          {/* Avatar + name row */}
          <div className="flex flex-col items-center gap-4 border-b border-slate-100 px-6 py-6 sm:flex-row">
            <div className="relative">
              <div className="h-20 w-20 overflow-hidden rounded-full ring-4 ring-white shadow-md">
                <Image
                  src={avatarSrc}
                  alt={name || "avatar"}
                  width={80}
                  height={80}
                  className="object-cover"
                  unoptimized
                />
              </div>
              {/* Verified badge */}
              {profileData?.profile?.isVerified && (
                <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-0.5">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{name || "—"}</p>
              <p className="text-sm text-slate-500">{profileData?.email}</p>
              <span
                className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  user?.role === "GUIDE"
                    ? "bg-sky-100 text-sky-700"
                    : user?.role === "ADMIN"
                    ? "bg-violet-100 text-violet-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {user?.role}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-8 p-6">
            {/* ── Basic Info ── */}
            <div className="space-y-4">
              <SectionHeading icon={User} title="Basic Information" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    className={fieldCls}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-600">
                    <Mail className="h-3 w-3" /> Email
                  </label>
                  <input
                    className={`${fieldCls} cursor-not-allowed opacity-60`}
                    value={profileData?.email ?? ""}
                    disabled
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Bio
                </label>
                <textarea
                  className={`${fieldCls} min-h-[90px] resize-y`}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell visitors a little about yourself…"
                />
              </div>

              {/* Profile picture */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <Camera className="h-3.5 w-3.5" /> Profile Picture URL
                </label>
                <input
                  className={fieldCls}
                  value={profilePicture}
                  onChange={(e) => setProfilePicture(e.target.value)}
                  placeholder="https://example.com/my-photo.jpg"
                />
                {profilePicture && (
                  <div className="mt-2 flex items-center gap-3">
                    <Image
                      src={profilePicture}
                      alt="preview"
                      width={48}
                      height={48}
                      className="rounded-full object-cover ring-2 ring-sky-100"
                      unoptimized
                    />
                    <p className="text-xs text-slate-400">Preview</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Contact & Location ── */}
            <div className="space-y-4">
              <SectionHeading icon={MapPin} title="Contact & Location" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-600">
                    <Phone className="h-3 w-3" /> Phone
                  </label>
                  <input
                    className={fieldCls}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-600">
                    <MapPin className="h-3 w-3" /> City
                  </label>
                  <input
                    className={fieldCls}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Paris"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-600">
                    <Globe className="h-3 w-3" /> Country
                  </label>
                  <input
                    className={fieldCls}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. France"
                  />
                </div>
              </div>
            </div>

            {/* ── Languages & Preferences ── */}
            <div className="space-y-4">
              <SectionHeading icon={Languages} title="Languages & Preferences" />
              <TagInput
                label="Languages Spoken"
                icon={Languages}
                value={languages}
                onChange={setLanguages}
                placeholder="English, French, Spanish"
                color="sky"
              />
              <TagInput
                label="Travel Preferences"
                icon={Heart}
                value={travelPreferences}
                onChange={setTravelPreferences}
                placeholder="Adventure, Culture, Food"
                color="amber"
              />
            </div>

            {/* ── Guide-specific ── */}
            {user?.role === "GUIDE" && (
              <div className="space-y-4">
                <SectionHeading icon={Briefcase} title="Guide Details" />

                <TagInput
                  label="Areas of Expertise"
                  icon={Star}
                  value={expertise}
                  onChange={setExpertise}
                  placeholder="History, Art, Food tours"
                  color="indigo"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-600">
                      <DollarSign className="h-3 w-3" /> Daily Rate ($)
                    </label>
                    <input
                      className={fieldCls}
                      type="number"
                      min="0"
                      value={dailyRate}
                      onChange={(e) => setDailyRate(e.target.value)}
                      placeholder="e.g. 150"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-600">
                      <Briefcase className="h-3 w-3" /> Years of Experience
                    </label>
                    <input
                      className={fieldCls}
                      type="number"
                      min="0"
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(e.target.value)}
                      placeholder="e.g. 5"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Save button */}
            <div className="flex justify-end border-t border-slate-100 pt-4">
              <Button
                type="submit"
                disabled={saving}
                className="min-w-[160px] gap-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* bottom spacing */}
      <div className="h-12" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  return (
    <ProtectedRoute allow={["TOURIST", "GUIDE", "ADMIN"]}>
      <ProfileContent />
    </ProtectedRoute>
  );
}
