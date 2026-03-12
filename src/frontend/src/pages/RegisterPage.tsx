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
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Leaf, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { UserRole } from "../backend.d";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateProfile } from "../hooks/useQueries";

interface RegisterFormValues {
  name: string;
  phone: string;
  location: string;
  farmSize: string;
  farmType: string;
  bio: string;
  role: string;
}

export default function RegisterPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const createProfile = useCreateProfile();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      name: "",
      phone: "",
      location: "",
      farmSize: "",
      farmType: "",
      bio: "",
      role: "farmer",
    },
  });

  const watchedRole = watch("role");
  const watchedFarmType = watch("farmType");

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    }
  }, [isSuccess]);

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await createProfile.mutateAsync({
        name: data.name,
        phone: data.phone,
        location: data.location,
        farmSize: data.farmSize,
        farmType: data.farmType,
        bio: data.bio.trim() || null,
        role: data.role === "buyer" ? UserRole.buyer : UserRole.farmer,
      });
      setIsSuccess(true);
      toast.success(
        "Profile created! Welcome to Smart Farming AI Marketplace.",
      );
    } catch {
      toast.error("Failed to create profile. Please try again.");
    }
  };

  if (!identity) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center p-8 shadow-card">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Leaf className="h-7 w-7 text-primary" />
              </div>
            </div>
            <h2 className="font-display text-xl font-bold mb-2">
              Connect to Continue
            </h2>
            <p className="font-body text-sm text-muted-foreground mb-6">
              Please login to create your farmer profile.
            </p>
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="w-full font-body font-semibold"
              data-ocid="register.primary_button"
            >
              {isLoggingIn ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isLoggingIn ? "Connecting..." : "Login to Continue"}
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
            data-ocid="register.success_state"
          >
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">
              Profile Created!
            </h2>
            <p className="font-body text-muted-foreground">
              Redirecting to your dashboard...
            </p>
            <Loader2 className="mx-auto mt-4 h-5 w-5 animate-spin text-primary" />
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-10 px-4">
        <div className="container max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8 text-center">
              <Badge
                variant="outline"
                className="mb-3 font-body text-xs font-semibold tracking-widest uppercase"
              >
                Step 1 of 1
              </Badge>
              <h1 className="font-display text-3xl font-black text-foreground">
                Create Your Profile
              </h1>
              <p className="mt-2 font-body text-muted-foreground">
                Tell us about yourself and your farm to get started.
              </p>
            </div>

            <Card className="shadow-card border-border/60">
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-xl">
                  Farmer Profile
                </CardTitle>
                <CardDescription className="font-body">
                  All fields marked * are required.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                  className="space-y-5"
                >
                  {/* Role */}
                  <div className="space-y-2">
                    <Label className="font-body font-semibold text-sm">
                      I am a *
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["farmer", "buyer"] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setValue("role", r)}
                          className={`rounded-lg border-2 px-4 py-3 text-sm font-body font-semibold transition-all capitalize ${
                            watchedRole === r
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/40"
                          }`}
                          data-ocid={`register.${r}.toggle`}
                        >
                          {r === "farmer" ? "🌾 Farmer" : "🛒 Buyer"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="name"
                      className="font-body font-semibold text-sm"
                    >
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g. Ramesh Kumar Sharma"
                      autoComplete="name"
                      {...register("name", { required: "Name is required" })}
                      className="font-body"
                      data-ocid="register.name.input"
                    />
                    {errors.name && (
                      <p
                        className="text-xs text-destructive font-body"
                        data-ocid="register.name.error_state"
                      >
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="phone"
                      className="font-body font-semibold text-sm"
                    >
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      autoComplete="tel"
                      {...register("phone", {
                        required: "Phone number is required",
                        pattern: {
                          value: /^[+]?[0-9\s-]{7,15}$/,
                          message: "Enter a valid phone number",
                        },
                      })}
                      className="font-body"
                      data-ocid="register.phone.input"
                    />
                    {errors.phone && (
                      <p
                        className="text-xs text-destructive font-body"
                        data-ocid="register.phone.error_state"
                      >
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="location"
                      className="font-body font-semibold text-sm"
                    >
                      Village / District / State *
                    </Label>
                    <Input
                      id="location"
                      placeholder="e.g. Ludhiana, Punjab"
                      autoComplete="address-level2"
                      {...register("location", {
                        required: "Location is required",
                      })}
                      className="font-body"
                      data-ocid="register.location.input"
                    />
                    {errors.location && (
                      <p
                        className="text-xs text-destructive font-body"
                        data-ocid="register.location.error_state"
                      >
                        {errors.location.message}
                      </p>
                    )}
                  </div>

                  {/* Farm Size + Farm Type side by side */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="farmSize"
                        className="font-body font-semibold text-sm"
                      >
                        Farm Size *
                      </Label>
                      <Input
                        id="farmSize"
                        placeholder="e.g. 5 acres"
                        {...register("farmSize", {
                          required: "Farm size is required",
                        })}
                        className="font-body"
                        data-ocid="register.farmsize.input"
                      />
                      {errors.farmSize && (
                        <p
                          className="text-xs text-destructive font-body"
                          data-ocid="register.farmsize.error_state"
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
                          data-ocid="register.farmtype.select"
                        >
                          <SelectValue placeholder="Select type" />
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
                      {!watchedFarmType && (
                        <p className="text-xs text-muted-foreground font-body">
                          Please select a farm type
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="bio"
                      className="font-body font-semibold text-sm"
                    >
                      About You{" "}
                      <span className="text-muted-foreground font-normal">
                        (Optional)
                      </span>
                    </Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell buyers a bit about your farm and what you grow..."
                      rows={3}
                      {...register("bio")}
                      className="font-body resize-none"
                      data-ocid="register.bio.textarea"
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full font-body font-bold mt-2"
                    disabled={createProfile.isPending || !watchedFarmType}
                    data-ocid="register.submit_button"
                  >
                    {createProfile.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {createProfile.isPending
                      ? "Creating Profile..."
                      : "Create My Profile"}
                  </Button>

                  {createProfile.isError && (
                    <p
                      className="text-sm text-destructive text-center font-body"
                      data-ocid="register.error_state"
                    >
                      Something went wrong. Please try again.
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
