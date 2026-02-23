"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/shared/page-loader";
import {
  Users,
  Map,
  CreditCard,
  BookOpen,
  Trash2,
  ShieldCheck,
  ShieldOff,
  Loader2,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserRecord {
  id: string;
  email: string;
  role: "TOURIST" | "GUIDE" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  profile: { name: string; profilePicture?: string | null } | null;
}

interface BookingRecord {
  id: string;
  status: string;
  totalPrice: number;
  numberOfPeople: number;
  bookingDate: string;
  createdAt: string;
  tour: { title: string } | null;
  tourist: { email: string; profile: { name: string } | null } | null;
  guide: { email: string; profile: { name: string } | null } | null;
}

interface PaymentRecord {
  id: string;
  paymentStatus: string;
  amount: number;
  paymentMethod: string;
  createdAt: string;
  booking: {
    tour: { title: string } | null;
    tourist: { email: string; profile: { name: string } | null } | null;
  } | null;
}

type Tab = "overview" | "users" | "tours" | "bookings" | "payments";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-violet-100 text-violet-700",
  GUIDE: "bg-sky-100 text-sky-700",
  TOURIST: "bg-emerald-100 text-emerald-700",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-sky-100 text-sky-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-600",
  REJECTED: "bg-rose-100 text-rose-700",
  completed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-rose-100 text-rose-700",
  cancelled: "bg-slate-100 text-slate-500",
};

