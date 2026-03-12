# Smart Farming AI Marketplace

## Current State
- Backend: FarmerProfile management, UserRole (farmer/buyer/admin), AccessControl mixin
- Frontend pages: LandingPage, RegisterPage, DashboardPage (all modules showing coming-soon), ProfilePage
- Routes: /, /register, /dashboard, /profile
- Modules 2 and 3 (Marketplace, Store) previously built but pages no longer exist in codebase

## Requested Changes (Diff)

### Add
- **Backend data models and CRUD for:**
  - CropListing (Crop Marketplace): id, seller, cropName, category, quantity, unit, price, description, location, status (available/sold), createdAt
  - StoreProduct: id, seller, name, category (Fertilizer/Seeds/Pesticides/Tools), price, unit, stock, description, createdAt
  - EquipmentListing (Equipment Rental): id, owner, name, type, pricePerDay, location, availability, description, createdAt
  - RentalBooking: id, renter, equipmentId, startDate, endDate, totalPrice, status (pending/confirmed/completed/cancelled)
  - GovernmentScheme: id, name, category, eligibility, benefits, applicationUrl, deadline, createdAt
  - Message: id, sender, receiver, content, timestamp, read
- **Backend query/mutation functions for all above models**
- **Frontend pages:**
  - /marketplace: browse and search crop listings, create/manage own listings
  - /store: browse agriculture products, view details
  - /equipment: browse equipment, book rentals, manage own equipment listings
  - /crop-advisor: mock AI crop recommendation form + mock disease detection (image upload UI, mock response)
  - /schemes: browse government schemes with search and category filter
  - /messages: messaging UI, list conversations, send/receive messages
  - /admin: admin-only panel with tabs for Users, Crop Listings, Store Products, Equipment, Schemes management
- **Dashboard updated** with all modules active and linking to their routes
- **App.tsx routes** updated for all new pages with auth guards

### Modify
- DashboardPage: update all module cards from "coming-soon" to "available" with correct hrefs
- App.tsx: add routes for /marketplace, /store, /equipment, /crop-advisor, /schemes, /messages, /admin

### Remove
- Nothing removed

## Implementation Plan
1. Generate Motoko backend with all new data models and API functions
2. Build all frontend pages and update App.tsx + DashboardPage
3. Wire backend actor calls in frontend pages
4. Validate and deploy
