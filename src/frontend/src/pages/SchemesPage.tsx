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
  BookOpen,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { GovernmentScheme } from "../backend.d";
import { SchemeCategory } from "../backend.d";
import type { backendInterface as ExtendedBackend } from "../backend.d";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const STATIC_SCHEMES: Omit<
  GovernmentScheme,
  "id" | "createdAt" | "isActive"
>[] = [
  {
    name: "PM-KISAN",
    category: SchemeCategory.subsidy,
    eligibility: "All small and marginal farmers with cultivable land",
    benefits:
      "₹6,000 per year in 3 installments of ₹2,000 directly to bank account",
    applicationUrl: "https://pmkisan.gov.in",
    deadline: "Ongoing",
  },
  {
    name: "Pradhan Mantri Fasal Bima Yojana",
    category: SchemeCategory.insurance,
    eligibility: "All farmers growing notified crops in notified areas",
    benefits:
      "Crop insurance coverage for losses due to natural calamities, pests and diseases",
    applicationUrl: "https://pmfby.gov.in",
    deadline: "Seasonal",
  },
  {
    name: "Kisan Credit Card",
    category: SchemeCategory.loan,
    eligibility: "All farmers, sharecroppers, tenant farmers",
    benefits:
      "Credit up to ₹3 lakh at 4% interest for crop production and allied activities",
    applicationUrl: "https://www.nabard.org",
    deadline: "Ongoing",
  },
  {
    name: "Soil Health Card Scheme",
    category: SchemeCategory.training,
    eligibility: "All farmers",
    benefits:
      "Free soil testing and recommendation for fertilizer use to improve productivity",
    applicationUrl: "https://soilhealth.dac.gov.in",
    deadline: "Ongoing",
  },
  {
    name: "PM Kisan Samman Nidhi",
    category: SchemeCategory.subsidy,
    eligibility: "Farmers with less than 2 hectares of land",
    benefits: "Income support of ₹6,000 per year",
    applicationUrl: "https://pmkisan.gov.in",
    deadline: "Ongoing",
  },
];

const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Subsidy", value: SchemeCategory.subsidy },
  { label: "Loan", value: SchemeCategory.loan },
  { label: "Insurance", value: SchemeCategory.insurance },
  { label: "Training", value: SchemeCategory.training },
  { label: "Other", value: SchemeCategory.other },
];

const catColor: Record<string, string> = {
  subsidy: "bg-green-100 text-green-800",
  loan: "bg-blue-100 text-blue-800",
  insurance: "bg-purple-100 text-purple-800",
  training: "bg-orange-100 text-orange-800",
  other: "bg-gray-100 text-gray-700",
};

const emptyForm = {
  name: "",
  category: SchemeCategory.subsidy,
  eligibility: "",
  benefits: "",
  applicationUrl: "",
  deadline: "",
};

