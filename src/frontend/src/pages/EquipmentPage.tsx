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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarDays,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Tractor,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { EquipmentListing, RentalBooking } from "../backend.d";
import { BookingStatus, EquipmentType } from "../backend.d";
import type { backendInterface as ExtendedBackend } from "../backend.d";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const EQ_TYPES = [
  { label: "Tractor", value: EquipmentType.tractor },
  { label: "Harvester", value: EquipmentType.harvester },
  { label: "Sprayer", value: EquipmentType.sprayer },
  { label: "Drip Irrigation", value: EquipmentType.drip_irrigation },
  { label: "Other", value: EquipmentType.other },
];

const emptyForm = {
  name: "",
  equipmentType: EquipmentType.tractor,
  pricePerDay: "",
  location: "",
  description: "",
  isAvailable: true,
};

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-700";
}

export default function EquipmentPage() {
  const { actor: rawActor } = useActor();
  const actor = rawActor as unknown as ExtendedBackend;
  const { identity } = useInternetIdentity();
  const [listings, setListings] = useState<EquipmentListing[]>([]);
  const [myListings, setMyListings] = useState<EquipmentListing[]>([]);
  const [myBookings, setMyBookings] = useState<RentalBooking[]>([]);
  const [incomingBookings, setIncomingBookings] = useState<RentalBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [bookSheetOpen, setBookSheetOpen] = useState(false);
  const [editItem, setEditItem] = useState<EquipmentListing | null>(null);
  const [bookingTarget, setBookingTarget] = useState<EquipmentListing | null>(
    null,
  );
  const [form, setForm] = useState({ ...emptyForm });
  const [bookForm, setBookForm] = useState({ startDate: "", endDate: "" });
  const [saving, setSaving] = useState(false);

  const callerPrincipal = identity?.getPrincipal().toString();

  const load = async () => {
    if (!actor) return;
    try {
      const all = await actor.getAllEquipmentListings();
      setListings(all);
      if (identity) {
        const my = await actor.getMyEquipmentListings();
        setMyListings(my);
        const bk = await actor.getMyBookings();
        setMyBookings(bk);
        const ib = await actor.getBookingsForMyEquipment();
        setIncomingBookings(ib);
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

  const openAdd = () => {
    setEditItem(null);
    setForm({ ...emptyForm });
    setSheetOpen(true);
  };
  const openEdit = (l: EquipmentListing) => {
    setEditItem(l);
    setForm({
      name: l.name,
      equipmentType: l.equipmentType,
      pricePerDay: String(l.pricePerDay),
      location: l.location,
      description: l.description,
      isAvailable: l.isAvailable,
    });
    setSheetOpen(true);
  };
  const openBook = (l: EquipmentListing) => {
    setBookingTarget(l);
    setBookForm({ startDate: "", endDate: "" });
    setBookSheetOpen(true);
  };

  const handleSave = async () => {
    if (!actor) return;
    if (!form.name || !form.pricePerDay || !form.location) {
      toast.error("Fill required fields");
      return;
    }
    setSaving(true);
    try {
      if (editItem) {
        await actor.updateEquipmentListing(
          editItem.id,
          form.name,
          form.equipmentType as EquipmentType,
          Number.parseFloat(form.pricePerDay),
          form.location,
          form.isAvailable,
          form.description,
        );
        toast.success("Listing updated");
      } else {
        await actor.createEquipmentListing(
          form.name,
          form.equipmentType as EquipmentType,
          Number.parseFloat(form.pricePerDay),
          form.location,
          form.description,
        );
        toast.success("Equipment listed");
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
      await actor.deleteEquipmentListing(id);
      toast.success("Listing deleted");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Error");
    }
  };

  const handleBook = async () => {
    if (!actor || !bookingTarget) return;
    if (!bookForm.startDate || !bookForm.endDate) {
      toast.error("Select dates");
      return;
    }
    const start = new Date(bookForm.startDate).getTime();
    const end = new Date(bookForm.endDate).getTime();
    if (end <= start) {
      toast.error("End date must be after start date");
      return;
    }
    const days = (end - start) / (1000 * 60 * 60 * 24);
    const total = days * bookingTarget.pricePerDay;
    setSaving(true);
    try {
      await actor.createRentalBooking(
        bookingTarget.id,
        BigInt(start),
        BigInt(end),
        total,
      );
      toast.success(`Booking request sent! Total: ₹${total.toFixed(0)}`);
      setBookSheetOpen(false);
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (
    bookingId: bigint,
    status: BookingStatus,
  ) => {
    if (!actor) return;
    try {
      await actor.updateBookingStatus(bookingId, status);
      toast.success("Status updated");
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
          <div className="mb-6">
            <h1 className="font-display text-2xl font-black">
              Equipment Rental
            </h1>
            <p className="font-body text-sm text-muted-foreground mt-0.5">
              Rent tractors, harvesters and more
            </p>
          </div>

          <Tabs defaultValue="browse" data-ocid="equipment.tab">
            <TabsList className="mb-6">
              <TabsTrigger value="browse" data-ocid="equipment.tab">
                Browse Equipment
              </TabsTrigger>
              {identity && (
                <TabsTrigger value="mine" data-ocid="equipment.tab">
                  My Listings & Bookings
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="browse">
              {loading ? (
                <div
                  className="flex justify-center py-20"
                  data-ocid="equipment.loading_state"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : listings.length === 0 ? (
                <div
                  className="text-center py-20 text-muted-foreground font-body"
                  data-ocid="equipment.empty_state"
                >
                  <Tractor className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No equipment listed yet.</p>
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
                  {listings.map((l, idx) => (
                    <motion.div
                      key={String(l.id)}
                      variants={{
                        hidden: { opacity: 0, y: 12 },
                        show: { opacity: 1, y: 0 },
                      }}
                      data-ocid={`equipment.item.${idx + 1}`}
                    >
                      <Card className="h-full border-border/60 hover:shadow-card transition-shadow">
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge
                              variant={l.isAvailable ? "default" : "secondary"}
                              className="text-xs capitalize"
                            >
                              {l.isAvailable ? "Available" : "Unavailable"}
                            </Badge>
                            <span className="text-xs font-body text-muted-foreground capitalize">
                              {l.equipmentType.replace("_", " ")}
                            </span>
                          </div>
                          <h3 className="font-display font-bold text-foreground text-base mb-1">
                            {l.name}
                          </h3>
                          <p className="font-display text-xl font-black text-primary">
                            ₹{l.pricePerDay.toFixed(0)}
                            <span className="text-xs font-body text-muted-foreground font-normal">
                              /day
                            </span>
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
                          {identity &&
                            l.isAvailable &&
                            callerPrincipal !== l.owner.toString() && (
                              <Button
                                size="sm"
                                className="w-full mt-3 font-body font-semibold"
                                onClick={() => openBook(l)}
                                data-ocid={`equipment.primary_button.${idx + 1}`}
                              >
                                <CalendarDays className="h-3.5 w-3.5 mr-1" />
                                Book Now
                              </Button>
                            )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </TabsContent>

            {identity && (
              <TabsContent value="mine">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-display font-bold text-lg">
                    My Equipment
                  </h2>
                  <Button
                    onClick={openAdd}
                    size="sm"
                    className="font-body font-semibold"
                    data-ocid="equipment.open_modal_button"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Equipment
                  </Button>
                </div>
                {myListings.length === 0 ? (
                  <p
                    className="text-muted-foreground font-body text-sm mb-8"
                    data-ocid="equipment.empty_state"
                  >
                    No equipment listed yet.
                  </p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {myListings.map((l, idx) => (
                      <Card
                        key={String(l.id)}
                        className="border-border/60"
                        data-ocid={`equipment.item.${idx + 1}`}
                      >
                        <CardContent className="pt-4 pb-4">
                          <h3 className="font-display font-bold text-base mb-1">
                            {l.name}
                          </h3>
                          <p className="font-body text-sm text-muted-foreground">
                            ₹{l.pricePerDay}/day · {l.location}
                          </p>
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEdit(l)}
                              className="flex-1 font-body text-xs"
                              data-ocid={`equipment.edit_button.${idx + 1}`}
                            >
                              <Pencil className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(l.id)}
                              className="font-body text-xs text-destructive"
                              data-ocid={`equipment.delete_button.${idx + 1}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <h2 className="font-display font-bold text-lg mb-4">
                  Incoming Booking Requests
                </h2>
                {incomingBookings.length === 0 ? (
                  <p className="text-muted-foreground font-body text-sm mb-8">
                    No booking requests yet.
                  </p>
                ) : (
                  <div className="space-y-3 mb-8">
                    {incomingBookings.map((b) => (
                      <Card key={String(b.id)} className="border-border/60">
                        <CardContent className="pt-3 pb-3 flex items-center justify-between gap-4 flex-wrap">
                          <div>
                            <p className="font-body text-sm font-semibold">
                              Booking #{String(b.id)}
                            </p>
                            <p className="font-body text-xs text-muted-foreground">
                              {new Date(
                                Number(b.startDate),
                              ).toLocaleDateString()}{" "}
                              →{" "}
                              {new Date(Number(b.endDate)).toLocaleDateString()}
                            </p>
                            <p className="font-body text-xs font-semibold text-primary">
                              ₹{b.totalPrice.toFixed(0)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadge(b.status)}`}
                            >
                              {b.status}
                            </span>
                            {b.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  className="font-body text-xs"
                                  onClick={() =>
                                    handleUpdateStatus(
                                      b.id,
                                      BookingStatus.confirmed,
                                    )
                                  }
                                  data-ocid="equipment.confirm_button"
                                >
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="font-body text-xs"
                                  onClick={() =>
                                    handleUpdateStatus(
                                      b.id,
                                      BookingStatus.cancelled,
                                    )
                                  }
                                  data-ocid="equipment.cancel_button"
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            {b.status === "confirmed" && (
                              <Button
                                size="sm"
                                className="font-body text-xs"
                                onClick={() =>
                                  handleUpdateStatus(
                                    b.id,
                                    BookingStatus.completed,
                                  )
                                }
                                data-ocid="equipment.secondary_button"
                              >
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <h2 className="font-display font-bold text-lg mb-4">
                  My Bookings
                </h2>
                {myBookings.length === 0 ? (
                  <p className="text-muted-foreground font-body text-sm">
                    No bookings made yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {myBookings.map((b) => (
                      <Card key={String(b.id)} className="border-border/60">
                        <CardContent className="pt-3 pb-3 flex items-center justify-between gap-4 flex-wrap">
                          <div>
                            <p className="font-body text-sm font-semibold">
                              Equipment #{String(b.equipmentId)}
                            </p>
                            <p className="font-body text-xs text-muted-foreground">
                              {new Date(
                                Number(b.startDate),
                              ).toLocaleDateString()}{" "}
                              →{" "}
                              {new Date(Number(b.endDate)).toLocaleDateString()}
                            </p>
                            <p className="font-body text-xs font-semibold text-primary">
                              ₹{b.totalPrice.toFixed(0)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadge(b.status)}`}
                            >
                              {b.status}
                            </span>
                            {b.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="font-body text-xs text-destructive"
                                onClick={() =>
                                  handleUpdateStatus(
                                    b.id,
                                    BookingStatus.cancelled,
                                  )
                                }
                                data-ocid="equipment.cancel_button"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          className="w-full sm:max-w-md overflow-y-auto"
          data-ocid="equipment.sheet"
        >
          <SheetHeader>
            <SheetTitle className="font-display font-black">
              {editItem ? "Edit Equipment" : "Add Equipment"}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Equipment Name *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Mahindra 575"
                data-ocid="equipment.input"
              />
            </div>
            <div>
              <Label>Type *</Label>
              <Select
                value={form.equipmentType}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, equipmentType: v as EquipmentType }))
                }
              >
                <SelectTrigger data-ocid="equipment.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EQ_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Price per Day (₹) *</Label>
              <Input
                type="number"
                value={form.pricePerDay}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pricePerDay: e.target.value }))
                }
                placeholder="1500"
                data-ocid="equipment.input"
              />
            </div>
            <div>
              <Label>Location *</Label>
              <Input
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                placeholder="Village, District"
                data-ocid="equipment.input"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Condition, features..."
                data-ocid="equipment.textarea"
              />
            </div>
            {editItem && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isAvailable: e.target.checked }))
                  }
                  id="avail"
                />
                <Label htmlFor="avail">Available for rental</Label>
              </div>
            )}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full font-body font-semibold"
              data-ocid="equipment.submit_button"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={bookSheetOpen} onOpenChange={setBookSheetOpen}>
        <SheetContent
          className="w-full sm:max-w-md"
          data-ocid="equipment.sheet"
        >
          <SheetHeader>
            <SheetTitle className="font-display font-black">
              Book {bookingTarget?.name}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <p className="font-body text-sm text-muted-foreground">
              Rate: ₹{bookingTarget?.pricePerDay}/day
            </p>
            <div>
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={bookForm.startDate}
                onChange={(e) =>
                  setBookForm((f) => ({ ...f, startDate: e.target.value }))
                }
                data-ocid="equipment.input"
              />
            </div>
            <div>
              <Label>End Date *</Label>
              <Input
                type="date"
                value={bookForm.endDate}
                onChange={(e) =>
                  setBookForm((f) => ({ ...f, endDate: e.target.value }))
                }
                data-ocid="equipment.input"
              />
            </div>
            {bookForm.startDate && bookForm.endDate && (
              <p className="font-body text-sm font-semibold text-primary">
                Total: ₹
                {(
                  ((new Date(bookForm.endDate).getTime() -
                    new Date(bookForm.startDate).getTime()) /
                    86400000) *
                  (bookingTarget?.pricePerDay ?? 0)
                ).toFixed(0)}
              </p>
            )}
            <Button
              onClick={handleBook}
              disabled={saving}
              className="w-full font-body font-semibold"
              data-ocid="equipment.submit_button"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                "Send Booking Request"
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Footer />
    </div>
  );
}
