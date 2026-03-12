import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarDays,
  CheckCircle2,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Ruler,
  Sprout,
  User,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useMyProfile, useUpdateProfile } from "../hooks/useQueries";

interface ProfileFormValues {
  name: string;
  phone: string;
  location: string;
  farmSize: string;
  farmType: string;
  bio: string;
}

const FARM_TYPE_LABELS: Record<string, string> = {
  wheat: "🌾 Wheat",
  rice: "🌾 Rice",
  vegetable: "🥦 Vegetables",
  fruit: "🍎 Fruit",
  mixed: "🌱 Mixed Farming",
  other: "🌿 Other",
};

export default function ProfilePage() {
  const { data: profile, isLoading } = useMyProfile();
  const updateProfile = useUpdateProfile();
  const [editing, setEditing] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>();

  const watchedFarmType = watch("farmType");

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        phone: profile.phone,
        location: profile.location,
        farmSize: profile.farmSize,
        farmType: profile.farmType,
        bio: profile.bio ?? "",
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateProfile.mutateAsync({
        name: data.name,
        phone: data.phone,
        location: data.location,
        farmSize: data.farmSize,
        farmType: data.farmType,
        bio: data.bio.trim() || null,
      });
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  const handleCancel = () => {
    if (profile) {
      reset({
        name: profile.name,
        phone: profile.phone,
        location: profile.location,
        farmSize: profile.farmSize,
        farmType: profile.farmType,
        bio: profile.bio ?? "",
      });
    }
    setEditing(false);
  };

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "F";

  const formatDate = (ts: bigint) => {
    const ms = Number(ts) / 1_000_000;
    return new Date(ms).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-10 px-4">
        <div className="container max-w-2xl">
          {isLoading ? (
            <div
              className="flex justify-center items-center py-20"
              data-ocid="profile.loading_state"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !profile ? (
            <div className="text-center py-20" data-ocid="profile.empty_state">
              <p className="font-body text-muted-foreground">
                No profile found.
              </p>
              <Button
                className="mt-4 font-body"
                onClick={() => {
                  window.location.href = "/register";
                }}
                data-ocid="profile.primary_button"
              >
                Create Profile
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Profile header */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl font-display font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="font-display text-2xl font-black text-foreground">
                      {profile.name}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className="font-body text-xs font-semibold capitalize"
                      >
                        {profile.role}
                      </Badge>
                      <Badge variant="outline" className="font-body text-xs">
                        {FARM_TYPE_LABELS[profile.farmType] ?? profile.farmType}
                      </Badge>
                    </div>
                  </div>
                </div>
                {!editing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(true)}
                    className="font-body font-semibold"
                    data-ocid="profile.edit_button"
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit Profile
                  </Button>
                )}
              </div>

              {!editing ? (
                /* View mode */
                <Card className="shadow-card border-border/60">
                  <CardContent className="pt-6 space-y-4">
                    <InfoRow
                      icon={User}
                      label="Full Name"
                      value={profile.name}
                    />
                    <Separator />
                    <InfoRow icon={Phone} label="Phone" value={profile.phone} />
                    <Separator />
                    <InfoRow
                      icon={MapPin}
                      label="Location"
                      value={profile.location}
                    />
                    <Separator />
                    <InfoRow
                      icon={Ruler}
                      label="Farm Size"
                      value={profile.farmSize}
                    />
                    <Separator />
                    <InfoRow
                      icon={Sprout}
                      label="Farm Type"
                      value={
                        FARM_TYPE_LABELS[profile.farmType] ?? profile.farmType
                      }
                    />
                    {profile.bio && (
                      <>
                        <Separator />
                        <div className="space-y-1">
                          <p className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider">
                            About
                          </p>
                          <p className="font-body text-sm text-foreground leading-relaxed">
                            {profile.bio}
                          </p>
                        </div>
                      </>
                    )}
                    <Separator />
                    <InfoRow
                      icon={CalendarDays}
                      label="Member Since"
                      value={formatDate(profile.createdAt)}
                    />
                  </CardContent>
                </Card>
              ) : (
                /* Edit mode */
                <Card className="shadow-card border-border/60">
                  <CardHeader className="pb-4">
                    <CardTitle className="font-display text-xl">
                      Edit Profile
                    </CardTitle>
                    <CardDescription className="font-body">
                      Update your farm information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      noValidate
                      className="space-y-5"
                    >
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="edit-name"
                          className="font-body font-semibold text-sm"
                        >
                          Full Name *
                        </Label>
                        <Input
                          id="edit-name"
                          {...register("name", {
                            required: "Name is required",
                          })}
                          className="font-body"
                          data-ocid="profile.name.input"
                        />
                        {errors.name && (
                          <p
                            className="text-xs text-destructive font-body"
                            data-ocid="profile.name.error_state"
                          >
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="edit-phone"
                          className="font-body font-semibold text-sm"
                        >
                          Phone Number *
                        </Label>
                        <Input
                          id="edit-phone"
                          type="tel"
                          {...register("phone", {
                            required: "Phone is required",
                          })}
                          className="font-body"
                          data-ocid="profile.phone.input"
                        />
                        {errors.phone && (
                          <p
                            className="text-xs text-destructive font-body"
                            data-ocid="profile.phone.error_state"
                          >
                            {errors.phone.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="edit-location"
                          className="font-body font-semibold text-sm"
                        >
                          Location *
                        </Label>
                        <Input
                          id="edit-location"
                          {...register("location", {
                            required: "Location is required",
                          })}
                          className="font-body"
                          data-ocid="profile.location.input"
                        />
                        {errors.location && (
                          <p
                            className="text-xs text-destructive font-body"
                            data-ocid="profile.location.error_state"
                          >
                            {errors.location.message}
                          </p>
                        )}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="edit-farmSize"
                            className="font-body font-semibold text-sm"
                          >
                            Farm Size *
                          </Label>
                          <Input
                            id="edit-farmSize"
                            {...register("farmSize", {
                              required: "Farm size is required",
                            })}
                            className="font-body"
                            data-ocid="profile.farmsize.input"
                          />
                          {errors.farmSize && (
                            <p
                              className="text-xs text-destructive font-body"
                              data-ocid="profile.farmsize.error_state"
                            >
                              {errors.farmSize.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label className="font-body font-semibold text-sm">
                            Farm Type *
                          </Label>
                          <Select
                            value={watchedFarmType}
                            onValueChange={(v) => setValue("farmType", v)}
                          >
                            <SelectTrigger
                              className="font-body"
                              data-ocid="profile.farmtype.select"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="wheat">🌾 Wheat</SelectItem>
                              <SelectItem value="rice">🌾 Rice</SelectItem>
                              <SelectItem value="vegetable">
                                🥦 Vegetables
                              </SelectItem>
                              <SelectItem value="fruit">🍎 Fruit</SelectItem>
                              <SelectItem value="mixed">
                                🌱 Mixed Farming
                              </SelectItem>
                              <SelectItem value="other">🌿 Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="edit-bio"
                          className="font-body font-semibold text-sm"
                        >
                          About You{" "}
                          <span className="text-muted-foreground font-normal">
                            (Optional)
                          </span>
                        </Label>
                        <Textarea
                          id="edit-bio"
                          rows={3}
                          {...register("bio")}
                          className="font-body resize-none"
                          data-ocid="profile.bio.textarea"
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          type="submit"
                          className="flex-1 font-body font-bold"
                          disabled={updateProfile.isPending}
                          data-ocid="profile.save_button"
                        >
                          {updateProfile.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                          )}
                          {updateProfile.isPending
                            ? "Saving..."
                            : "Save Changes"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          className="font-body"
                          data-ocid="profile.cancel_button"
                        >
                          <X className="mr-1.5 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>

                      {updateProfile.isError && (
                        <p
                          className="text-sm text-destructive text-center font-body"
                          data-ocid="profile.error_state"
                        >
                          Failed to update. Please try again.
                        </p>
                      )}
                    </form>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-primary/8">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-[11px] font-body font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className="font-body text-sm text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}
