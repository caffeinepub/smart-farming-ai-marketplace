import type { Principal } from "@icp-sdk/core/principal";

export interface FarmerProfile {
  bio?: string;
  farmSize: string;
  farmType: string;
  name: string;
  createdAt: bigint;
  role: UserRole;
  phone: string;
  location: string;
}

export enum UserRole {
  admin = "admin",
  buyer = "buyer",
  farmer = "farmer",
}

export enum UserRole__1 {
  admin = "admin",
  user = "user",
  guest = "guest",
}

export enum CropCategory {
  grains = "grains",
  vegetables = "vegetables",
  fruits = "fruits",
  pulses = "pulses",
  spices = "spices",
  other = "other",
}

export enum ListingStatus {
  available = "available",
  sold = "sold",
}

export interface CropListing {
  id: bigint;
  seller: Principal;
  cropName: string;
  category: CropCategory;
  quantity: number;
  unit: string;
  pricePerQuintal: number;
  description: string;
  location: string;
  status: ListingStatus;
  createdAt: bigint;
}

export enum ProductCategory {
  fertilizer = "fertilizer",
  seeds = "seeds",
  pesticides = "pesticides",
  tools = "tools",
  other = "other",
}

export interface StoreProduct {
  id: bigint;
  seller: Principal;
  name: string;
  category: ProductCategory;
  price: number;
  unit: string;
  stock: bigint;
  description: string;
  createdAt: bigint;
}

export enum EquipmentType {
  tractor = "tractor",
  harvester = "harvester",
  sprayer = "sprayer",
  drip_irrigation = "drip_irrigation",
  other = "other",
}

export interface EquipmentListing {
  id: bigint;
  owner: Principal;
  name: string;
  equipmentType: EquipmentType;
  pricePerDay: number;
  location: string;
  isAvailable: boolean;
  description: string;
  createdAt: bigint;
}

export enum BookingStatus {
  pending = "pending",
  confirmed = "confirmed",
  completed = "completed",
  cancelled = "cancelled",
}

export interface RentalBooking {
  id: bigint;
  renter: Principal;
  equipmentId: bigint;
  startDate: bigint;
  endDate: bigint;
  totalPrice: number;
  status: BookingStatus;
  createdAt: bigint;
}

export enum SchemeCategory {
  subsidy = "subsidy",
  loan = "loan",
  insurance = "insurance",
  training = "training",
  other = "other",
}

export interface GovernmentScheme {
  id: bigint;
  name: string;
  category: SchemeCategory;
  eligibility: string;
  benefits: string;
  applicationUrl: string;
  deadline: string;
  isActive: boolean;
  createdAt: bigint;
}

export interface Message {
  id: bigint;
  sender: Principal;
  receiver: Principal;
  content: string;
  timestamp: bigint;
  isRead: boolean;
}

export enum WaterAvailability {
  low = "low",
  medium = "medium",
  high = "high",
}

export interface CropRecommendation {
  id: bigint;
  user: Principal;
  soilType: string;
  season: string;
  waterAvailability: WaterAvailability;
  location: string;
  recommendedCrops: string[];
  tips: string[];
  createdAt: bigint;
}

export interface DiseaseReport {
  id: bigint;
  user: Principal;
  cropName: string;
  description: string;
  mockDiagnosis: string;
  mockTreatment: string;
  createdAt: bigint;
}

export interface ConversationSummary {
  otherUser: Principal;
  lastMessage: string;
  lastTimestamp: bigint;
  unreadCount: bigint;
}

