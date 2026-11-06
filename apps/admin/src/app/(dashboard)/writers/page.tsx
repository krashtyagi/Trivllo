"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { blogService } from "@/services/blog.service";
import {
  Users,
  Shield,
  Plus,
  ArrowLeft,
  FileText,
  Mail,
  Info,
  Loader2,
  Copy,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function WritersRBACPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [teamUsers, setTeamUsers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("blog_author");
  const [sending, setSending] = useState(false);
  const [createdInviteUrl, setCreatedInviteUrl] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [authorsRes, invitesRes] = await Promise.all([
        blogService.listAuthors(),
        blogService.listInvitations(),
      ]);
      setProfiles(authorsRes.profiles);
      setTeamUsers(authorsRes.teamUsers);
      setInvitations(invitesRes);
    } catch (err: any) {
      toast.error("Failed to load writers from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter writer's email address");
      return;
    }

    try {
      setSending(true);
      const res = await blogService.createInvitation(email.trim(), role);
      toast.success(res.message || "Invitation generated and dispatched!");
      if (res.data?.inviteUrl) {
        setCreatedInviteUrl(res.data.inviteUrl);
      }
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create invitation");
    } finally {
      setSending(false);
    }
  };

  const copyInviteLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Invitation link copied to clipboard!");
  };

  const getRoleBadge = (r: string) => {
    switch (r?.toLowerCase()) {
      case "super_admin":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "admin":
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
      case "blog_editor":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "blog_author":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "seo_manager":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Link
            href="/blog"
            className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Writers & Role-Based Access Control (RBAC)
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Securely onboard hired writers and editors with restricted access to only content management.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setCreatedInviteUrl(null);
            setEmail("");
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground shadow-xs hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Invite Writer</span>
        </button>
      </div>

      {/* Security Architecture Notice */}
      <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 dark:bg-blue-950/20 flex items-start gap-3 text-xs leading-relaxed">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-muted-foreground">
          <strong className="text-foreground font-semibold">
            How Writer Security Works in Trivllo Admin:
          </strong>{" "}
          Authors log into this exact same Admin portal, but their navigation and API tokens are scoped. An <span className="font-semibold text-emerald-600 dark:text-emerald-400">Author</span> can only create and edit their own article drafts. They cannot view hotel bookings, payments, vendor listings, or system settings.
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
        <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Role Permissions Matrix
          </h3>
          <span className="text-xs text-muted-foreground">
            Enforced at Express API middleware
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Permission Action</th>
                <th className="py-2.5 px-4 font-semibold text-center">Super Admin</th>
                <th className="py-2.5 px-4 font-semibold text-center">Blog Editor</th>
                <th className="py-2.5 px-4 font-semibold text-center">Blog Author</th>
                <th className="py-2.5 px-4 font-semibold text-center">SEO Manager</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-2.5 px-4 font-medium text-foreground">Create & Edit Own Drafts</td>
                <td className="text-center py-2.5 px-4 text-emerald-500">✓ Full</td>
                <td className="text-center py-2.5 px-4 text-emerald-500">✓ Full</td>
                <td className="text-center py-2.5 px-4 text-emerald-500">✓ Full</td>
                <td className="text-center py-2.5 px-4 text-emerald-500">✓ Full</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-foreground">Publish Live to Trivllo</td>
                <td className="text-center py-2.5 px-4 text-emerald-500">✓ Full</td>
                <td className="text-center py-2.5 px-4 text-emerald-500">✓ Full</td>
                <td className="text-center py-2.5 px-4 text-red-500">✗ Draft Only</td>
                <td className="text-center py-2.5 px-4 text-emerald-500">✓ Full</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-foreground">Edit Other Writers&apos; Articles</td>
                <td className="text-center py-2.5 px-4 text-emerald-500">✓ Full</td>
                <td className="text-center py-2.5 px-4 text-emerald-500">✓ Full</td>
                <td className="text-center py-2.5 px-4 text-red-500">✗ Blocked</td>
                <td className="text-center py-2.5 px-4 text-emerald-500">✓ Full</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-foreground">Hotel Bookings & Payments Access</td>
                <td className="text-center py-2.5 px-4 text-emerald-500">✓ Full</td>
                <td className="text-center py-2.5 px-4 text-red-500">✗ Hidden</td>
                <td className="text-center py-2.5 px-4 text-red-500">✗ Hidden</td>
                <td className="text-center py-2.5 px-4 text-red-500">✗ Hidden</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-foreground">System & User Settings</td>
                <td className="text-center py-2.5 px-4 text-emerald-500">✓ Full</td>
                <td className="text-center py-2.5 px-4 text-red-500">✗ Hidden</td>
                <td className="text-center py-2.5 px-4 text-red-500">✗ Hidden</td>
                <td className="text-center py-2.5 px-4 text-red-500">✗ Hidden</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Writers Grid */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3">
          Active Editorial Team ({teamUsers.length})
        </h3>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
            <span>Loading writers from MongoDB...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {teamUsers.map((u) => {
              const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email;
              const profile = profiles.find((p) => p.userId?._id === u._id);

              return (
                <div
                  key={u._id}
                  className="p-5 rounded-xl border border-border bg-card shadow-2xs flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-border">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-foreground truncate">
                          {name}
                        </h4>
                        <span className="text-xs text-muted-foreground truncate block">
                          {u.email}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getRoleBadge(
                          u.role
                        )}`}
                      >
                        {u.role.replace("_", " ").toUpperCase()}
                      </span>
                    </div>

                    <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {profile?.bio || profile?.designation || "Active platform user."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-mono">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      {profile?.postsCount || 0} Articles
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Active
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            Pending Writer Invitations ({invitations.length})
          </h3>

          <div className="divide-y divide-border">
            {invitations.map((inv) => (
              <div
                key={inv._id}
                className="py-3 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-semibold text-foreground">{inv.email}</span>
                  <div className="flex items-center gap-2 text-muted-foreground mt-0.5">
                    <span>Role: {inv.assignedRole}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Expires: {new Date(inv.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full font-medium ${
                    inv.acceptedAt
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-amber-500/10 text-amber-600"
                  }`}
                >
                  {inv.acceptedAt ? "Accepted" : "Pending Activation"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form
            onSubmit={handleCreateInvitation}
            className="w-full max-w-md p-6 rounded-2xl border border-border bg-card shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-bold text-base text-foreground">
                Invite Content Writer
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {createdInviteUrl ? (
              <div className="flex flex-col gap-3 py-2">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Invitation generated and email sent!</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Direct Activation Link (Share directly if needed):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={createdInviteUrl}
                      className="w-full px-2.5 py-2 text-xs font-mono rounded-lg border border-border bg-muted text-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => copyInviteLink(createdInviteUrl)}
                      className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
                      title="Copy"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="mt-2 w-full py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Writer&apos;s Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="writer@trivllo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    RBAC Access Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="blog_author">
                      Blog Author (Can create and edit own draft articles)
                    </option>
                    <option value="blog_editor">
                      Blog Editor (Can review, approve, and publish all articles)
                    </option>
                    <option value="seo_manager">
                      SEO Manager (Can manage SEO metadata and categories)
                    </option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground shadow-xs hover:opacity-90 active:scale-[0.98] cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {sending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Send Invitation</span>
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
