import Map "mo:core/Map";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Type Definitions
  public type UserRole = {
    #farmer;
    #buyer;
    #admin;
  };

  public type FarmerProfile = {
    name : Text;
    phone : Text;
    location : Text;
    farmSize : Text;
    farmType : Text;
    bio : ?Text;
    role : UserRole;
    createdAt : Time.Time;
  };

  // Comparison Module for FarmerProfile
  module FarmerProfile {
    public func compareByCreatedAt(a : FarmerProfile, b : FarmerProfile) : Order.Order {
      Int.compare(a.createdAt, b.createdAt);
    };

    public func compareByName(a : FarmerProfile, b : FarmerProfile) : Order.Order {
      switch (Text.compare(a.name, b.name)) {
        case (#equal) { compareByCreatedAt(a, b) };
        case (order) { order };
      };
    };
  };

  // State Management
  let profiles = Map.empty<Principal, FarmerProfile>();

  // Initialize Access Control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Helper function to map application role to AccessControl role
  private func mapToAccessControlRole(appRole : UserRole) : AccessControl.UserRole {
    switch (appRole) {
      case (#admin) { #admin };
      case (#farmer) { #user };
      case (#buyer) { #user };
    };
  };

  // API Functions
  public shared ({ caller }) func createProfile(name : Text, phone : Text, location : Text, farmSize : Text, farmType : Text, bio : ?Text, role : UserRole) : async () {
    // Check if profile already exists
    switch (profiles.get(caller)) {
      case (?_) {
        Runtime.trap("Profile already exists. Use updateProfile to modify it.");
      };
      case (null) {};
    };

    // Only guests (new users) can create their own profile, or admins can create profiles for others
    let callerRole = AccessControl.getUserRole(accessControlState, caller);
    if (callerRole != #guest and callerRole != #admin) {
      Runtime.trap("Permission denied: Profile already exists or insufficient permissions");
    };

    let newProfile : FarmerProfile = {
      name;
      phone;
      location;
      farmSize;
      farmType;
      bio;
      role;
      createdAt = Time.now();
    };

    profiles.add(caller, newProfile);

    // Assign the appropriate role in AccessControl system
    let accessControlRole = mapToAccessControlRole(role);
    AccessControl.assignRole(accessControlState, caller, caller, accessControlRole);
  };

  public shared ({ caller }) func updateProfile(name : Text, phone : Text, location : Text, farmSize : Text, farmType : Text, bio : ?Text) : async () {
    // Only authenticated users (not guests) can update profiles
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };

    switch (profiles.get(caller)) {
      case (null) { 
        Runtime.trap("Profile not found. Create a profile first.") 
      };
      case (?existingProfile) {
        let updatedProfile : FarmerProfile = {
          existingProfile with
          name;
          phone;
          location;
          farmSize;
          farmType;
          bio;
        };
        profiles.add(caller, updatedProfile);
      };
    };
  };

  public query ({ caller }) func getMyProfile() : async ?FarmerProfile {
    // Any caller can query their own profile, including guests
    profiles.get(caller);
  };

  public query ({ caller }) func getProfile(userId : Principal) : async ?FarmerProfile {
    // Users can view any profile
    // Guests can only view their own profile
    // Admins can view any profile
    if (caller != userId and not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Guests can only view their own profile");
    };
    
    profiles.get(userId);
  };

  public query ({ caller }) func getAllUsers() : async [FarmerProfile] {
    // Admin only
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };

    profiles.values().toArray().sort(FarmerProfile.compareByName);
  };

  public shared ({ caller }) func deleteUser(userId : Principal) : async () {
    // Admin only
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete users");
    };

    switch (profiles.get(userId)) {
      case (null) {
        Runtime.trap("Profile not found");
      };
      case (?_) {
        profiles.remove(userId);
      };
    };
  };

  // Required by frontend: get caller's profile
  public query ({ caller }) func getCallerUserProfile() : async ?FarmerProfile {
    profiles.get(caller);
  };

  // Required by frontend: save caller's profile (wrapper for updateProfile)
  public shared ({ caller }) func saveCallerUserProfile(profile : FarmerProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    switch (profiles.get(caller)) {
      case (null) {
        Runtime.trap("Profile not found. Create a profile first using createProfile.");
      };
      case (?_) {
        profiles.add(caller, profile);
      };
    };
  };

  // Required by frontend: get another user's profile
  public query ({ caller }) func getUserProfile(user : Principal) : async ?FarmerProfile {
    if (caller != user and not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Guests can only view their own profile");
    };
    profiles.get(user);
  };
};