export default function SchemesPage() {
  const { actor: rawActor } = useActor();
  const actor = rawActor as unknown as ExtendedBackend;
  const { identity } = useInternetIdentity();
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editScheme, setEditScheme] = useState<GovernmentScheme | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const load = async () => {
    if (!actor) return;
    try {
      const data = await actor.getAllSchemes();
      setSchemes(data);
      if (identity) {
        const admin = await actor.isCallerAdmin();
        setIsAdmin(admin);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    load();
  }, [actor, identity]);

  const displaySchemes =
    schemes.length > 0
      ? schemes
      : STATIC_SCHEMES.map((s, i) => ({
          ...s,
          id: BigInt(i + 1),
          createdAt: BigInt(0),
          isActive: true,
        }));

  const filtered = displaySchemes.filter((s) => {
    const matchCat = activeCategory === "all" || s.category === activeCategory;
    const matchSearch =
      search === "" ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.eligibility.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && s.isActive;
  });

  const openAdd = () => {
    setEditScheme(null);
    setForm({ ...emptyForm });
    setSheetOpen(true);
  };
  const openEdit = (s: GovernmentScheme) => {
    setEditScheme(s);
    setForm({
      name: s.name,
      category: s.category,
      eligibility: s.eligibility,
      benefits: s.benefits,
      applicationUrl: s.applicationUrl,
      deadline: s.deadline,
    });
    setSheetOpen(true);
  };

  const handleSave = async () => {
    if (!actor) return;
    if (!form.name || !form.eligibility || !form.benefits) {
      toast.error("Fill required fields");
      return;
    }
    setSaving(true);
    try {
      if (editScheme) {
        await actor.updateScheme(
          editScheme.id,
          form.name,
          form.category as SchemeCategory,
          form.eligibility,
          form.benefits,
          form.applicationUrl,
          form.deadline,
          true,
        );
        toast.success("Scheme updated");
      } else {
        await actor.createScheme(
          form.name,
          form.category as SchemeCategory,
          form.eligibility,
          form.benefits,
          form.applicationUrl,
          form.deadline,
        );
        toast.success("Scheme added");
      }
      setSheetOpen(false);
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!actor) return;
    try {
      await actor.deleteScheme(id);
      toast.success("Scheme deleted");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="container max-w-5xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-2xl font-black">
                Government Schemes
              </h1>
              <p className="font-body text-sm text-muted-foreground mt-0.5">
                Subsidies, loans, and insurance for farmers
              </p>
            </div>
            {isAdmin && (
              <Button
                onClick={openAdd}
                className="font-body font-semibold"
                data-ocid="schemes.open_modal_button"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Scheme
              </Button>
            )}
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search schemes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-ocid="schemes.search_input"
            />
          </div>

          <div className="flex gap-2 flex-wrap mb-6">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant={activeCategory === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.value)}
                className="font-body font-semibold"
                data-ocid="schemes.tab"
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {loading ? (
            <div
              className="flex justify-center py-20"
              data-ocid="schemes.loading_state"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="text-center py-20 text-muted-foreground font-body"
              data-ocid="schemes.empty_state"
            >
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No schemes found.</p>
            </div>
          ) : (
            <motion.div
              className="space-y-4"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.06 } },
              }}
            >
              {filtered.map((s, idx) => (
                <motion.div
                  key={String(s.id)}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0 },
                  }}
                  data-ocid={`schemes.item.${idx + 1}`}
                >
                  <Card className="border-border/60 hover:shadow-card transition-shadow">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span
                              className={`text-xs font-body font-semibold px-2 py-0.5 rounded-full capitalize ${catColor[s.category] ?? "bg-gray-100"}`}
                            >
                              {s.category}
                            </span>
                            {s.deadline && (
                              <span className="font-body text-xs text-muted-foreground">
                                Deadline: {s.deadline}
                              </span>
                            )}
                          </div>
                          <h3 className="font-display font-bold text-foreground text-lg mb-1">
                            {s.name}
                          </h3>
                          <p className="font-body text-sm text-muted-foreground mb-2">
                            <strong>Eligibility:</strong> {s.eligibility}
                          </p>
                          <p className="font-body text-sm text-primary font-semibold">
                            <strong className="text-foreground font-bold">
                              Benefits:
                            </strong>{" "}
                            {s.benefits}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {s.applicationUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                              className="font-body font-semibold"
                              data-ocid={`schemes.primary_button.${idx + 1}`}
                            >
                              <a
                                href={s.applicationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                Apply
                              </a>
                            </Button>
                          )}
                          {isAdmin && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEdit(s as GovernmentScheme)}
                                className="font-body text-xs"
                                data-ocid={`schemes.edit_button.${idx + 1}`}
                              >
                                <Pencil className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleDelete((s as GovernmentScheme).id)
                                }
                                className="font-body text-xs text-destructive"
                                data-ocid={`schemes.delete_button.${idx + 1}`}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          className="w-full sm:max-w-md overflow-y-auto"
          data-ocid="schemes.sheet"
        >
          <SheetHeader>
            <SheetTitle className="font-display font-black">
              {editScheme ? "Edit Scheme" : "Add Government Scheme"}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Scheme Name *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                data-ocid="schemes.input"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as SchemeCategory }))
                }
              >
                <SelectTrigger data-ocid="schemes.select">
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
            <div>
              <Label>Eligibility *</Label>
              <Textarea
                value={form.eligibility}
                onChange={(e) =>
                  setForm((f) => ({ ...f, eligibility: e.target.value }))
                }
                data-ocid="schemes.textarea"
              />
            </div>
            <div>
              <Label>Benefits *</Label>
              <Textarea
                value={form.benefits}
                onChange={(e) =>
                  setForm((f) => ({ ...f, benefits: e.target.value }))
                }
                data-ocid="schemes.textarea"
              />
            </div>
            <div>
              <Label>Application URL</Label>
              <Input
                value={form.applicationUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, applicationUrl: e.target.value }))
                }
                placeholder="https://..."
                data-ocid="schemes.input"
              />
            </div>
            <div>
              <Label>Deadline</Label>
              <Input
                value={form.deadline}
                onChange={(e) =>
                  setForm((f) => ({ ...f, deadline: e.target.value }))
                }
                placeholder="e.g. March 31, 2026"
                data-ocid="schemes.input"
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full font-body font-semibold"
              data-ocid="schemes.submit_button"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Scheme"
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Footer />
    </div>
  );
}
