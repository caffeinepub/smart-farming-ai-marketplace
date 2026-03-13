# Smart Farming AI Marketplace

## Current State
Full platform with 8 modules (Marketplace, Store, Equipment, Crop Advisor, Schemes, Messages, Admin, Dashboard) and a Landing page. All text is in English only. Navbar has no language toggle.

## Requested Changes (Diff)

### Add
- `src/frontend/src/context/LanguageContext.tsx` — React context providing `lang` ("en"|"hi") state and `setLang` toggle; persists to localStorage.
- `src/frontend/src/translations/index.ts` — Full translation map for both languages covering all UI strings used across Navbar, Footer, LandingPage, DashboardPage, MarketplacePage, StorePage, EquipmentPage, CropAdvisorPage, SchemesPage, MessagesPage, AdminPage, RegisterPage, ProfilePage.
- Language toggle button (EN / हिंदी) in Navbar desktop + mobile menus.

### Modify
- `Navbar.tsx` — wrap with `useLanguage()`, replace nav link labels with translated strings, add language toggle.
- `Footer.tsx` — translate tagline.
- `LandingPage.tsx` — all section headings, feature titles/descriptions, stat labels, step titles/descriptions, CTA text.
- `DashboardPage.tsx` — greeting, module titles/descriptions, section headings.
- `MarketplacePage.tsx` — page title, search placeholder, category labels, form labels, button labels, empty/loading states.
- `StorePage.tsx` — same pattern.
- `EquipmentPage.tsx` — same pattern.
- `CropAdvisorPage.tsx` — same pattern.
- `SchemesPage.tsx` — same pattern.
- `MessagesPage.tsx` — same pattern.
- `AdminPage.tsx` — same pattern.
- `RegisterPage.tsx` — form labels, placeholders, button labels.
- `ProfilePage.tsx` — form labels, section headings.

### Remove
- Nothing removed.

## Implementation Plan
1. Create `LanguageContext.tsx` with `useLanguage()` hook and localStorage persistence.
2. Create `translations/index.ts` with full `en`/`hi` string maps.
3. Wrap `App.tsx` (or `main.tsx`) with `LanguageProvider`.
4. Update `Navbar.tsx` with language toggle and translated links.
5. Update all pages to use `useLanguage()` and `t()` for text strings.
6. Validate build.
