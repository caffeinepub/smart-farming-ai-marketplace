import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface FarmerProfile {
    bio?: string;
    farmSize: string;
    farmType: string;
    name: string;
    createdAt: Time;
    role: UserRole;
    phone: string;
    location: string;
}
export type Time = bigint;
export enum UserRole {
    admin = "admin",
    buyer = "buyer",
    farmer = "farmer"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    createProfile(name: string, phone: string, location: string, farmSize: string, farmType: string, bio: string | null, role: UserRole): Promise<void>;
    deleteUser(userId: Principal): Promise<void>;
    getAllUsers(): Promise<Array<FarmerProfile>>;
    getCallerUserProfile(): Promise<FarmerProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getMyProfile(): Promise<FarmerProfile | null>;
    getProfile(userId: Principal): Promise<FarmerProfile | null>;
    getUserProfile(user: Principal): Promise<FarmerProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: FarmerProfile): Promise<void>;
    updateProfile(name: string, phone: string, location: string, farmSize: string, farmType: string, bio: string | null): Promise<void>;
}
