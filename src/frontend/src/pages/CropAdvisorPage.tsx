import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  ImageIcon,
  Leaf,
  Loader2,
  Sprout,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { CropRecommendation, DiseaseReport } from "../backend.d";
import { WaterAvailability } from "../backend.d";
import type { backendInterface as ExtendedBackend } from "../backend.d";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const SOIL_TYPES = [
  "Clay",
  "Sandy",
  "Loam",
  "Silt",
  "Black Cotton",
  "Red Laterite",
];
const SEASONS = ["Kharif", "Rabi", "Zaid"];

export default function CropAdvisorPage() {
  const { actor: rawActor } = useActor();
  const actor = rawActor as unknown as ExtendedBackend;
  const { identity } = useInternetIdentity();
  const [recForm, setRecForm] = useState({
    soilType: "Loam",
    season: "Kharif",
    waterAvailability: WaterAvailability.medium,
    location: "",
  });
  const [diseaseForm, setDiseaseForm] = useState({
    cropName: "",
    description: "",
  });
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>(
    [],
  );
  const [diseaseReports, setDiseaseReports] = useState<DiseaseReport[]>([]);
  const [latestRec, setLatestRec] = useState<CropRecommendation | null>(null);
  const [latestDisease, setLatestDisease] = useState<DiseaseReport | null>(
    null,
  );
  const [loadingRec, setLoadingRec] = useState(false);
  const [loadingDisease, setLoadingDisease] = useState(false);

  const load = async () => {
    if (!actor || !identity) return;
    try {
      const [recs, dreps] = await Promise.all([
        actor.getMyRecommendations(),
        actor.getMyDiseaseReports(),
      ]);
      setRecommendations(recs);
      setDiseaseReports(dreps);
    } catch (e) {
      console.error(e);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    load();
  }, [actor, identity]);

  const handleGetRecommendation = async () => {
    if (!actor) return;
    if (!recForm.location) {
      toast.error("Enter your location");
      return;
    }
    setLoadingRec(true);
    try {
      const result = await actor.getCropRecommendation(
        recForm.soilType,
        recForm.season,
        recForm.waterAvailability as WaterAvailability,
        recForm.location,
      );
      setLatestRec(result);
      toast.success("Recommendation generated!");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Error getting recommendation");
    } finally {
      setLoadingRec(false);
    }
  };

  const handleDiseaseDetection = async () => {
    if (!actor) return;
    if (!diseaseForm.cropName || !diseaseForm.description) {
      toast.error("Fill all fields");
      return;
    }
    setLoadingDisease(true);
    try {
      const result = await actor.reportDiseaseDetection(
        diseaseForm.cropName,
        diseaseForm.description,
      );
      setLatestDisease(result);
      toast.success("Analysis complete!");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Error analyzing disease");
    } finally {
      setLoadingDisease(false);
    }
  };

  if (!identity) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <Sprout className="h-16 w-16 mx-auto mb-4 text-primary opacity-60" />
            <h2 className="font-display text-xl font-bold mb-2">
              Login Required
            </h2>
            <p className="font-body text-muted-foreground">
              Please login to use Crop Advisor features.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="container max-w-4xl">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-black">Crop Advisor</h1>
            <p className="font-body text-sm text-muted-foreground mt-0.5">
              AI-powered crop guidance and disease detection
            </p>
          </div>

          <Tabs defaultValue="recommend">
            <TabsList className="mb-6">
              <TabsTrigger value="recommend" data-ocid="cropadvisor.tab">
                Crop Recommendation
              </TabsTrigger>
              <TabsTrigger value="disease" data-ocid="cropadvisor.tab">
                Disease Detection
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recommend">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-border/60">
                  <CardHeader>
                    <CardTitle className="font-display text-lg">
                      Get Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Soil Type</Label>
                      <Select
                        value={recForm.soilType}
                        onValueChange={(v) =>
                          setRecForm((f) => ({ ...f, soilType: v }))
                        }
                      >
                        <SelectTrigger data-ocid="cropadvisor.select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SOIL_TYPES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Season</Label>
                      <Select
                        value={recForm.season}
                        onValueChange={(v) =>
                          setRecForm((f) => ({ ...f, season: v }))
                        }
                      >
                        <SelectTrigger data-ocid="cropadvisor.select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SEASONS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Water Availability</Label>
                      <Select
                        value={recForm.waterAvailability}
                        onValueChange={(v) =>
                          setRecForm((f) => ({
                            ...f,
                            waterAvailability: v as WaterAvailability,
                          }))
                        }
                      >
                        <SelectTrigger data-ocid="cropadvisor.select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={WaterAvailability.low}>
                            Low (Rainfed)
                          </SelectItem>
                          <SelectItem value={WaterAvailability.medium}>
                            Medium (Seasonal)
                          </SelectItem>
                          <SelectItem value={WaterAvailability.high}>
                            High (Irrigated)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Location *</Label>
                      <Input
                        value={recForm.location}
                        onChange={(e) =>
                          setRecForm((f) => ({
                            ...f,
                            location: e.target.value,
                          }))
                        }
                        placeholder="e.g. Nashik, Maharashtra"
                        data-ocid="cropadvisor.input"
                      />
                    </div>
                    <Button
                      onClick={handleGetRecommendation}
                      disabled={loadingRec}
                      className="w-full font-body font-semibold"
                      data-ocid="cropadvisor.submit_button"
                    >
                      {loadingRec ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sprout className="h-4 w-4 mr-2" />
                          Get Recommendation
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {latestRec && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    data-ocid="cropadvisor.success_state"
                  >
                    <Card className="border-primary/30 bg-primary/5">
                      <CardHeader>
                        <CardTitle className="font-display text-lg text-primary">
                          Recommended Crops
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2 flex-wrap mb-4">
                          {latestRec.recommendedCrops.map((c) => (
                            <span
                              key={c}
                              className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-sm font-semibold px-3 py-1 rounded-full"
                            >
                              <Leaf className="h-3 w-3" />
                              {c}
                            </span>
                          ))}
                        </div>
                        <h4 className="font-display font-bold text-sm mb-2">
                          Tips
                        </h4>
                        <ul className="space-y-1">
                          {latestRec.tips.map((tip) => (
                            <li
                              key={tip}
                              className="flex items-start gap-2 font-body text-xs text-muted-foreground"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>

              {recommendations.length > 0 && (
                <div className="mt-8">
                  <h2 className="font-display font-bold text-lg mb-4">
                    Past Recommendations
                  </h2>
                  <div className="space-y-3">
                    {[...recommendations].reverse().map((r) => (
                      <Card key={String(r.id)} className="border-border/60">
                        <CardContent className="pt-3 pb-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <p className="font-body text-sm font-semibold">
                                {r.season} · {r.soilType} soil · {r.location}
                              </p>
                              <p className="font-body text-xs text-muted-foreground">
                                Crops: {r.recommendedCrops.join(", ")}
                              </p>
                            </div>
                            <span className="font-body text-xs text-muted-foreground">
                              {new Date(
                                Number(r.createdAt) / 1_000_000,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="disease">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-border/60">
                  <CardHeader>
                    <CardTitle className="font-display text-lg">
                      Describe Symptoms
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Crop Name *</Label>
                      <Input
                        value={diseaseForm.cropName}
                        onChange={(e) =>
                          setDiseaseForm((f) => ({
                            ...f,
                            cropName: e.target.value,
                          }))
                        }
                        placeholder="e.g. Tomato"
                        data-ocid="cropadvisor.input"
                      />
                    </div>
                    <div>
                      <Label>Describe Symptoms *</Label>
                      <Textarea
                        value={diseaseForm.description}
                        onChange={(e) =>
                          setDiseaseForm((f) => ({
                            ...f,
                            description: e.target.value,
                          }))
                        }
                        placeholder="e.g. Yellow spots on leaves, wilting..."
                        rows={4}
                        data-ocid="cropadvisor.textarea"
                      />
                    </div>
                    <div
                      className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      data-ocid="cropadvisor.dropzone"
                    >
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="font-body text-sm text-muted-foreground">
                        Upload crop photo
                      </p>
                      <p className="font-body text-xs text-muted-foreground/60">
                        (Coming soon - AI image analysis)
                      </p>
                    </div>
                    <Button
                      onClick={handleDiseaseDetection}
                      disabled={loadingDisease}
                      className="w-full font-body font-semibold"
                      data-ocid="cropadvisor.submit_button"
                    >
                      {loadingDisease ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Analyze Disease
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {latestDisease && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    data-ocid="cropadvisor.success_state"
                  >
                    <Card className="border-orange-200 bg-orange-50">
                      <CardHeader>
                        <CardTitle className="font-display text-lg text-orange-800">
                          Analysis Result
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-display font-bold text-sm mb-1 text-orange-800">
                            Diagnosis
                          </h4>
                          <p className="font-body text-sm text-orange-700">
                            {latestDisease.mockDiagnosis}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-sm mb-1 text-orange-800">
                            Treatment
                          </h4>
                          <p className="font-body text-sm text-orange-700">
                            {latestDisease.mockTreatment}
                          </p>
                        </div>
                        <p className="font-body text-xs text-orange-600/70 italic">
                          This is a mock diagnosis. Consult your local
                          agricultural officer for confirmation.
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>

              {diseaseReports.length > 0 && (
                <div className="mt-8">
                  <h2 className="font-display font-bold text-lg mb-4">
                    Past Reports
                  </h2>
                  <div className="space-y-3">
                    {[...diseaseReports].reverse().map((r) => (
                      <Card key={String(r.id)} className="border-border/60">
                        <CardContent className="pt-3 pb-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <p className="font-body text-sm font-semibold">
                                {r.cropName}
                              </p>
                              <p className="font-body text-xs text-muted-foreground line-clamp-1">
                                {r.description}
                              </p>
                            </div>
                            <span className="font-body text-xs text-muted-foreground">
                              {new Date(
                                Number(r.createdAt) / 1_000_000,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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
