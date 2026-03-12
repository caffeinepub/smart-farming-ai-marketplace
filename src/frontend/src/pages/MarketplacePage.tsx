import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { CropListing } from "../backend.d";
import { CropCategory } from "../backend.d";
import type { backendInterface as ExtendedBackend } from "../backend.d";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Grains", value: CropCategory.grains },
  { label: "Vegetables", value: CropCategory.vegetables },
  { label: "Fruits", value: CropCategory.fruits },
  { label: "Pulses", value: CropCategory.pulses },
  { label: "Spices", value: CropCategory.spices },
  { label: "Other", value: CropCategory.other },
];

const categoryColor: Record<string, string> = {
  grains: "bg-amber-100 text-amber-800",
  vegetables: "bg-green-100 text-green-800",
  fruits: "bg-orange-100 text-orange-800",
  pulses: "bg-yellow-100 text-yellow-800",
  spices: "bg-red-100 text-red-800",
  other: "bg-gray-100 text-gray-700",
};

const emptyForm = {
  cropName: "",
  category: CropCategory.grains,
  quantity: "",
  unit: "kg",
  pricePerQuintal: "",
  description: "",
  location: "",
};

export default function MarketplacePage() {
  const { actor: rawActor } = useActor();
  const actor = rawActor as unknown as ExtendedBackend;
  const { identity } = useInternetIdentity();
  const [listings, setListings] = useState<CropListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editListing, setEditListing] = useState<CropListing | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const callerPrincipal = identity?.getPrincipal().toString();

  const load = async () => {
    if (!actor) return;
    try {
      const data = await actor.getAllCropListings();
      setListings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    load();
  }, [actor]);

  const filtered = listings.filter((l) => {
    const matchCat = activeCategory === "all" || l.category === activeCategory;
    const matchSearch =
      search === "" ||
      l.cropName.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const openAdd = () => {
    setEditListing(null);
    setForm({ ...emptyForm });
    setSheetOpen(true);
  };
  const openEdit = (l: CropListing) => {
    setEditListing(l);
    setForm({
      cropName: l.cropName,
      category: l.category,
      quantity: String(l.quantity),
      unit: l.unit,
      pricePerQuintal: String(l.pricePerQuintal),
      description: l.description,
      location: l.location,
    });
    setSheetOpen(true);
  };

  const handleSave = async () => {
    if (!actor) return;
    if (
      !form.cropName ||
      !form.quantity ||
      !form.pricePerQuintal ||
      !form.location
    ) {
      toast.error("Fill all required fields");
      return;
    }
    setSaving(true);
    try {
      if (editListing) {
        await actor.updateCropListing(
          editListing.id,
          form.cropName,
          form.category as CropCategory,
          Number.parseFloat(form.quantity),
          form.unit,
          Number.parseFloat(form.pricePerQuintal),
          form.description,
          form.location,
        );
        toast.success("Listing updated");
      } else {
        await actor.createCropListing(
          form.cropName,
          form.category as CropCategory,
          Number.parseFloat(form.quantity),
          form.unit,
          Number.parseFloat(form.pricePerQuintal),
          form.description,
          form.location,
        );
        toast.success("Listing created");
      }
      setSheetOpen(false);
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Error saving listing");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkSold = async (id: bigint) => {
    if (!actor) return;
    try {
      await actor.markCropAsSold(id);
      toast.success("Marked as sold");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Error");
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!actor) return;
    try {
      await actor.deleteCropListing(id);
      toast.success("Listing deleted");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="container max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-2xl font-black text-foreground">
                Crop Marketplace
              </h1>
              <p className="font-body text-sm text-muted-foreground mt-0.5">
                Buy and sell crops directly
              </p>
            </div>
            {identity && (
              <Button
                onClick={openAdd}
                className="font-body font-semibold"
                data-ocid="marketplace.open_modal_button"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Listing
              </Button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search crops or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-ocid="marketplace.search_input"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mb-6">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant={activeCategory === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.value)}
                className="font-body font-semibold"
                data-ocid={"marketplace.tab"}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {loading ? (
            <div
              className="flex justify-center py-20"
              data-ocid="marketplace.loading_state"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="text-center py-20 text-muted-foreground font-body"
              data-ocid="marketplace.empty_state"
            >
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>
                No listings found.{" "}
                {identity
                  ? "Be the first to add one!"
                  : "Login to add listings."}
              </p>
            </div>
          ) : (
            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.05 } },
              }}
            >
              {filtered.map((l, idx) => {
                const isOwner = callerPrincipal === l.seller.toString();
                return (
                  <motion.div
                    key={String(l.id)}
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      show: { opacity: 1, y: 0 },
                    }}
                    data-ocid={`marketplace.item.${idx + 1}`}
                  >
                    <Card className="h-full border-border/60 hover:shadow-card transition-shadow">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start justify-between mb-2">
                          <span
                            className={`text-xs font-body font-semibold px-2 py-0.5 rounded-full capitalize ${categoryColor[l.category] ?? "bg-gray-100"}`}
                          >
                            {l.category}
                          </span>
                          {l.status === "sold" && (
                            <Badge variant="secondary" className="text-xs">
                              Sold
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-display font-bold text-foreground text-base mb-1">
                          {l.cropName}
                        </h3>
                        <p className="font-display text-xl font-black text-primary">
                          ₹{l.pricePerQuintal.toFixed(0)}
                          <span className="text-xs font-body text-muted-foreground font-normal">
                            /quintal
                          </span>
                        </p>
                        <p className="font-body text-sm text-muted-foreground mt-1">
                          {l.quantity} {l.unit} available
                        </p>
                        {l.description && (
                          <p className="font-body text-xs text-muted-foreground mt-1 line-clamp-2">
                            {l.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="font-body text-xs text-muted-foreground">
                            {l.location}
                          </span>
                        </div>
                        {isOwner && l.status !== "sold" && (
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEdit(l)}
                              className="flex-1 font-body text-xs"
                              data-ocid={`marketplace.edit_button.${idx + 1}`}
                            >
                              <Pencil className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkSold(l.id)}
                              className="flex-1 font-body text-xs"
                              data-ocid={`marketplace.secondary_button.${idx + 1}`}
                            >
                              Sold
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(l.id)}
                              className="font-body text-xs text-destructive hover:text-destructive"
                              data-ocid={`marketplace.delete_button.${idx + 1}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </main>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          className="w-full sm:max-w-md overflow-y-auto"
          data-ocid="marketplace.sheet"
        >
          <SheetHeader>
            <SheetTitle className="font-display font-black">
              {editListing ? "Edit Listing" : "Add Crop Listing"}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Crop Name *</Label>
              <Input
                value={form.cropName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cropName: e.target.value }))
                }
                placeholder="e.g. Wheat"
                data-ocid="marketplace.input"
              />
            </div>
            <div>
              <Label>Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as CropCategory }))
                }
              >
                <SelectTrigger data-ocid="marketplace.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter((c) => c.value !== "all").map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, quantity: e.target.value }))
                  }
                  placeholder="100"
                  data-ocid="marketplace.input"
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Input
                  value={form.unit}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, unit: e.target.value }))
                  }
                  placeholder="kg"
                  data-ocid="marketplace.input"
                />
              </div>
            </div>
            <div>
              <Label>Price per Quintal (₹) *</Label>
              <Input
                type="number"
                value={form.pricePerQuintal}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pricePerQuintal: e.target.value }))
                }
                placeholder="2000"
                data-ocid="marketplace.input"
              />
            </div>
            <div>
              <Label>Location *</Label>
              <Input
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                placeholder="Village, District, State"
                data-ocid="marketplace.input"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Details about the crop..."
                data-ocid="marketplace.textarea"
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full font-body font-semibold"
              data-ocid="marketplace.submit_button"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Listing"
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Footer />
    </div>
  );
}
