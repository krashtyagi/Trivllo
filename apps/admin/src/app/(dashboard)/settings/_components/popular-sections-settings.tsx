"use client";

import React, { useState, useMemo } from "react";
import {
  usePopularSections,
  useCreatePopularSection,
  useUpdatePopularSection,
  useTogglePopularSectionActive,
  useDeletePopularSection,
  useReorderPopularSections,
  useResetPopularSections,
} from "../_calls/popular-sections.query";
import { PopularSectionItem } from "@/services/popularSection.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MapPin,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle2,
  Building2,
  Tag,
  Compass,
  Bus,
  Car,
  Bike,
  Train,
  Plane,
  Clock,
  Rocket,
} from "lucide-react";
import { toast } from "sonner";

export const CATEGORY_TABS = [
  { id: "hotel", label: "Hotels", icon: Building2, isLive: true },
  { id: "tour", label: "Tours", icon: Compass, isLive: true },
  { id: "bus", label: "Buses", icon: Bus, isLive: false },
  { id: "cab", label: "Cabs", icon: Car, isLive: false },
  { id: "bike", label: "Bikes", icon: Bike, isLive: false },
  { id: "train", label: "Trains", icon: Train, isLive: false },
  { id: "flight", label: "Flights", icon: Plane, isLive: false },
] as const;

export type CategoryId = (typeof CATEGORY_TABS)[number]["id"];

