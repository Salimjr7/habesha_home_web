import { AdminService } from "@/server/services/admin.service";
import { UserRole } from "@prisma/client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Shield, ShieldAlert, CheckCircle, Ban, Search, Mail, Phone } from "lucide-react";
import prisma from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface AdminUsersPageProps {
  searchParams: Promise<{ role?: string; page?: string }>;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const { role, page } = await searchParams;
  const pageNumber = parseInt(page || "1", 10);
  const userRole = role ? (role.toUpperCase() as UserRole) : undefined;

  let data = { users: [] as any[], pagination: { total: 0, page: 1, limit: 20, totalPages: 1 } };
  try {
    data = await AdminService.getUsers(pageNumber, 20, userRole);
  } catch {
    // fallback
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Platform Users
          </span>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight mt-1">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Audit registered renters, verified hosts, and platform administrators.
          </p>
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "RENTER", "OWNER", "ADMIN"].map((r) => {
          const isActive = (r === "ALL" && !role) || role?.toUpperCase() === r;
          const href = r === "ALL" ? "/admin/users" : `/admin/users?role=${r.toLowerCase()}`;
          return (
            <a
              key={r}
              href={href}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </a>
          );
        })}
      </div>

      {/* Users Table */}
      <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-secondary/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Properties / Stays</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Joined</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-xs">
              {data.users.length > 0 ? (
                data.users.map((u) => (
                  <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} size="sm" />
                        <div>
                          <div className="font-bold text-foreground text-sm">{u.name}</div>
                          <div className="text-muted-foreground flex items-center gap-2">
                            <span>{u.email}</span>
                            {u.phone && <span>• {u.phone}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === "ADMIN"
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                            : u.role === "OWNER"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-foreground">
                      {u._count.properties} listings • {u._count.bookings} bookings
                    </td>
                    <td className="py-4 px-6">
                      {u.banned ? (
                        <span className="inline-flex items-center gap-1 text-red-500 font-bold">
                          <Ban className="w-3.5 h-3.5" /> Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-muted-foreground">{formatDate(u.createdAt)}</td>
                    <td className="py-4 px-6 text-right">
                      <Button variant="ghost" size="sm" className="text-xs">
                        Details
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No users matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