function Badge({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${colorClass}`}
    >
      {label}
    </span>
  );
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`rounded-xl p-2 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold text-slate-800">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

// ─── Pagination bar ───────────────────────────────────────────────────────────

function Pagination({
  page,
  total,
  limit,
  onChange,
}: {
  page: number;
  total: number;
  limit: number;
  onChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
      <p className="text-xs text-slate-500">
        Page {page} of {totalPages} &middot; {total} records
      </p>
      <div className="flex gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="rounded-lg border p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="rounded-lg border p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── TABLE SKELETON ───────────────────────────────────────────────────────────

function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex animate-pulse gap-4 px-4 py-3">
          {Array.from({ length: cols }).map((__, c) => (
            <div
              key={c}
              className="h-4 flex-1 rounded bg-slate-100"
              style={{ maxWidth: c === 0 ? "180px" : undefined }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  users,
  bookings,
  payments,
}: {
  users: UserRecord[];
  bookings: BookingRecord[];
  payments: PaymentRecord[];
}) {
  const totalRevenue = payments
    .filter((p) => p.paymentStatus === "completed")
    .reduce((s, p) => s + p.amount, 0);

  const tourists = users.filter((u) => u.role === "TOURIST").length;
  const guides = users.filter((u) => u.role === "GUIDE").length;
  const pending = bookings.filter((b) => b.status === "PENDING").length;

  // Always build last 6 calendar months (so chart is always visible)
  const last6Months: { label: string; key: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    last6Months.push({
      label: d.toLocaleString("en-US", { month: "short", year: "2-digit" }),
      key: `${d.getFullYear()}-${d.getMonth()}`,
    });
  }

  const monthRevMap: Record<string, number> = {};
  payments
    .filter((p) => p.paymentStatus === "completed")
    .forEach((p) => {
      const d = new Date(p.createdAt);
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      monthRevMap[k] = (monthRevMap[k] ?? 0) + p.amount;
    });

  const monthEntries = last6Months.map((m) => ({
    label: m.label,
    rev: monthRevMap[m.key] ?? 0,
  }));
  const maxRev = Math.max(...monthEntries.map((m) => m.rev), 1);

  return (
    <div className="space-y-6">
      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={users.length}
          sub={`${tourists} tourists · ${guides} guides`}
          color="bg-violet-50 text-violet-600"
        />
        <StatCard
          icon={Map}
          label="Total Bookings"
          value={bookings.length}
          sub={`${pending} pending`}
          color="bg-sky-50 text-sky-600"
        />
        <StatCard
          icon={CreditCard}
          label="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          sub="Completed payments"
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Payments"
          value={payments.length}
          sub={`${payments.filter((p) => p.paymentStatus === "completed").length} completed`}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Revenue chart — always visible, last 6 months */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-700">Revenue by Month</h3>
            <p className="text-xs text-slate-400">Last 6 months · completed payments only</p>
          </div>
          <span className="rounded-xl bg-sky-50 px-3 py-1 text-sm font-bold text-sky-700">
            ${totalRevenue.toLocaleString()} total
          </span>
        </div>

        {/* Chart bars */}
        <div className="flex h-40 items-end gap-2">
          {monthEntries.map((m) => {
            const barH = m.rev > 0
              ? Math.max(Math.round((m.rev / maxRev) * 120), 6)
              : 4; // flat line for $0 months
            const isEmpty = m.rev === 0;
            return (
              <div key={m.label} className="group flex flex-1 flex-col items-center gap-1">
                {/* Tooltip on hover */}
                <span
                  className={`mb-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold transition-opacity ${
                    isEmpty
                      ? "text-slate-300"
                      : "text-sky-700 group-hover:opacity-100"
                  }`}
                >
                  {isEmpty ? "$0" : `$${m.rev.toLocaleString()}`}
                </span>
                {/* Bar */}
                <div className="flex w-full justify-center">
                  <div
                    className={`w-full max-w-[36px] rounded-t-lg transition-all duration-500 ${
                      isEmpty
                        ? "bg-slate-100"
                        : "bg-gradient-to-t from-sky-600 to-sky-400 shadow-sm shadow-sky-200"
                    }`}
                    style={{ height: `${barH}px` }}
                  />
                </div>
                {/* Month label */}
                <span className="mt-1 text-[10px] font-medium text-slate-500">
                  {m.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Y-axis hints */}
        {totalRevenue === 0 && (
          <p className="mt-3 text-center text-xs text-slate-400">
            No completed payments yet — bars will fill in as revenue comes in.
          </p>
        )}
      </div>

      {/* Recent bookings */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="font-semibold text-slate-700">Recent Bookings</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {bookings.slice(0, 5).map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-800">
                  {b.tour?.title ?? "—"}
                </p>
                <p className="text-xs text-slate-400">
                  {b.tourist?.profile?.name ?? b.tourist?.email ?? "—"} ·{" "}
                  {fmtDate(b.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge
                  label={b.status}
                  colorClass={STATUS_COLORS[b.status] ?? "bg-slate-100 text-slate-600"}
                />
                <span className="font-semibold text-sky-700">${b.totalPrice}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionId, setActionId] = useState<string | null>(null);
  const LIMIT = 10;

  const fetchUsers = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/users?page=${p}&limit=${LIMIT}`);
      setUsers(res.data?.data ?? []);
      setTotal(res.data?.meta?.total ?? 0);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(page);
  }, [fetchUsers, page]);

  const toggleStatus = async (user: UserRecord) => {
    setActionId(user.id);
    const toastId = toast.loading(
      user.isActive ? "Deactivating user…" : "Activating user…"
    );
    try {
      await api.patch(`/users/${user.id}/status`, {
        isActive: !user.isActive,
      });
      toast.success(
        user.isActive ? "User deactivated." : "User activated.",
        { id: toastId }
      );
      fetchUsers(page);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Action failed";
      toast.error(msg, { id: toastId });
    } finally {
      setActionId(null);
    }
  };

  const deleteUser = async (userId: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setActionId(userId);
    const toastId = toast.loading("Deleting user…");
    try {
      await api.delete(`/users/${userId}`);
      toast.success("User deleted.", { id: toastId });
      fetchUsers(page);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Delete failed";
      toast.error(msg, { id: toastId });
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="font-semibold text-slate-700">All Users</h3>
        <p className="text-xs text-slate-400">{total} total</p>
      </div>

      {loading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((u) => {
                const isAct = actionId === u.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                          {u.profile?.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <span className="font-medium text-slate-800">
                          {u.profile?.name ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge
                        label={u.role}
                        colorClass={ROLE_COLORS[u.role] ?? "bg-slate-100 text-slate-600"}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          u.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            u.isActive ? "bg-emerald-500" : "bg-rose-400"
                          }`}
                        />
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {fmtDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {u.role !== "ADMIN" && (
                          <>
                            <button
                              onClick={() => toggleStatus(u)}
                              disabled={isAct}
                              title={u.isActive ? "Deactivate" : "Activate"}
                              className="rounded-lg p-1.5 hover:bg-slate-100 disabled:opacity-50"
                            >
                              {isAct ? (
                                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                              ) : u.isActive ? (
                                <ShieldOff className="h-4 w-4 text-amber-500" />
                              ) : (
                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                deleteUser(u.id, u.profile?.name ?? u.email)
                              }
                              disabled={isAct}
                              title="Delete user"
                              className="rounded-lg p-1.5 hover:bg-rose-50 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4 text-rose-400" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={page}
        total={total}
        limit={LIMIT}
        onChange={(p) => setPage(p)}
      />
    </div>
  );
}

// ─── Bookings Tab ─────────────────────────────────────────────────────────────

function BookingsTab() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;

  const fetchBookings = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/bookings/all?page=${p}&limit=${LIMIT}`);
      setBookings(res.data?.data ?? []);
      setTotal(res.data?.meta?.total ?? 0);
    } catch {
      toast.error("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings(page);
  }, [fetchBookings, page]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="font-semibold text-slate-700">All Bookings</h3>
        <p className="text-xs text-slate-400">{total} total</p>
      </div>

      {loading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                <th className="px-4 py-3 font-medium">Tour</th>
                <th className="px-4 py-3 font-medium">Tourist</th>
                <th className="px-4 py-3 font-medium">Guide</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">People</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/60">
                  <td className="max-w-[160px] truncate px-4 py-3 font-medium text-slate-800">
                    {b.tour?.title ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {b.tourist?.profile?.name ?? b.tourist?.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {b.guide?.profile?.name ?? b.guide?.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {fmtDate(b.bookingDate)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {b.numberOfPeople}
                  </td>
                  <td className="px-4 py-3 font-semibold text-sky-700">
                    ${b.totalPrice}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      label={b.status}
                      colorClass={STATUS_COLORS[b.status] ?? "bg-slate-100 text-slate-600"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={page}
        total={total}
        limit={LIMIT}
        onChange={(p) => setPage(p)}
      />
    </div>
  );
}

// ─── Payments Tab ─────────────────────────────────────────────────────────────

function PaymentsTab() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;

  const fetchPayments = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/payments/all?page=${p}&limit=${LIMIT}`);
      setPayments(res.data?.data ?? []);
      setTotal(res.data?.meta?.total ?? 0);
    } catch {
      toast.error("Failed to load payments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments(page);
  }, [fetchPayments, page]);

  const totalRevenue = payments
    .filter((p) => p.paymentStatus === "completed")
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-4">
      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {(["completed", "pending", "failed"] as const).map((s) => {
          const count = payments.filter((p) => p.paymentStatus === s).length;
          const rev = payments
            .filter((p) => p.paymentStatus === s)
            .reduce((a, p) => a + p.amount, 0);
          return (
            <div
              key={s}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <Badge
                label={s}
                colorClass={STATUS_COLORS[s] ?? "bg-slate-100 text-slate-600"}
              />
              <p className="mt-2 text-xl font-bold text-slate-800">{count}</p>
              <p className="text-xs text-slate-400">${rev.toLocaleString()}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="font-semibold text-slate-700">All Payments</h3>
            <p className="text-xs text-slate-400">{total} total</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Total revenue</p>
            <p className="text-lg font-bold text-emerald-600">
              ${totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                  <th className="px-4 py-3 font-medium">Tour</th>
                  <th className="px-4 py-3 font-medium">Tourist</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="max-w-[160px] truncate px-4 py-3 font-medium text-slate-800">
                      {p.booking?.tour?.title ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {p.booking?.tourist?.profile?.name ??
                        p.booking?.tourist?.email ??
                        "—"}
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-500">
                      {p.paymentMethod}
                    </td>
                    <td className="px-4 py-3 font-semibold text-sky-700">
                      ${p.amount}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={p.paymentStatus}
                        colorClass={
                          STATUS_COLORS[p.paymentStatus] ??
                          "bg-slate-100 text-slate-600"
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {fmtDate(p.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          total={total}
          limit={LIMIT}
          onChange={(p) => setPage(p)}
        />
      </div>
    </div>
  );
}

// ─── Tours Tab ────────────────────────────────────────────────────────────────

interface TourAdminRecord {
  id: string;
  title: string;
  city: string;
  country: string;
  category: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  guide: { email: string; profile: { name: string } | null } | null;
  _count: { bookings: number; reviews: number };
}

function ToursTab() {
  const [tours, setTours] = useState<TourAdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;

  const fetchTours = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/tours?page=${p}&limit=${LIMIT}`);
      setTours(res.data?.data ?? []);
      setTotal(res.data?.meta?.total ?? 0);
    } catch {
      toast.error("Failed to load tours.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTours(page);
  }, [fetchTours, page]);

  const handleToggle = async (tour: TourAdminRecord) => {
    setActionId(tour.id);
    try {
      await api.patch(`/tours/${tour.id}`, { isActive: !tour.isActive });
      toast.success(tour.isActive ? "Tour unpublished." : "Tour published!");
      fetchTours(page);
    } catch {
      toast.error("Action failed.");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (tour: TourAdminRecord) => {
    if (!confirm(`Remove "${tour.title}" from the platform?`)) return;
    setActionId(tour.id);
    try {
      await api.delete(`/tours/${tour.id}`);
      toast.success("Tour removed.");
      fetchTours(page);
    } catch {
      toast.error("Delete failed.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="font-semibold text-slate-700">All Tours</h3>
        <p className="text-xs text-slate-400">{total} active tours on platform</p>
      </div>

      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : tours.length === 0 ? (
        <div className="py-16 text-center text-slate-400">No tours found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Guide</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Bookings</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tours.map((tour) => {
                const isLoading = actionId === tour.id;
                return (
                  <tr key={tour.id} className="hover:bg-slate-50/60">
                    <td className="max-w-[180px] truncate px-4 py-3 font-medium text-slate-800">
                      {tour.title}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {tour.guide?.profile?.name ?? tour.guide?.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {tour.city}, {tour.country}
                    </td>
                    <td className="px-4 py-3 font-semibold text-sky-700">
                      ${tour.price}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {tour._count?.bookings ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={tour.isActive ? "Active" : "Inactive"}
                        colorClass={
                          tour.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggle(tour)}
                          disabled={isLoading}
                          title={tour.isActive ? "Unpublish" : "Publish"}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-amber-50 hover:text-amber-600 disabled:opacity-40"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : tour.isActive ? (
                            <ShieldOff className="h-4 w-4" />
                          ) : (
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(tour)}
                          disabled={isLoading}
                          title="Remove tour"
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={page}
        total={total}
        limit={LIMIT}
        onChange={(p) => setPage(p)}
      />
    </div>
  );
}

// ─── Nav Tab Button ───────────────────────────────────────────────────────────

function TabButton({
  id,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  id: Tab;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick: (t: Tab) => void;
}) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
        active
          ? "bg-violet-600 text-white shadow"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

// ─── Admin Dashboard Content ──────────────────────────────────────────────────

function AdminDashboardContent() {
  const [tab, setTab] = useState<Tab>("overview");

  // Fetch overview data once
  const [overviewUsers, setOverviewUsers] = useState<UserRecord[]>([]);
  const [overviewBookings, setOverviewBookings] = useState<BookingRecord[]>([]);
  const [overviewPayments, setOverviewPayments] = useState<PaymentRecord[]>([]);
  const [overviewLoading, setOverviewLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      setOverviewLoading(true);
      try {
        const [uRes, bRes, pRes] = await Promise.all([
          api.get("/users?page=1&limit=100"),
          api.get("/bookings/all?page=1&limit=100"),
          api.get("/payments/all?page=1&limit=100"),
        ]);
        setOverviewUsers(uRes.data?.data ?? []);
        setOverviewBookings(bRes.data?.data ?? []);
        setOverviewPayments(pRes.data?.data ?? []);
      } catch {
        toast.error("Failed to load overview data.");
      } finally {
        setOverviewLoading(false);
      }
    };
    fetchOverview();
  }, []);

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "users", label: "Users", icon: Users },
    { id: "tours", label: "Tours", icon: Map },
    { id: "bookings", label: "Bookings", icon: BookOpen },
    { id: "payments", label: "Payments", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-700 to-indigo-700 px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold md:text-3xl">Admin Dashboard</h1>
          <p className="mt-1 text-violet-200">
            Manage users, bookings, and payments
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Tab nav */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          {TABS.map((t) => (
            <TabButton
              key={t.id}
              id={t.id}
              label={t.label}
              icon={t.icon}
              active={tab === t.id}
              onClick={setTab}
            />
          ))}
        </div>

        {/* Tab content */}
        {tab === "overview" && (
          overviewLoading ? (
            <PageLoader size="sm" message="Loading overview…" />
          ) : (
            <OverviewTab
              users={overviewUsers}
              bookings={overviewBookings}
              payments={overviewPayments}
            />
          )
        )}
        {tab === "users" && <UsersTab />}
        {tab === "tours" && <ToursTab />}
        {tab === "bookings" && <BookingsTab />}
        {tab === "payments" && <PaymentsTab />}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allow={["ADMIN"]}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
