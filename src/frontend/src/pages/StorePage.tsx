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
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { StoreProduct } from "../backend.d";
import { ProductCategory } from "../backend.d";
import type { backendInterface as ExtendedBackend } from "../backend.d";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Fertilizer", value: ProductCategory.fertilizer },
  { label: "Seeds", value: ProductCategory.seeds },
  { label: "Pesticides", value: ProductCategory.pesticides },
  { label: "Tools", value: ProductCategory.tools },
  { label: "Other", value: ProductCategory.other },
];

const catColor: Record<string, string> = {
  fertilizer: "bg-emerald-100 text-emerald-800",
  seeds: "bg-lime-100 text-lime-800",
  pesticides: "bg-red-100 text-red-800",
  tools: "bg-blue-100 text-blue-800",
  other: "bg-gray-100 text-gray-700",
};

const emptyForm = {
  name: "",
  category: ProductCategory.fertilizer,
  price: "",
  unit: "",
  stock: "",
  description: "",
};

export default function StorePage() {
  const { actor: rawActor } = useActor();
  const actor = rawActor as unknown as ExtendedBackend;
  const { identity } = useInternetIdentity();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<StoreProduct | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const callerPrincipal = identity?.getPrincipal().toString();

  const load = async () => {
    if (!actor) return;
    try {
      const data = await actor.getAllStoreProducts();
      setProducts(data);
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

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === "all" || p.category === activeCategory;
    const matchSearch =
      search === "" || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const openAdd = () => {
    setEditProduct(null);
    setForm({ ...emptyForm });
    setSheetOpen(true);
  };
  const openEdit = (p: StoreProduct) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      category: p.category,
      price: String(p.price),
      unit: p.unit,
      stock: String(p.stock),
      description: p.description,
    });
    setSheetOpen(true);
  };

  const handleSave = async () => {
    if (!actor) return;
    if (!form.name || !form.price || !form.unit) {
      toast.error("Fill required fields");
      return;
    }
    setSaving(true);
    try {
      if (editProduct) {
        await actor.updateStoreProduct(
          editProduct.id,
          form.name,
          form.category as ProductCategory,
          Number.parseFloat(form.price),
          form.unit,
          BigInt(form.stock || "0"),
          form.description,
        );
        toast.success("Product updated");
      } else {
        await actor.createStoreProduct(
          form.name,
          form.category as ProductCategory,
          Number.parseFloat(form.price),
          form.unit,
          BigInt(form.stock || "0"),
          form.description,
        );
        toast.success("Product added");
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
      await actor.deleteStoreProduct(id);
      toast.success("Product deleted");
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
              <h1 className="font-display text-2xl font-black">
                Agriculture Store
              </h1>
              <p className="font-body text-sm text-muted-foreground mt-0.5">
                Seeds, fertilizers, tools and more
              </p>
            </div>
            <Button
              onClick={openAdd}
              className="font-body font-semibold"
              data-ocid="store.open_modal_button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-ocid="store.search_input"
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
                data-ocid="store.tab"
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {loading ? (
            <div
              className="flex justify-center py-20"
              data-ocid="store.loading_state"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="text-center py-20 text-muted-foreground font-body"
              data-ocid="store.empty_state"
            >
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No products found. "Add the first product!"</p>
            </div>
          ) : (
            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.05 } },
              }}
            >
              {filtered.map((p, idx) => {
                const isOwner = callerPrincipal === p.seller.toString();
                return (
                  <motion.div
                    key={String(p.id)}
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      show: { opacity: 1, y: 0 },
                    }}
                    data-ocid={`store.item.${idx + 1}`}
                  >
                    <Card className="h-full border-border/60 hover:shadow-card transition-shadow">
                      <CardContent className="pt-4 pb-4">
                        <span
                          className={`text-xs font-body font-semibold px-2 py-0.5 rounded-full capitalize ${catColor[p.category] ?? "bg-gray-100"}`}
                        >
                          {p.category}
                        </span>
                        <h3 className="font-display font-bold text-foreground text-base mt-2 mb-1">
                          {p.name}
                        </h3>
                        <p className="font-display text-xl font-black text-primary">
                          ₹{p.price.toFixed(2)}
                          <span className="text-xs font-body text-muted-foreground font-normal">
                            {" "}
                            /{p.unit}
                          </span>
                        </p>
                        <p className="font-body text-xs text-muted-foreground mt-1">
                          Stock: {String(p.stock)} {p.unit}
                        </p>
                        {p.description && (
                          <p className="font-body text-xs text-muted-foreground mt-1 line-clamp-2">
                            {p.description}
                          </p>
                        )}
                        {isOwner && (
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEdit(p)}
                              className="flex-1 font-body text-xs"
                              data-ocid={`store.edit_button.${idx + 1}`}
                            >
                              <Pencil className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(p.id)}
                              className="font-body text-xs text-destructive hover:text-destructive"
                              data-ocid={`store.delete_button.${idx + 1}`}
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
          data-ocid="store.sheet"
        >
          <SheetHeader>
            <SheetTitle className="font-display font-black">
              {editProduct ? "Edit Product" : "Add Product"}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Product Name *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Urea Fertilizer"
                data-ocid="store.input"
              />
            </div>
            <div>
              <Label>Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as ProductCategory }))
                }
              >
                <SelectTrigger data-ocid="store.select">
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
                <Label>Price (₹) *</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="500"
                  data-ocid="store.input"
                />
              </div>
              <div>
                <Label>Unit *</Label>
                <Input
                  value={form.unit}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, unit: e.target.value }))
                  }
                  placeholder="kg / bag"
                  data-ocid="store.input"
                />
              </div>
            </div>
            <div>
              <Label>Stock</Label>
              <Input
                type="number"
                value={form.stock}
                onChange={(e) =>
                  setForm((f) => ({ ...f, stock: e.target.value }))
                }
                placeholder="50"
                data-ocid="store.input"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Product details..."
                data-ocid="store.textarea"
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full font-body font-semibold"
              data-ocid="store.submit_button"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Product"
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Footer />
    </div>
  );
}
