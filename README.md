# EcoTrace — Personal Carbon Footprint Tracker for India

EcoTrace is a personal carbon footprint tracking application engineered specifically for the Indian consumer market. It helps individuals track and reduce daily emissions using **India-specific emission factors**, regional grid intensities, and local diets, powered by Google Gemini AI for natural-language activity parsing and utility bill scanning.

---

## 📄 Core Product Requirements

Detailed design specifications, compliance criteria, performance budgets, and security principles are located in:

- 📁 **[EcoTrace Product Requirements Document (PRD)](file:///d:/carbon%20footprint/docs/EcoTrace_PRD.md)**

---

## 🧮 Emission Factor Engine (Mathematical Formulas)

Unlike generic calculators calibrated to Western energy standards (which assume heavy car commutes and domestic gas heating), EcoTrace uses localized factors based on the **Central Electricity Authority (CEA) Baseline Database (v20.0)** and **MoEFCC/ICAT guidelines**.

### 🚗 1. Transport emissions

$$\text{Emissions } (\text{kg } \text{CO}_2\text{e}) = \text{Distance } (\text{km}) \times \text{Emission Factor } (\text{kg } \text{CO}_2\text{e/km})$$

| Vehicle Subtype                     | Fuel Type     | Factor (kg CO₂e/km) |
| :---------------------------------- | :------------ | :------------------ |
| Two-Wheeler (`2w_petrol`)           | Petrol        | **0.056**           |
| Two-Wheeler (`2w_ev`)               | Electric      | **0.015**           |
| Auto-Rickshaw (`3w_cng`)            | CNG           | **0.048**           |
| Auto-Rickshaw (`3w_diesel`)         | Diesel        | **0.085**           |
| Private Car (`4w_petrol`)           | Petrol        | **0.143**           |
| Private Car (`4w_diesel`)           | Diesel        | **0.132**           |
| Private Car (`4w_cng`)              | CNG           | **0.098**           |
| Private Car (`4w_ev`)               | Electric      | **0.042**           |
| Public Bus (`bus_diesel`)           | Diesel        | **0.035**           |
| Public Bus (`bus_cng_ev`)           | CNG/Electric  | **0.015**           |
| Metro / Local Train (`metro_train`) | Grid Electric | **0.018**           |
| Domestic Flight (`flight_domestic`) | Aviation Fuel | **0.120**           |

---

### ⚡ 2. Grid Electricity

$$\text{Emissions } (\text{kg } \text{CO}_2\text{e}) = \text{Electricity Consumed } (\text{kWh}) \times \text{State Grid Intensity } (\text{kg } \text{CO}_2\text{e/kWh})$$

- **National Grid Default Factor**: **0.71 kg CO₂e/kWh**

Grid carbon intensity varies significantly by regional energy mix (coal-heavy vs. hydro/renewables-heavy):

| Region           | Grid Factor (kg CO₂e/kWh) | Map of States / Territories                                                                                     |
| :--------------- | :-----------------------: | :-------------------------------------------------------------------------------------------------------------- |
| **Eastern**      |         **0.78**          | West Bengal, Bihar, Jharkhand, Odisha                                                                           |
| **Western**      |         **0.74**          | Maharashtra, Gujarat, Madhya Pradesh, Chhattisgarh, Goa                                                         |
| **Northern**     |         **0.71**          | Delhi, Punjab, Haryana, Uttar Pradesh, Rajasthan, Jammu & Kashmir, Chandigarh                                   |
| **Southern**     |         **0.63**          | Karnataka, Tamil Nadu, Andhra Pradesh, Kerala, Telangana, Puducherry                                            |
| **Northeastern** |         **0.52**          | Himachal Pradesh, Uttarakhand, Sikkim, Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Tripura |

---

### 🍳 3. Cooking Fuels

$$\text{Emissions } (\text{kg } \text{CO}_2\text{e}) = \text{Quantity } \times \text{Fuel Factor}$$

- **LPG Cylinder (`lpg_cylinder`)**: **42.5 kg CO₂e** (per 14.2 kg domestic cylinder)
- **Piped Natural Gas (`png_m3`)**: **2.02 kg CO₂e** (per m³)
- **Biomass Fuel (`biomass_kg`)**: **1.85 kg CO₂e** (per kg wood/dung)
- **Electric Cooking (`electric_kwh`)**: Calculated dynamically based on the user's **State Grid Factor** $\times$ electricity consumed (kWh).

---

### 🥗 4. Diet & Food

$$\text{Emissions } (\text{kg } \text{CO}_2\text{e}) = \text{Duration } (\text{days}) \times \text{Dietary Factor } (\text{kg } \text{CO}_2\text{e/day})$$

- **Vegan (`vegan`)**: **1.1 kg CO₂e/day**
- **Vegetarian (`vegetarian`)**: **1.6 kg CO₂e/day** (Typical Indian veg thali)
- **Eggetarian (`eggetarian`)**: **1.9 kg CO₂e/day**
- **Low-Meat Non-Vegetarian (`non_veg_low`)**: **2.8 kg CO₂e/day**
- **High-Meat Non-Vegetarian (`non_veg_high`)**: **4.5 kg CO₂e/day** (Frequent mutton/poultry)

---

### 🛍️ 5. Consumer Consumption

$$\text{Emissions } (\text{kg } \text{CO}_2\text{e}) = \text{Item Count } \times \text{Consumption Factor}$$

- **E-Commerce/Food Order (`delivery_order`)**: **0.95 kg CO₂e** (packaging + shipping proxy)
- **Fast Fashion Clothes Item (`fashion_item`)**: **9.50 kg CO₂e** (production footprint)
- **Electronics Device (`electronics_device`)**: **65.00 kg CO₂e** (average embedded manufacturing footprint)

---

## 📁 Repository Structure & Directory Map

```txt
ecotrace/
├── docs/                        # Specifications and design requirements
│   ├── EcoTrace_PRD.md          # Core Product Requirements Document
│   └── EcoTrace_PRD.docx        # PRD Word format
├── app/                         # Next.js App Router (Pages, Layouts & APIs)
│   ├── (app)/                   # Route group for authenticated dashboards
│   │   ├── bills/               # OCR Utility Bill Scanner Page
│   │   ├── coach/               # AI Carbon Coach Chat Console
│   │   ├── dashboard/           # User dashboard page (Activity logger, History table)
│   │   ├── leaderboard/         # Anonymized cohort leaderboard comparative page
│   │   └── settings/            # Data portability (GDPR export) and erasure controls
│   ├── api/                     # API route handlers
│   │   ├── emissions/           # Carbon calculation proxies (AI Parser, OCR, Coach)
│   │   └── layout.tsx           # Global HTML wrapper
│   └── globals.css              # Custom shadcn Tailwind CSS variables
├── components/                  # Shared React UI Components
│   ├── providers/               # Global Contexts (Firebase Auth, Theme, TanStack Query)
│   ├── DashboardCharts.tsx      # Bar/Area charts powered by Recharts
│   └── Navbar.tsx               # Global Header and navigation links
├── lib/                         # Global Code Libraries
│   ├── emissions/               # Carbon Emissions Engine
│   │   └── engine.ts            # Local math calculators and factors
│   └── firebase/                # Client-side Firebase configurations
│       ├── config.ts            # Auth & Emulator environment configuration
│       └── db.ts                # Firestore read/write interfaces & localStorage fallback
├── functions/                   # Firebase Cloud Functions (TypeScript Backend)
│   ├── src/                     # Cloud Functions logic (Idempotent background calculations)
│   │   ├── calculateFootprint.ts
│   │   ├── parseActivityText.ts
│   │   ├── parseUtilityBill.ts
│   │   └── weeklyDigest.ts      # Scheduled task CRON job
│   └── package.json             # Separate Cloud Functions configurations
├── tests/                       # Test Suites
│   ├── auth.test.ts             # Authentication flow mock test cases
│   ├── db.test.ts               # Database service integration mock test cases
│   └── engine.test.ts           # Math calculations golden-file assertions
├── eslint.config.mjs            # Strict ESLint configuration
├── .prettierrc                  # Prettier style guide definitions
└── .prettierignore              # Prettier exclusions file
```

---

## 🗄️ Firestore Database Schema

EcoTrace maintains a lightweight, security-ruled database structure:

### 1. `users/{userId}`

Holds user profile metadata to localize emission calculators:

```json
{
  "city": "Mumbai",
  "state": "Maharashtra",
  "dietType": "vegetarian",
  "householdSize": 4,
  "createdAt": "2026-06-21T10:00:00.000Z"
}
```

### 2. `users/{userId}/activities/{activityId}`

Logs individual user actions:

```json
{
  "category": "transport",
  "subType": "2w_petrol",
  "quantity": 15.0,
  "unit": "km",
  "co2eKg": 0.84,
  "source": "manual", // manual | ai_parsed | bill_ocr
  "factorVersion": "v20.0-2024",
  "loggedAt": "2026-06-21T15:30:00.000Z",
  "note": "Commute to office"
}
```

### 3. `users/{userId}/dailySummaries/{YYYY-MM-DD}`

Denormalized aggregates to serve fast dashboard charts:

```json
{
  "totalCo2eKg": 3.44,
  "byCategory": {
    "transport": 0.84,
    "electricity": 0.0,
    "cooking": 0.0,
    "diet": 1.6,
    "consumption": 1.0
  },
  "factorVersion": "v20.0-2024"
}
```

---

## 🤖 AI Integrations (Google Gemini API)

All conversational features are executed server-side via Next.js API endpoints utilizing `gemini-2.5-flash` to safeguard keys and run structured operations.

1. **Conversational Logging (`/api/emissions/parse`)**:
   - Parses multi-modal strings (e.g., _"Rode my electric scooter for 10 km and ate non-veg lunch"_) into structured activities matching Zod JSON schemas.
   - Values are parsed and returned to the client console for final user confirmation before being logged to Firestore.
2. **AI Utility Bill OCR (`/api/emissions/bill`)**:
   - Extracts utility states, billing periods, and total units consumed (`unitsKwh`) from photographed bills using multimodal image analysis.
3. **Grounded Carbon Coach (`/api/emissions/coach`)**:
   - Provides localized, grounded advice strictly in the sustainability domain. The system prompt injects user state details, the active factor list, and recent user activity to ensure recommendations remain specific and realistic.

---

## 💻 Developer Setup & Running Commands

Ensure you have **Node.js 20+** installed.

### 1. Install Dependencies

Installs packages for both Next.js frontend and functions backend:

```bash
npm install
```

### 2. Set Up Local Environments

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Set to "mock" for frontend local storage mock mode
# Set to "true" to connect to local Firebase Emulators
# Set to "false" to connect to production Firebase
NEXT_PUBLIC_USE_EMULATORS=mock

# Gemini API access token (used server-side)
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Start Development Server

Starts Next.js server locally on `http://localhost:3000`:

```bash
npm run dev
```

### 4. Running Firebase Emulators

If using emulators (`NEXT_PUBLIC_USE_EMULATORS=true`), ensure Firebase CLI is authenticated and start emulators:

```bash
firebase emulators:start
```

### 5. Execute Test Suite

Runs all mock database, authentication, and carbon engine tests:

```bash
npm test
```

### 6. Formatting & Linting Check

Format the repository files with Prettier:

```bash
npm run format
```

Verify ESLint and TypeScript compilation type checks:

```bash
npm run lint
```
