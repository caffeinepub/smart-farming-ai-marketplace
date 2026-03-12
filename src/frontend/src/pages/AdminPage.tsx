import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Principal } from "@icp-sdk/core/principal";
import { Loader2, ShieldAlert, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  CropListing,
  EquipmentListing,
  FarmerProfile,
  StoreProduct,
} from "../backend.d";
import type { backendInterface as ExtendedBackend } from "../backend.d";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function AdminPage() {
  const { actor: rawActor } = useActor();
  const actor = rawActor as unknown as ExtendedBackend;
  const { identity } = useInternetIdentity();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<FarmerProfile[]>([]);
  const [cropListings, setCropListings] = useState<CropListing[]>([]);
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
  const [equipmentListings, setEquipmentListings] = useState<
    EquipmentListing[]
  >([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!actor || !identity) return;
    try {
      const admin = await actor.isCallerAdmin();
      setIsAdmin(admin);
      if (admin) {
        const [u, cl, sp, el] = await Promise.all([
          actor.getAllUsers(),
          actor.adminGetAllCropListings(),
          actor.adminGetAllStoreProducts(),
          actor.adminGetAllEquipmentListings(),
        ]);
        setUsers(u);
        setCropListings(cl);
        setStoreProducts(sp);
        setEquipmentListings(el);
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

  const _handleDeleteUser = async (principal: Principal) => {
    if (!actor) return;
    try {
      await actor.deleteUser(principal);
      toast.success("User deleted");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Error");
    }
  };

  const handleDeleteCrop = async (id: bigint) => {
    if (!actor) return;
    try {
      await actor.deleteCropListing(id);
      toast.success("Listing deleted");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Error");
    }
  };

  const handleDeleteProduct = async (id: bigint) => {
    if (!actor) return;
    try {
      await actor.deleteStoreProduct(id);
      toast.success("Product deleted");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Error");
    }
  };

  const handleDeleteEquipment = async (id: bigint) => {
    if (!actor) return;
    try {
      await actor.deleteEquipmentListing(id);
      toast.success("Listing deleted");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Error");
    }
  };

  if (!identity || isAdmin === false) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <ShieldAlert className="h-16 w-16 mx-auto mb-4 text-destructive opacity-60" />
            <h2 className="font-display text-xl font-bold mb-2">
              {!identity ? "Login Required" : "Access Denied"}
            </h2>
            <p className="font-body text-muted-foreground">
              {!identity
                ? "Please login to continue."
                : "Admin access required."}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main
          className="flex-1 flex items-center justify-center"
          data-ocid="admin.loading_state"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="container max-w-6xl">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-black">Admin Panel</h1>
            <p className="font-body text-sm text-muted-foreground mt-0.5">
              Manage all platform content
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Users", value: users.length },
              { label: "Crop Listings", value: cropListings.length },
              { label: "Store Products", value: storeProducts.length },
              { label: "Equipment", value: equipmentListings.length },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-card border border-border/60 rounded-xl p-4 text-center"
              >
                <p className="font-display text-2xl font-black text-primary">
                  {stat.value}
                </p>
                <p className="font-body text-xs text-muted-foreground mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <Tabs defaultValue="users">
            <TabsList className="mb-6">
              <TabsTrigger value="users" data-ocid="admin.tab">
                Users ({users.length})
              </TabsTrigger>
              <TabsTrigger value="crops" data-ocid="admin.tab">
                Crop Listings ({cropListings.length})
              </TabsTrigger>
              <TabsTrigger value="store" data-ocid="admin.tab">
                Store Products ({storeProducts.length})
              </TabsTrigger>
              <TabsTrigger value="equipment" data-ocid="admin.tab">
                Equipment ({equipmentListings.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              {users.length === 0 ? (
                <p
                  className="text-muted-foreground font-body text-sm"
                  data-ocid="admin.empty_state"
                >
                  No users found.
                </p>
              ) : (
                <div
                  className="border border-border/60 rounded-xl overflow-hidden"
                  data-ocid="admin.table"
                >
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u, idx) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: idx needed for stable keys here
                        <TableRow key={idx} data-ocid={`admin.row.${idx + 1}`}>
                          <TableCell className="font-body font-semibold">
                            {u.name}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="capitalize font-body text-xs"
                            >
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-body text-sm text-muted-foreground">
                            {u.location}
                          </TableCell>
                          <TableCell className="font-body text-sm">
                            {u.phone}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive font-body text-xs"
                              data-ocid={`admin.delete_button.${idx + 1}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="crops">
              {cropListings.length === 0 ? (
                <p
                  className="text-muted-foreground font-body text-sm"
                  data-ocid="admin.empty_state"
                >
                  No crop listings.
                </p>
              ) : (
                <div
                  className="border border-border/60 rounded-xl overflow-hidden"
                  data-ocid="admin.table"
                >
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Crop</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price/Quintal</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cropListings.map((l, idx) => (
                        <TableRow
                          key={String(l.id)}
                          data-ocid={`admin.row.${idx + 1}`}
                        >
                          <TableCell className="font-body font-semibold">
                            {l.cropName}
                          </TableCell>
                          <TableCell className="font-body text-sm capitalize">
                            {l.category}
                          </TableCell>
                          <TableCell className="font-body text-sm">
                            ₹{l.pricePerQuintal}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                l.status === "available"
                                  ? "default"
                                  : "secondary"
                              }
                              className="capitalize text-xs"
                            >
                              {l.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteCrop(l.id)}
                              className="text-destructive hover:text-destructive font-body text-xs"
                              data-ocid={`admin.delete_button.${idx + 1}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="store">
              {storeProducts.length === 0 ? (
                <p
                  className="text-muted-foreground font-body text-sm"
                  data-ocid="admin.empty_state"
                >
                  No store products.
                </p>
              ) : (
                <div
                  className="border border-border/60 rounded-xl overflow-hidden"
                  data-ocid="admin.table"
                >
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {storeProducts.map((p, idx) => (
                        <TableRow
                          key={String(p.id)}
                          data-ocid={`admin.row.${idx + 1}`}
                        >
                          <TableCell className="font-body font-semibold">
                            {p.name}
                          </TableCell>
                          <TableCell className="font-body text-sm capitalize">
                            {p.category}
                          </TableCell>
                          <TableCell className="font-body text-sm">
                            ₹{p.price}/{p.unit}
                          </TableCell>
                          <TableCell className="font-body text-sm">
                            {String(p.stock)}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteProduct(p.id)}
                              className="text-destructive hover:text-destructive font-body text-xs"
                              data-ocid={`admin.delete_button.${idx + 1}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="equipment">
              {equipmentListings.length === 0 ? (
                <p
                  className="text-muted-foreground font-body text-sm"
                  data-ocid="admin.empty_state"
                >
                  No equipment listings.
                </p>
              ) : (
                <div
                  className="border border-border/60 rounded-xl overflow-hidden"
                  data-ocid="admin.table"
                >
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Price/Day</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {equipmentListings.map((l, idx) => (
                        <TableRow
                          key={String(l.id)}
                          data-ocid={`admin.row.${idx + 1}`}
                        >
                          <TableCell className="font-body font-semibold">
                            {l.name}
                          </TableCell>
                          <TableCell className="font-body text-sm capitalize">
                            {l.equipmentType.replace("_", " ")}
                          </TableCell>
                          <TableCell className="font-body text-sm">
                            ₹{l.pricePerDay}/day
                          </TableCell>
                          <TableCell className="font-body text-sm">
                            {l.location}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteEquipment(l.id)}
                              className="text-destructive hover:text-destructive font-body text-xs"
                              data-ocid={`admin.delete_button.${idx + 1}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
