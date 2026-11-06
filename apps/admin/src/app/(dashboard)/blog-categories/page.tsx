"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { blogService, BlogCategory } from "@/services/blog.service";
import {
  Layers,
  Plus,
  ArrowLeft,
  Trash2,
  Edit2,
  X,
  FileText,
  Loader2,
} from "lucide-react";

export default function BlogCategoriesPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await blogService.getCategories();
      setCategories(data);
    } catch (err: any) {
      toast.error("Failed to load categories from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await blogService.updateCategory(editingId, {
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          description: description.trim(),
        });
        toast.success("Category updated in MongoDB!");
      } else {
        await blogService.createCategory({
          name: name.trim(),
          slug: slug.trim().toLowerCase() || undefined,
          description: description.trim(),
        });
        toast.success("New category saved to MongoDB!");
      }
      resetForm();
      loadCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (cat: BlogCategory) => {
    setEditingId(cat._id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setShowAddForm(true);
  };

  const handleDelete = async (id: string, catName: string) => {
    if (confirm(`Delete category "${catName}"?`)) {
      try {
        await blogService.deleteCategory(id);
        toast.success("Category deleted from MongoDB");
        loadCategories();
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to delete category");
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setShowAddForm(false);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
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
              <Layers className="w-6 h-6 text-primary" />
              Blog Categories (MongoDB Synced)
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Organize articles into search-friendly travel themes and regional hubs.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground shadow-xs hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Add / Edit Form Modal or Card */}
      {showAddForm && (
        <form
          onSubmit={handleSave}
          className="p-5 rounded-xl border border-primary/30 bg-primary/5 dark:bg-zinc-900/50 shadow-sm flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <h3 className="text-sm font-bold text-foreground">
              {editingId ? "Edit Category" : "Create New Category"}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Hotel Guides, Heritage Stays, Travel Tips"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                URL Slug
              </label>
              <div className="flex items-center rounded-lg border border-border bg-muted/40 overflow-hidden text-xs">
                <span className="px-2.5 py-2 text-muted-foreground bg-muted font-mono select-none">
                  /blog/category/
                </span>
                <input
                  type="text"
                  placeholder="hotel-guides"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-2 py-2 bg-transparent text-foreground font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Description (Used for Category Header & Meta description)
            </label>
            <textarea
              rows={2}
              placeholder="Brief description of articles in this category..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground shadow-xs hover:opacity-90 active:scale-[0.98] cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingId ? "Update Category" : "Save to Database"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Categories Grid */}
      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
          <span>Loading categories from MongoDB...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="p-5 rounded-xl border border-border bg-card hover:border-border/80 shadow-2xs flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-foreground">
                      {cat.name}
                    </h3>
                    <span className="text-xs font-mono text-muted-foreground">
                      /blog/category/{cat.slug}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted text-[11px] font-semibold text-muted-foreground border border-border">
                    <FileText className="w-3 h-3" />
                    {cat.postCount || 0} Articles
                  </span>
                </div>

                <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {cat.description || "No description provided."}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/60">
                <Link
                  href={`/blog`}
                  className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                >
                  <span>Filter Articles</span>
                  <span>→</span>
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(cat)}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat._id, cat.name)}
                    className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-600 transition-colors cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