export interface backendInterface {
  // Profile
  createProfile(name: string, phone: string, location: string, farmSize: string, farmType: string, bio: string | null, role: UserRole): Promise<void>;
  updateProfile(name: string, phone: string, location: string, farmSize: string, farmType: string, bio: string | null): Promise<void>;
  getMyProfile(): Promise<FarmerProfile | null>;
  getCallerUserProfile(): Promise<FarmerProfile | null>;
  saveCallerUserProfile(profile: FarmerProfile): Promise<void>;
  getProfile(userId: Principal): Promise<FarmerProfile | null>;
  getUserProfile(user: Principal): Promise<FarmerProfile | null>;
  getAllUsers(): Promise<Array<FarmerProfile>>;
  deleteUser(userId: Principal): Promise<void>;
  // AccessControl
  assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
  getCallerUserRole(): Promise<UserRole__1>;
  isCallerAdmin(): Promise<boolean>;
  // Crop Marketplace
  createCropListing(cropName: string, category: CropCategory, quantity: number, unit: string, pricePerQuintal: number, description: string, location: string): Promise<bigint>;
  updateCropListing(id: bigint, cropName: string, category: CropCategory, quantity: number, unit: string, pricePerQuintal: number, description: string, location: string): Promise<void>;
  markCropAsSold(id: bigint): Promise<void>;
  deleteCropListing(id: bigint): Promise<void>;
  getAllCropListings(): Promise<Array<CropListing>>;
  getCropListingsByCategory(category: CropCategory): Promise<Array<CropListing>>;
  getMyCropListings(): Promise<Array<CropListing>>;
  getCropListing(id: bigint): Promise<CropListing | null>;
  // Store
  createStoreProduct(name: string, category: ProductCategory, price: number, unit: string, stock: bigint, description: string): Promise<bigint>;
  updateStoreProduct(id: bigint, name: string, category: ProductCategory, price: number, unit: string, stock: bigint, description: string): Promise<void>;
  deleteStoreProduct(id: bigint): Promise<void>;
  getAllStoreProducts(): Promise<Array<StoreProduct>>;
  getStoreProductsByCategory(category: ProductCategory): Promise<Array<StoreProduct>>;
  getMyStoreProducts(): Promise<Array<StoreProduct>>;
  getStoreProduct(id: bigint): Promise<StoreProduct | null>;
  // Equipment
  createEquipmentListing(name: string, equipmentType: EquipmentType, pricePerDay: number, location: string, description: string): Promise<bigint>;
  updateEquipmentListing(id: bigint, name: string, equipmentType: EquipmentType, pricePerDay: number, location: string, isAvailable: boolean, description: string): Promise<void>;
  deleteEquipmentListing(id: bigint): Promise<void>;
  getAllEquipmentListings(): Promise<Array<EquipmentListing>>;
  getMyEquipmentListings(): Promise<Array<EquipmentListing>>;
  getEquipmentListing(id: bigint): Promise<EquipmentListing | null>;
  createRentalBooking(equipmentId: bigint, startDate: bigint, endDate: bigint, totalPrice: number): Promise<bigint>;
  updateBookingStatus(id: bigint, status: BookingStatus): Promise<void>;
  getMyBookings(): Promise<Array<RentalBooking>>;
  getBookingsForMyEquipment(): Promise<Array<RentalBooking>>;
  // Government Schemes
  createScheme(name: string, category: SchemeCategory, eligibility: string, benefits: string, applicationUrl: string, deadline: string): Promise<bigint>;
  updateScheme(id: bigint, name: string, category: SchemeCategory, eligibility: string, benefits: string, applicationUrl: string, deadline: string, isActive: boolean): Promise<void>;
  deleteScheme(id: bigint): Promise<void>;
  getAllSchemes(): Promise<Array<GovernmentScheme>>;
  getSchemesByCategory(category: SchemeCategory): Promise<Array<GovernmentScheme>>;
  getScheme(id: bigint): Promise<GovernmentScheme | null>;
  // Messaging
  sendMessage(receiver: Principal, content: string): Promise<bigint>;
  getConversation(otherUser: Principal): Promise<Array<Message>>;
  getMyConversations(): Promise<Array<ConversationSummary>>;
  markMessagesAsRead(otherUser: Principal): Promise<void>;
  getUnreadCount(): Promise<bigint>;
  // Crop Advisor
  getCropRecommendation(soilType: string, season: string, waterAvailability: WaterAvailability, location: string): Promise<CropRecommendation>;
  reportDiseaseDetection(cropName: string, description: string): Promise<DiseaseReport>;
  getMyRecommendations(): Promise<Array<CropRecommendation>>;
  getMyDiseaseReports(): Promise<Array<DiseaseReport>>;
  // Admin
  adminGetAllCropListings(): Promise<Array<CropListing>>;
  adminGetAllStoreProducts(): Promise<Array<StoreProduct>>;
  adminGetAllEquipmentListings(): Promise<Array<EquipmentListing>>;
  adminGetAllBookings(): Promise<Array<RentalBooking>>;
  adminGetAllMessages(): Promise<Array<Message>>;
}
