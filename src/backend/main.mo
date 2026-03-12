import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // ── Type Definitions ──────────────────────────────────────────────────────

  public type UserRole = { #farmer; #buyer; #admin };

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

  public type CropCategory = { #grains; #vegetables; #fruits; #pulses; #spices; #other };
  public type ListingStatus = { #available; #sold };

  public type CropListing = {
    id : Nat;
    seller : Principal;
    cropName : Text;
    category : CropCategory;
    quantity : Float;
    unit : Text;
    pricePerQuintal : Float;
    description : Text;
    location : Text;
    status : ListingStatus;
    createdAt : Time.Time;
  };

  public type ProductCategory = { #fertilizer; #seeds; #pesticides; #tools; #other };

  public type StoreProduct = {
    id : Nat;
    seller : Principal;
    name : Text;
    category : ProductCategory;
    price : Float;
    unit : Text;
    stock : Nat;
    description : Text;
    createdAt : Time.Time;
  };

  public type EquipmentType = { #tractor; #harvester; #sprayer; #drip_irrigation; #other };

  public type EquipmentListing = {
    id : Nat;
    owner : Principal;
    name : Text;
    equipmentType : EquipmentType;
    pricePerDay : Float;
    location : Text;
    isAvailable : Bool;
    description : Text;
    createdAt : Time.Time;
  };

  public type BookingStatus = { #pending; #confirmed; #completed; #cancelled };

  public type RentalBooking = {
    id : Nat;
    renter : Principal;
    equipmentId : Nat;
    startDate : Int;
    endDate : Int;
    totalPrice : Float;
    status : BookingStatus;
    createdAt : Time.Time;
  };

  public type SchemeCategory = { #subsidy; #loan; #insurance; #training; #other };

  public type GovernmentScheme = {
    id : Nat;
    name : Text;
    category : SchemeCategory;
    eligibility : Text;
    benefits : Text;
    applicationUrl : Text;
    deadline : Text;
    isActive : Bool;
    createdAt : Time.Time;
  };

  public type Message = {
    id : Nat;
    sender : Principal;
    receiver : Principal;
    content : Text;
    timestamp : Time.Time;
    isRead : Bool;
  };

  public type WaterAvailability = { #low; #medium; #high };

  public type CropRecommendation = {
    id : Nat;
    user : Principal;
    soilType : Text;
    season : Text;
    waterAvailability : WaterAvailability;
    location : Text;
    recommendedCrops : [Text];
    tips : [Text];
    createdAt : Time.Time;
  };

  public type DiseaseReport = {
    id : Nat;
    user : Principal;
    cropName : Text;
    description : Text;
    mockDiagnosis : Text;
    mockTreatment : Text;
    createdAt : Time.Time;
  };

  public type ConversationSummary = {
    otherUser : Principal;
    lastMessage : Text;
    lastTimestamp : Time.Time;
    unreadCount : Nat;
  };

  // ── State ──────────────────────────────────────────────────────────────────

  let profiles = Map.empty<Principal, FarmerProfile>();
  let cropListings = Map.empty<Nat, CropListing>();
  let storeProducts = Map.empty<Nat, StoreProduct>();
  let equipmentListings = Map.empty<Nat, EquipmentListing>();
  let rentalBookings = Map.empty<Nat, RentalBooking>();
  let govSchemes = Map.empty<Nat, GovernmentScheme>();
  let messages = Map.empty<Nat, Message>();
  let cropRecommendations = Map.empty<Nat, CropRecommendation>();
  let diseaseReports = Map.empty<Nat, DiseaseReport>();

  var nextCropId : Nat = 1;
  var nextProductId : Nat = 1;
  var nextEquipmentId : Nat = 1;
  var nextBookingId : Nat = 1;
  var nextSchemeId : Nat = 1;
  var nextMessageId : Nat = 1;
  var nextRecommendationId : Nat = 1;
  var nextDiseaseReportId : Nat = 1;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ── Helpers ────────────────────────────────────────────────────────────────

  private func isRegistered(caller : Principal) : Bool {
    not caller.isAnonymous() and profiles.get(caller) != null;
  };

  private func requireRegistered(caller : Principal) {
    if (not isRegistered(caller)) {
      Runtime.trap("Unauthorized: Must be a registered user");
    };
  };

  private func requireAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };
  };

  private func mapToAccessControlRole(appRole : UserRole) : AccessControl.UserRole {
    switch (appRole) {
      case (#admin) { #admin };
      case (#farmer) { #user };
      case (#buyer) { #user };
    };
  };

  // ── Profile Module ─────────────────────────────────────────────────────────

  public shared ({ caller }) func createProfile(name : Text, phone : Text, location : Text, farmSize : Text, farmType : Text, bio : ?Text, role : UserRole) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Anonymous users cannot create profiles") };
    switch (profiles.get(caller)) {
      case (?_) { Runtime.trap("Profile already exists") };
      case (null) {};
    };
    let newProfile : FarmerProfile = { name; phone; location; farmSize; farmType; bio; role; createdAt = Time.now() };
    profiles.add(caller, newProfile);
    let acRole = mapToAccessControlRole(role);
    accessControlState.userRoles.add(caller, acRole);
    if (acRole == #admin) { accessControlState.adminAssigned := true };
  };

  public shared ({ caller }) func updateProfile(name : Text, phone : Text, location : Text, farmSize : Text, farmType : Text, bio : ?Text) : async () {
    requireRegistered(caller);
    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?existing) {
        profiles.add(caller, { existing with name; phone; location; farmSize; farmType; bio });
      };
    };
  };

  public query ({ caller }) func getMyProfile() : async ?FarmerProfile { profiles.get(caller) };

  public query ({ caller }) func getCallerUserProfile() : async ?FarmerProfile { profiles.get(caller) };

  public shared ({ caller }) func saveCallerUserProfile(profile : FarmerProfile) : async () {
    requireRegistered(caller);
    profiles.add(caller, profile);
  };

  public query ({ caller }) func getProfile(userId : Principal) : async ?FarmerProfile {
    profiles.get(userId);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?FarmerProfile {
    profiles.get(user);
  };

  public query ({ caller }) func getAllUsers() : async [FarmerProfile] {
    requireAdmin(caller);
    profiles.values().toArray();
  };

  public shared ({ caller }) func deleteUser(userId : Principal) : async () {
    requireAdmin(caller);
    profiles.remove(userId);
  };

  // ── Crop Marketplace Module ────────────────────────────────────────────────

  public shared ({ caller }) func createCropListing(cropName : Text, category : CropCategory, quantity : Float, unit : Text, pricePerQuintal : Float, description : Text, location : Text) : async Nat {
    requireRegistered(caller);
    let id = nextCropId;
    nextCropId += 1;
    let listing : CropListing = { id; seller = caller; cropName; category; quantity; unit; pricePerQuintal; description; location; status = #available; createdAt = Time.now() };
    cropListings.add(id, listing);
    id;
  };

  public shared ({ caller }) func updateCropListing(id : Nat, cropName : Text, category : CropCategory, quantity : Float, unit : Text, pricePerQuintal : Float, description : Text, location : Text) : async () {
    requireRegistered(caller);
    switch (cropListings.get(id)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?l) {
        if (l.seller != caller and not AccessControl.isAdmin(accessControlState, caller)) { Runtime.trap("Unauthorized") };
        cropListings.add(id, { l with cropName; category; quantity; unit; pricePerQuintal; description; location });
      };
    };
  };

  public shared ({ caller }) func markCropAsSold(id : Nat) : async () {
    requireRegistered(caller);
    switch (cropListings.get(id)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?l) {
        if (l.seller != caller and not AccessControl.isAdmin(accessControlState, caller)) { Runtime.trap("Unauthorized") };
        cropListings.add(id, { l with status = #sold });
      };
    };
  };

  public shared ({ caller }) func deleteCropListing(id : Nat) : async () {
    requireRegistered(caller);
    switch (cropListings.get(id)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?l) {
        if (l.seller != caller and not AccessControl.isAdmin(accessControlState, caller)) { Runtime.trap("Unauthorized") };
        cropListings.remove(id);
      };
    };
  };

  public query func getAllCropListings() : async [CropListing] {
    cropListings.values().toArray();
  };

  public query func getCropListingsByCategory(category : CropCategory) : async [CropListing] {
    cropListings.values().toArray().filter(func(l : CropListing) : Bool { l.category == category });
  };

  public query ({ caller }) func getMyCropListings() : async [CropListing] {
    cropListings.values().toArray().filter(func(l : CropListing) : Bool { l.seller == caller });
  };

  public query func getCropListing(id : Nat) : async ?CropListing {
    cropListings.get(id);
  };

  // ── Agriculture Store Module ───────────────────────────────────────────────

  public shared ({ caller }) func createStoreProduct(name : Text, category : ProductCategory, price : Float, unit : Text, stock : Nat, description : Text) : async Nat {
    requireRegistered(caller);
    let id = nextProductId;
    nextProductId += 1;
    let product : StoreProduct = { id; seller = caller; name; category; price; unit; stock; description; createdAt = Time.now() };
    storeProducts.add(id, product);
    id;
  };

  public shared ({ caller }) func updateStoreProduct(id : Nat, name : Text, category : ProductCategory, price : Float, unit : Text, stock : Nat, description : Text) : async () {
    requireRegistered(caller);
    switch (storeProducts.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) {
        if (p.seller != caller and not AccessControl.isAdmin(accessControlState, caller)) { Runtime.trap("Unauthorized") };
        storeProducts.add(id, { p with name; category; price; unit; stock; description });
      };
    };
  };

  public shared ({ caller }) func deleteStoreProduct(id : Nat) : async () {
    requireRegistered(caller);
    switch (storeProducts.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) {
        if (p.seller != caller and not AccessControl.isAdmin(accessControlState, caller)) { Runtime.trap("Unauthorized") };
        storeProducts.remove(id);
      };
    };
  };

  public query func getAllStoreProducts() : async [StoreProduct] {
    storeProducts.values().toArray();
  };

  public query func getStoreProductsByCategory(category : ProductCategory) : async [StoreProduct] {
    storeProducts.values().toArray().filter(func(p : StoreProduct) : Bool { p.category == category });
  };

  public query ({ caller }) func getMyStoreProducts() : async [StoreProduct] {
    storeProducts.values().toArray().filter(func(p : StoreProduct) : Bool { p.seller == caller });
  };

  public query func getStoreProduct(id : Nat) : async ?StoreProduct {
    storeProducts.get(id);
  };

  // ── Equipment Rental Module ────────────────────────────────────────────────

  public shared ({ caller }) func createEquipmentListing(name : Text, equipmentType : EquipmentType, pricePerDay : Float, location : Text, description : Text) : async Nat {
    requireRegistered(caller);
    let id = nextEquipmentId;
    nextEquipmentId += 1;
    let listing : EquipmentListing = { id; owner = caller; name; equipmentType; pricePerDay; location; isAvailable = true; description; createdAt = Time.now() };
    equipmentListings.add(id, listing);
    id;
  };

  public shared ({ caller }) func updateEquipmentListing(id : Nat, name : Text, equipmentType : EquipmentType, pricePerDay : Float, location : Text, isAvailable : Bool, description : Text) : async () {
    requireRegistered(caller);
    switch (equipmentListings.get(id)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?l) {
        if (l.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) { Runtime.trap("Unauthorized") };
        equipmentListings.add(id, { l with name; equipmentType; pricePerDay; location; isAvailable; description });
      };
    };
  };

  public shared ({ caller }) func deleteEquipmentListing(id : Nat) : async () {
    requireRegistered(caller);
    switch (equipmentListings.get(id)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?l) {
        if (l.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) { Runtime.trap("Unauthorized") };
        equipmentListings.remove(id);
      };
    };
  };

  public query func getAllEquipmentListings() : async [EquipmentListing] {
    equipmentListings.values().toArray();
  };

  public query ({ caller }) func getMyEquipmentListings() : async [EquipmentListing] {
    equipmentListings.values().toArray().filter(func(l : EquipmentListing) : Bool { l.owner == caller });
  };

  public query func getEquipmentListing(id : Nat) : async ?EquipmentListing {
    equipmentListings.get(id);
  };

  public shared ({ caller }) func createRentalBooking(equipmentId : Nat, startDate : Int, endDate : Int, totalPrice : Float) : async Nat {
    requireRegistered(caller);
    switch (equipmentListings.get(equipmentId)) {
      case (null) { Runtime.trap("Equipment not found") };
      case (?_) {};
    };
    let id = nextBookingId;
    nextBookingId += 1;
    let booking : RentalBooking = { id; renter = caller; equipmentId; startDate; endDate; totalPrice; status = #pending; createdAt = Time.now() };
    rentalBookings.add(id, booking);
    id;
  };

  public shared ({ caller }) func updateBookingStatus(id : Nat, status : BookingStatus) : async () {
    requireRegistered(caller);
    switch (rentalBookings.get(id)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?b) {
        rentalBookings.add(id, { b with status });
      };
    };
  };

  public query ({ caller }) func getMyBookings() : async [RentalBooking] {
    rentalBookings.values().toArray().filter(func(b : RentalBooking) : Bool { b.renter == caller });
  };

  public query ({ caller }) func getBookingsForMyEquipment() : async [RentalBooking] {
    let myIds = equipmentListings.values().toArray()
      .filter(func(l : EquipmentListing) : Bool { l.owner == caller })
      .map(func(l : EquipmentListing) : Nat { l.id });
    rentalBookings.values().toArray().filter(func(b : RentalBooking) : Bool {
      myIds.vals().filter(func(id : Nat) : Bool { id == b.equipmentId }).size() > 0;
    });
  };

  // ── Government Schemes Module ──────────────────────────────────────────────

  public shared ({ caller }) func createScheme(name : Text, category : SchemeCategory, eligibility : Text, benefits : Text, applicationUrl : Text, deadline : Text) : async Nat {
    requireAdmin(caller);
    let id = nextSchemeId;
    nextSchemeId += 1;
    let scheme : GovernmentScheme = { id; name; category; eligibility; benefits; applicationUrl; deadline; isActive = true; createdAt = Time.now() };
    govSchemes.add(id, scheme);
    id;
  };

  public shared ({ caller }) func updateScheme(id : Nat, name : Text, category : SchemeCategory, eligibility : Text, benefits : Text, applicationUrl : Text, deadline : Text, isActive : Bool) : async () {
    requireAdmin(caller);
    switch (govSchemes.get(id)) {
      case (null) { Runtime.trap("Scheme not found") };
      case (?s) {
        govSchemes.add(id, { s with name; category; eligibility; benefits; applicationUrl; deadline; isActive });
      };
    };
  };

  public shared ({ caller }) func deleteScheme(id : Nat) : async () {
    requireAdmin(caller);
    govSchemes.remove(id);
  };

  public query func getAllSchemes() : async [GovernmentScheme] {
    govSchemes.values().toArray();
  };

  public query func getSchemesByCategory(category : SchemeCategory) : async [GovernmentScheme] {
    govSchemes.values().toArray().filter(func(s : GovernmentScheme) : Bool { s.category == category });
  };

  public query func getScheme(id : Nat) : async ?GovernmentScheme {
    govSchemes.get(id);
  };

  // ── Messaging Module ───────────────────────────────────────────────────────

  public shared ({ caller }) func sendMessage(receiver : Principal, content : Text) : async Nat {
    requireRegistered(caller);
    let id = nextMessageId;
    nextMessageId += 1;
    let msg : Message = { id; sender = caller; receiver; content; timestamp = Time.now(); isRead = false };
    messages.add(id, msg);
    id;
  };

  public query ({ caller }) func getConversation(otherUser : Principal) : async [Message] {
    messages.values().toArray().filter(func(m : Message) : Bool {
      (m.sender == caller and m.receiver == otherUser) or (m.sender == otherUser and m.receiver == caller);
    });
  };

  public query ({ caller }) func getMyConversations() : async [ConversationSummary] {
    let all = messages.values().toArray();
    let userMap = Map.empty<Principal, Bool>();
    for (m in Iter.fromArray(all)) {
      if (m.sender == caller) { userMap.add(m.receiver, true) };
      if (m.receiver == caller) { userMap.add(m.sender, true) };
    };
    userMap.keys().toArray().map(func(u : Principal) : ConversationSummary {
      let conv = all.filter(func(m : Message) : Bool {
        (m.sender == caller and m.receiver == u) or (m.sender == u and m.receiver == caller);
      });
      let sorted = conv.sort(func(a : Message, b : Message) : Order.Order { Int.compare(b.timestamp, a.timestamp) });
      let lastMsg = if (sorted.size() > 0) { sorted[0].content } else { "" };
      let lastTs = if (sorted.size() > 0) { sorted[0].timestamp } else { 0 };
      let unread = conv.filter(func(m : Message) : Bool { m.receiver == caller and not m.isRead }).size();
      { otherUser = u; lastMessage = lastMsg; lastTimestamp = lastTs; unreadCount = unread };
    });
  };

  public shared ({ caller }) func markMessagesAsRead(otherUser : Principal) : async () {
    requireRegistered(caller);
    for (m in Iter.fromArray(messages.values().toArray())) {
      if (m.receiver == caller and m.sender == otherUser and not m.isRead) {
        messages.add(m.id, { m with isRead = true });
      };
    };
  };

  public query ({ caller }) func getUnreadCount() : async Nat {
    messages.values().toArray().filter(func(m : Message) : Bool { m.receiver == caller and not m.isRead }).size();
  };

  // ── Crop Advisor Module (Mock AI) ──────────────────────────────────────────

  public shared ({ caller }) func getCropRecommendation(soilType : Text, season : Text, waterAvailability : WaterAvailability, location : Text) : async CropRecommendation {
    requireRegistered(caller);
    let crops : [Text] = switch (season) {
      case ("Kharif") { ["Rice", "Maize", "Soybean"] };
      case ("Rabi") { ["Wheat", "Mustard", "Chickpea"] };
      case ("Zaid") { ["Watermelon", "Cucumber", "Muskmelon"] };
      case (_) { ["Tomato", "Onion", "Potato"] };
    };
    let tips : [Text] = [
      "Ensure proper soil testing before sowing",
      "Use certified seeds for better yield",
      "Apply balanced NPK fertilizers as per soil report",
      "Practice integrated pest management",
      "Maintain proper irrigation schedule",
    ];
    let id = nextRecommendationId;
    nextRecommendationId += 1;
    let rec : CropRecommendation = { id; user = caller; soilType; season; waterAvailability; location; recommendedCrops = crops; tips; createdAt = Time.now() };
    cropRecommendations.add(id, rec);
    rec;
  };

  public shared ({ caller }) func reportDiseaseDetection(cropName : Text, description : Text) : async DiseaseReport {
    requireRegistered(caller);
    let diagnosis = "Based on symptoms described, this appears to be a fungal infection (Mock Diagnosis). Please consult your local agricultural extension officer for confirmation.";
    let treatment = "Apply recommended fungicide. Remove and destroy infected plant parts. Improve air circulation. Avoid overhead irrigation. Repeat treatment after 7-10 days if symptoms persist.";
    let id = nextDiseaseReportId;
    nextDiseaseReportId += 1;
    let report : DiseaseReport = { id; user = caller; cropName; description; mockDiagnosis = diagnosis; mockTreatment = treatment; createdAt = Time.now() };
    diseaseReports.add(id, report);
    report;
  };

  public query ({ caller }) func getMyRecommendations() : async [CropRecommendation] {
    cropRecommendations.values().toArray().filter(func(r : CropRecommendation) : Bool { r.user == caller });
  };

  public query ({ caller }) func getMyDiseaseReports() : async [DiseaseReport] {
    diseaseReports.values().toArray().filter(func(r : DiseaseReport) : Bool { r.user == caller });
  };

  // ── Admin Panel Functions ──────────────────────────────────────────────────

  public query ({ caller }) func adminGetAllCropListings() : async [CropListing] {
    requireAdmin(caller);
    cropListings.values().toArray();
  };

  public query ({ caller }) func adminGetAllStoreProducts() : async [StoreProduct] {
    requireAdmin(caller);
    storeProducts.values().toArray();
  };

  public query ({ caller }) func adminGetAllEquipmentListings() : async [EquipmentListing] {
    requireAdmin(caller);
    equipmentListings.values().toArray();
  };

  public query ({ caller }) func adminGetAllBookings() : async [RentalBooking] {
    requireAdmin(caller);
    rentalBookings.values().toArray();
  };

  public query ({ caller }) func adminGetAllMessages() : async [Message] {
    requireAdmin(caller);
    messages.values().toArray();
  };
};