export default function PopularSectionsSettings() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("hotel");
  const { data: sections = [], isLoading, refetch } = usePopularSections(
    activeCategory === "tour" ? "tour" : "hotel"
  );

  const createMutation = useCreatePopularSection();
  const updateMutation = useUpdatePopularSection();
  const toggleMutation = useTogglePopularSectionActive();
  const deleteMutation = useDeletePopularSection();
  const reorderMutation = useReorderPopularSections();
  const resetMutation = useResetPopularSections();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<PopularSectionItem | null>(null);

  // Form State
  const [city, setCity] = useState("");
  const [tagline, setTagline] = useState("");
  const [aliases, setAliases] = useState("");
  const [limit, setLimit] = useState(12);
  const [isActive, setIsActive] = useState(true);

  // Delete Alert
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const currentTabConfig = useMemo(
    () => CATEGORY_TABS.find((t) => t.id === activeCategory) || CATEGORY_TABS[0],
    [activeCategory]
  );

  // Filtered sections
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase().trim();
    return sections.filter(
      (s) =>
        s.city.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.aliases?.some((a) => a.toLowerCase().includes(q))
    );
  }, [sections, searchQuery]);

  const handleOpenCreate = () => {
    setEditingSection(null);
    setCity("");
    setTagline("");
    setAliases("");
    setLimit(12);
    setIsActive(true);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (section: PopularSectionItem) => {
    setEditingSection(section);
    setCity(section.city);
    setTagline(section.tagline);
    setAliases((section.aliases || []).join(", "));
    setLimit(section.limit || 12);
    setIsActive(section.isActive);
    setIsDialogOpen(true);
  };

  // Auto-generate tagline when typing city if tagline is empty or matches pattern
  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    if (!editingSection && (!tagline || tagline.startsWith("Popular Stays in "))) {
      setTagline(newCity.trim() ? `Popular Stays in ${newCity.trim()}` : "");
    }
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim() || !tagline.trim()) {
      toast.error("City and Tagline are required");
      return;
    }

    try {
      const aliasArray = aliases
        .split(/[,/]+/)
        .map((a) => a.trim())
        .filter(Boolean);

      const targetCategory = activeCategory === "tour" ? "tour" : "hotel";

      if (editingSection) {
        await updateMutation.mutateAsync({
          id: editingSection._id,
          payload: {
            city: city.trim(),
            tagline: tagline.trim(),
            aliases: aliasArray,
            limit: Number(limit) || 12,
            isActive,
            category: targetCategory,
          },
        });
        toast.success(`Updated destination section for ${city}`);
      } else {
        await createMutation.mutateAsync({
          city: city.trim(),
          tagline: tagline.trim(),
          aliases: aliasArray,
          limit: Number(limit) || 12,
          isActive,
          category: targetCategory,
        });
        toast.success(`Added new destination section for ${city}`);
      }

      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save section");
    }
  };

  const handleToggleActive = async (section: PopularSectionItem) => {
    try {
      await toggleMutation.mutateAsync(section._id);
      toast.success(`${section.city} is now ${!section.isActive ? "active" : "disabled"}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteMutation.mutateAsync(deleteTargetId);
      toast.success("Destination section deleted");
      setDeleteTargetId(null);
    } catch {
      toast.error("Failed to delete section");
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);

    const reorderPayload = newSections.map((item, idx) => ({
      id: item._id,
      order: idx,
    }));

    try {
      await reorderMutation.mutateAsync(reorderPayload);
      toast.success("Order updated");
    } catch {
      toast.error("Failed to update order");
    }
  };

  const handleResetDefaults = async () => {
    try {
      const targetCategory = activeCategory === "tour" ? "tour" : "hotel";
      await resetMutation.mutateAsync(targetCategory);
      toast.success(`Restored default ${targetCategory === "tour" ? "tour" : "hotel"} destination sections`);
      setIsResetConfirmOpen(false);
    } catch {
      toast.error("Failed to restore default sections");
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Category Pill Tabs ── */}
      <div className="w-full overflow-x-auto pb-1 scrollbar-none">
        <div className="inline-flex items-center gap-1.5 p-1.5 bg-muted/40 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-border/60 min-w-max">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveCategory(tab.id);
                  setSearchQuery("");
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-background text-foreground shadow-xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-emerald-500" : "text-muted-foreground"}`} />
                <span>{tab.label}</span>
                {tab.isLive ? (
                  isSelected && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      {sections.length}
                    </span>
                  )
                ) : (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Coming Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Coming Soon State for Inactive Categories ── */}
      {!currentTabConfig.isLive ? (
        <Card className="rounded-3xl border border-border/60 bg-gradient-to-br from-card/90 via-card/50 to-muted/20 backdrop-blur-xl p-8 sm:p-14 text-center relative overflow-hidden shadow-xs">
          <div className="absolute -right-20 -top-20 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 text-amber-500 flex items-center justify-center mb-5 shadow-inner">
              <currentTabConfig.icon className="h-8 w-8" />
            </div>
            <Badge className="mb-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25 font-bold px-3 py-1 rounded-full text-xs gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Coming Soon
            </Badge>
            <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {currentTabConfig.label} Destinations & Carousels
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2.5 leading-relaxed">
              The {currentTabConfig.label} booking ecosystem is currently in active development. Dynamic popular destination carousels, station hubs, and algorithmic ranking for {currentTabConfig.label.toLowerCase()} will be configurable here as soon as this service is launched.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-muted/60 border border-border/60 text-muted-foreground">
                ✓ Dynamic Section Taglines
              </span>
              <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-muted/60 border border-border/60 text-muted-foreground">
                ✓ Infinite Horizontal Carousels
              </span>
              <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-muted/60 border border-border/60 text-muted-foreground">
                ✓ Multi-locality Aliasing
              </span>
            </div>
          </div>
        </Card>
      ) : (
        /* Header Card for Live Categories */
        <Card className="border-border bg-card/60 backdrop-blur-md shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      {currentTabConfig.label} Destinations & Carousels
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm mt-0.5">
                      Control which cities and taglines render as carousels on the Trivllo {currentTabConfig.label} Home page.
                    </CardDescription>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  disabled={resetMutation.isPending}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Defaults
                </Button>
                <Button
                  onClick={handleOpenCreate}
                  size="sm"
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add City
                </Button>
              </div>
            </div>
          </CardHeader>

        <CardContent className="pt-0">
          {/* Quick stats & search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold border-emerald-200/50">
                {sections.filter((s) => s.isActive).length} Active Carousels
              </Badge>
              <Badge variant="outline" className="text-muted-foreground">
                {sections.length} Total Cities
              </Badge>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search city, tagline, or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-background/80"
              />
            </div>
          </div>

          {/* Destination Sections List */}
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <p className="text-xs text-muted-foreground">Loading destination sections...</p>
            </div>
          ) : filteredSections.length === 0 ? (
            <div className="py-12 text-center">
              <Building2 className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <h3 className="text-sm font-semibold text-foreground">No Destination Sections Found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? "No destination matched your search query. Try typing another city or area name."
                  : "No destination sections configured yet. Click 'Add City' to create your first carousel."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/60 mt-2">
              {filteredSections.map((section, idx) => (
                <div
                  key={section._id}
                  className={`py-3.5 px-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors rounded-lg hover:bg-muted/40 ${
                    !section.isActive ? "opacity-60 bg-muted/20" : ""
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Reorder Buttons */}
                    <div className="flex flex-col items-center justify-center gap-0.5 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(idx, "up")}
                        disabled={idx === 0 || reorderMutation.isPending}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <span className="text-[10px] font-mono font-bold text-muted-foreground">
                        #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(idx, "down")}
                        disabled={idx === sections.length - 1 || reorderMutation.isPending}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Section Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-foreground">
                          {section.city}
                        </span>
                        <span className="text-xs text-muted-foreground font-normal">
                          &bull; {section.tagline}
                        </span>
                        {section.isActive ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-[10px] py-0 px-1.5 h-4">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground text-[10px] py-0 px-1.5 h-4">
                            Disabled
                          </Badge>
                        )}
                        <span className="text-[11px] text-muted-foreground/80">
                          (Max {section.limit || 12} stays)
                        </span>
                      </div>

                      {/* Aliases & Localities */}
                      {section.aliases && section.aliases.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <Tag className="h-2.5 w-2.5 text-muted-foreground/60 shrink-0" />
                          <span className="text-[11px] text-muted-foreground shrink-0">Sub-areas:</span>
                          {section.aliases.map((alias) => (
                            <Badge
                              key={alias}
                              variant="secondary"
                              className="text-[10px] font-normal py-0 px-1.5 h-4 bg-muted/60 text-muted-foreground"
                            >
                              {alias}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Switch */}
                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`active-${section._id}`} className="text-xs text-muted-foreground cursor-pointer">
                        {section.isActive ? "Shown" : "Hidden"}
                      </Label>
                      <Switch
                        id={`active-${section._id}`}
                        checked={section.isActive}
                        onCheckedChange={() => handleToggleActive(section)}
                        disabled={toggleMutation.isPending}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={() => handleOpenEdit(section)}
                        title="Edit section"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        onClick={() => setDeleteTargetId(section._id)}
                        title="Delete section"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              {editingSection ? `Edit Destination: ${editingSection.city}` : "Add New Destination Carousel"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure city destination, display tagline, and known localities to match.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveSection} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-xs font-semibold">
                City Name *
              </Label>
              <Input
                id="city"
                placeholder="e.g. Shimla, Manali, Srinagar"
                value={city}
                onChange={(e) => handleCityChange(e.target.value)}
                required
                className="text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                The primary city name matched against hotel address and city records.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tagline" className="text-xs font-semibold">
                Carousel Tagline / Title *
              </Label>
              <Input
                id="tagline"
                placeholder="e.g. Popular Stays in Shimla"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                required
                className="text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Heading displayed above the carousel on the client home page.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="aliases" className="text-xs font-semibold">
                Localities / Sub-areas (Comma Separated)
              </Label>
              <Input
                id="aliases"
                placeholder="e.g. Sanjauli, Kufri, Mashobra, Chotta Shimla"
                value={aliases}
                onChange={(e) => setAliases(e.target.value)}
                className="text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Hotels located in these neighborhoods (like Sanjauli in Shimla) will automatically be grouped into this carousel.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="limit" className="text-xs font-semibold">
                  Max Hotels in Carousel
                </Label>
                <Input
                  id="limit"
                  type="number"
                  min={1}
                  max={50}
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="text-sm"
                />
              </div>

              <div className="flex flex-col justify-end space-y-2">
                <Label htmlFor="dialog-active" className="text-xs font-semibold">
                  Visibility
                </Label>
                <div className="flex items-center gap-2 h-9">
                  <Switch
                    id="dialog-active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                  <span className="text-xs text-muted-foreground">
                    {isActive ? "Active on Home" : "Hidden"}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-1.5"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                {editingSection ? "Save Changes" : "Create Carousel"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              Delete Destination Carousel?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to remove this destination section? Hotels in this city will no longer have a dedicated carousel on the home page until recreated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size="sm">Cancel</AlertDialogCancel>
            <AlertDialogAction
              size="sm"
              onClick={handleDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Defaults Confirmation Alert */}
      <AlertDialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              Restore Default Destinations?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This will reset the popular destination sections to the default list of 18 premier Indian destinations (Manali, Shimla, Srinagar, Goa, Bengaluru, Delhi, etc.). Any custom cities will be replaced.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size="sm">Cancel</AlertDialogCancel>
            <AlertDialogAction
              size="sm"
              onClick={handleResetDefaults}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Restore Defaults
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
