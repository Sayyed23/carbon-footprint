🌱

EcoTrace

A Carbon Footprint Awareness Platform for India

Product Requirements Document

Challenge 3 — Carbon Footprint Awareness Platform

Built on Google Cloud: Gemini API · Firebase · Vertex AI

Prepared by: Ismail Sayyed

Document Version: 1.0

Date: June 18, 2026

Table of Contents

0. Evaluation Alignment Matrix

This PRD is structured so every evaluation criterion in the challenge brief maps directly onto a section, with the stated impact tier carried through. Reviewers can use this matrix to navigate straight to the evidence for each criterion.

Evaluation Criterion

Tier

Primary PRD Section(s)

Code Quality

High

§7 Engineering Standards · §8 Repository & CI/CD Structure

Security

High

§9 Security & Privacy Architecture

Efficiency

Medium

§10 Performance & Resource Efficiency

Testing

Medium

§11 Test Strategy & Validation Plan

Accessibility

Low

§12 Accessibility & Inclusive Design

1. Executive Summary

EcoTrace is a web-based carbon footprint awareness platform purpose-built for the Indian market. It helps individuals understand, track, and reduce their personal carbon footprint across transport, energy, food, and consumption — using India-specific emission factors, regional grid carbon intensity, and conversational AI guidance rather than generic Western carbon calculators that misrepresent Indian lifestyles (two-wheeler-dominant transport, LPG/biomass cooking, state-wise electricity grid mix, etc.).

The platform is built as a Next.js (App Router) web application — chosen over a native/Flutter approach for faster iteration, SEO-friendly awareness content, zero install friction, and a single codebase that works across desktop and mobile browsers. It is anchored on three Google Cloud building blocks:

Gemini API: Powers the conversational "Carbon Coach," personalized reduction recommendations, and natural-language logging (e.g. "I took an auto-rickshaw to college and ate chicken biryani for lunch" → structured emission entries).

Firebase: Provides Authentication, Firestore (user data, activity logs), Cloud Functions (emission calculation logic, scheduled aggregation), Hosting, and Cloud Storage (utility-bill image uploads).

Vertex AI: Hosts the grounded emission-factor retrieval pipeline and powers batch analytics — clustering users into behavioral cohorts and generating population-level insights for the optional community leaderboard.

The MVP scope targets a single user logging their footprint in under 60 seconds a day, receiving one personalized, actionable nudge per week, and seeing a trend line that visibly responds to behavior change within 2–3 weeks.

2. Problem Statement

2.1 The Core Problem

Individuals want to act on climate change but face three concrete barriers:

Invisibility — carbon emissions from daily choices (commute mode, diet, electricity use) are abstract and unmeasured; people cannot manage what they cannot see.

Generic tooling — most carbon calculators use Western emission factors and lifestyle assumptions (car-centric transport, gas heating) that don't map to Indian realities (two/three-wheelers, LPG cylinders, mixed-fuel grids, regional diets).

No feedback loop — one-time "footprint quizzes" give a static number with no mechanism to track change, no personalized next step, and no reason to return.

2.2 Why Now

India's per-capita emissions are rising with urbanization and consumption growth, and state electricity boards now publish more granular grid-mix data than ever, making accurate, localized carbon accounting newly feasible. Generative AI also makes natural-language activity logging viable for the first time, removing the single biggest adoption barrier for footprint trackers: tedious manual data entry.

2.3 Target Users

Persona

Profile

Primary Need

Climate-Conscious Student

College / early-career, urban India, smartphone-first, budget-constrained

Simple, free, fast logging; gamified motivation

Working Professional (Urban/GCC)

25–40, Pune/Bengaluru/Hyderabad, daily commute, AC use, food delivery habit

Actionable tips framed around cost savings, not just CO2

Eco-Curious Household Lead

Manages household utility bills, cooking fuel, shopping

Passive tracking via bill upload; household-level insight

Sustainability Champion (Campus/Org)

Runs awareness drives at college fests or workplace ESG initiatives

Shareable leaderboards, cohort comparisons, exportable reports

3. Goals & Success Metrics

3.1 Product Goals

Make logging a daily carbon-relevant activity take under 60 seconds.

Return a personalized, India-localized footprint estimate (kg CO2e) within the first session, with no signup wall for the first calculation.

Convert awareness into action via one specific, achievable weekly recommendation per user.

Demonstrate measurable behavior change: a visible downward trend for engaged users over 4+ weeks.

3.2 Success Metrics

Metric

Definition

Target (90 days post-launch)

North Star: Weekly Active Loggers

Users logging ≥3 activities in a 7-day window

40% of registered users

Time-to-First-Insight

Seconds from landing to first footprint estimate shown

< 90 seconds

D7 Retention

Users returning to log within 7 days of signup

≥ 35%

Recommendation Action Rate

% of users marking a suggested action "done"

≥ 25% per week

Avg. Footprint Delta (engaged cohort)

Change in 4-week rolling avg kg CO2e/day, users active 4+ weeks

−8% to −12%

AI Logging Accuracy

% of natural-language entries correctly categorized, no manual fix

≥ 90%

4. Scope

4.1 MVP — In Scope

Email/Google sign-in (Firebase Auth); guest mode for first calculation.

Quick-log activity entry: transport, electricity, cooking fuel, diet, shopping — via structured form AND free-text/voice-to-text parsed by Gemini.

Daily/weekly/monthly carbon dashboard with category breakdown (charts).

India-localized emission factor engine (state-wise grid intensity, vehicle-type factors, diet factors for vegetarian/non-vegetarian/eggetarian patterns).

Gemini-powered "Carbon Coach" chat for Q&A and personalized weekly recommendations.

Utility bill photo upload → Gemini Vision extracts units consumed → auto-logged.

Streaks, badges, and a weekly email/push digest.

Optional anonymized community leaderboard (opt-in, cohort-based, e.g. "college students in Maharashtra").

4.2 Explicitly Out of Scope (MVP)

Carbon offset purchasing/marketplace integration.

Enterprise/ESG reporting for organizations (flagged as Phase 3).

IoT/smart meter direct integration.

Native iOS/Android apps (PWA installability covers the mobile need for MVP).

4.3 Phased Roadmap

Phase

Timeline

Focus

Phase 1 — MVP

Weeks 1–6

Core logging, India emission engine, Gemini coach, dashboard

Phase 2 — Engagement

Weeks 7–10

Bill-photo parsing, leaderboard, push notifications, PWA install

Phase 3 — Scale

Weeks 11+

Org/campus dashboards, offset partner integration, API for third parties

5. Core User Journeys

5.1 First-Time User (Zero to First Insight)

Lands on homepage → clicks "Calculate my footprint" (no login required).

Answers 5 quick-pick questions: city/state, primary commute mode, electricity bill range, diet type, household size.

Gemini API generates a personalized baseline estimate + one comparison line (e.g. "your footprint is 18% below the average for Pune").

Prompted to sign up to save progress and unlock daily logging — value shown before the ask.

5.2 Daily Logger (Returning User)

Opens app → sees a single prominent "Log today" action and yesterday's total.

Types or speaks a free-text entry ("rode my scooter to office, AC on for 6 hours").

Gemini parses this into structured activities, shows them for one-tap confirm/edit, then commits to Firestore via a Cloud Function.

Dashboard updates instantly (optimistic UI) with the new daily total and category split.

5.3 Weekly Reflection

Sunday digest (email + in-app card) summarizes the week's footprint vs. the prior week.

Carbon Coach surfaces one specific, achievable recommendation based on the user's highest-emission category (e.g. "3 of your 5 commutes this week were solo car trips — try carpooling twice next week to cut ~9 kg CO2e").

User can mark the recommendation "committed," and the app checks in the following week.

5.4 Utility Bill Upload

User photographs an electricity bill.

Image uploaded to Cloud Storage; a Cloud Function triggers Gemini Vision to extract billing period and units (kWh) consumed.

Extracted units converted to kg CO2e using the user's state grid emission factor, logged automatically, and shown for user confirmation before being finalized.

6. Feature Specifications

6.1 India-Localized Emission Factor Engine

The single most differentiating piece of the product. Rather than hardcoding global averages, the engine maintains a structured, versioned dataset of Indian emission factors, sourced and cross-checked against public references such as India's Central Electricity Authority (CEA) baseline database for grid emission factors (state- and region-wise), and MoEFCC/ICAT vehicle emission norms for transport factors.

Category

India-Specific Inputs

Example Factor Logic

Transport

Mode (2W/3W/4W/bus/metro/train/flight), fuel type (petrol/diesel/CNG/EV), distance

Auto-rickshaw CNG ≈ 0.05 kg CO2e/km vs. private petrol car ≈ 0.14 kg CO2e/km

Electricity

State (grid emission factor varies ~0.6–0.9 kg CO2e/kWh by state mix), units consumed

Coal-heavy state grids weighted higher than hydro/solar-heavy states

Cooking Fuel

LPG cylinder count/month, PNG, induction/electric, biomass

1 domestic LPG cylinder (14.2 kg) ≈ 42 kg CO2e

Diet

Vegetarian / eggetarian / non-vegetarian / vegan, meal frequency

Non-veg diet factor weighted by India-specific meat-consumption patterns, not US/EU averages

Consumption

Online shopping frequency, fast fashion proxy questions

Category-level proxy factors per delivery/order

Factors are stored in Firestore as a versioned, admin-editable collection (not hardcoded in app logic) so they can be updated as official datasets are revised, with every calculation also storing which factor-set version was used — critical for auditability and for explaining a footprint estimate if a user disputes it.

6.2 Conversational Logging (Gemini API)

Free-text or voice input is sent to Gemini with a structured-output (JSON schema) prompt that extracts one or more discrete activities, each tagged with category, sub-type, quantity/distance, and confidence score. Entries below a confidence threshold are flagged for user confirmation rather than silently auto-logged — this protects data accuracy and gives the user a final say, which also matters for trust and for the Security/Privacy review (no silent writes of inferred personal data).

6.3 Carbon Coach (Gemini-Powered Recommendations)

A grounded chat experience, not a freeform chatbot: prompts are constructed server-side with the user's own recent activity summary plus the emission-factor dataset as context, and Gemini is instructed to recommend only actions backed by the user's actual logged behavior. This avoids generic, ungrounded advice and keeps responses auditable.

6.4 Utility Bill Parsing (Gemini Vision)

Images are processed through Gemini's multimodal input to extract structured billing data. Extraction results are never auto-committed; they populate a pre-filled confirmation form. Original images are deleted from Cloud Storage after a short retention window once the data is confirmed, to minimize stored personal data (see §9).

6.5 Dashboard & Visualization

Daily/weekly/monthly toggle, category-wise stacked bar chart, trend line vs. personal baseline.

Peer comparison shown as an anonymized percentile band, never as an individual-to-individual comparison.

Exportable summary (PDF) for users who want to share progress, e.g. for a campus sustainability club.

6.6 Gamification

Streaks for consecutive logging days (not for low emissions — to avoid penalizing users with legitimately high-emission constraints like long medical commutes).

Badges tied to specific verified actions (e.g. "Logged 4 weeks straight," "Completed 3 coach recommendations"), not to absolute footprint rank, to keep the experience encouraging rather than shaming.

7. Engineering Standards

Evaluation Focus: Code Quality — HIGH IMPACT

7.1 Tech Stack

Layer

Technology

Rationale

Frontend

Next.js 15 (App Router) + TypeScript

File-based routing, server components for fast first paint, SEO-friendly awareness pages, single codebase for web + installable PWA

Styling/UI

Tailwind CSS + shadcn/ui

Consistent design tokens, accessible primitives out of the box (Radix-based), fast iteration

State/Data

React Server Components + TanStack Query (client cache)

Minimizes client JS, predictable cache invalidation for dashboard data

Auth

Firebase Authentication (Email/Password + Google OAuth)

Battle-tested, handles token refresh/session security, free tier sufficient for MVP scale

Database

Cloud Firestore

Real-time listeners for live dashboard updates, flexible schema for evolving activity types, scales without ops overhead

Backend logic

Firebase Cloud Functions (Node.js/TypeScript, 2nd gen on Cloud Run)

Serverless emission calculations, scheduled weekly digest jobs, Gemini API calls kept server-side (never exposed to client)

File storage

Cloud Storage for Firebase

Utility bill images, signed URLs, lifecycle rules for auto-deletion

Conversational AI

Gemini API (gemini-2.5-flash for chat/parsing, vision input for bill OCR)

Structured-output JSON mode for reliable parsing; multimodal input for bill images

ML/Analytics

Vertex AI (Vertex AI Search/grounding for emission-factor retrieval; BigQuery ML or Vertex AI for cohort clustering)

Keeps heavy batch analytics off the request path; grounding reduces hallucinated emission claims

Hosting/CDN

Firebase Hosting (Next.js-aware) or Cloud Run for SSR

Native Next.js SSR support, global CDN, automatic HTTPS

Monitoring

Firebase Performance Monitoring + Cloud Logging/Error Reporting

Real user monitoring without a third-party APM bill

7.2 Repository Conventions

Monorepo layout: /app (Next.js routes), /components, /lib (emission calc, Gemini client wrappers), /functions (Cloud Functions source), /types (shared TypeScript interfaces), /tests.

Strict TypeScript ("strict": true) across frontend and Cloud Functions — no implicit any, shared types between client and functions via a /types package to prevent payload drift.

ESLint (next/core-web-vitals + typescript-eslint) and Prettier enforced via pre-commit hook (Husky + lint-staged); CI fails the build on lint errors, not just warnings.

Conventional Commits (feat:, fix:, chore:) to keep history readable and enable automated changelog generation.

All emission-factor constants and category enums centralized in /lib/constants — no magic numbers scattered through components.

Component structure follows a clear separation: presentational components (no data fetching) vs. container components (data fetching, kept thin) vs. server actions (mutations).

7.3 Code Review & Documentation

Every PR requires at least one review; PR template includes a checklist for tests added, types updated, and accessibility checked for UI changes.

Each Cloud Function has a docstring header stating its trigger type, expected payload shape, and idempotency guarantees (important since Firestore triggers can retry).

A living ARCHITECTURE.md documents the emission-calculation pipeline and the Gemini prompt contracts, so the calculation logic is auditable by non-authors — directly supporting maintainability.

8. Repository & CI/CD Structure

8.1 Repository Layout

ecotrace/

├── app/ # Next.js App Router pages

│ ├── (marketing)/ # Public awareness pages (SEO)

│ ├── (app)/ # Authenticated dashboard, logging, coach

│ └── api/ # Route handlers (webhooks only; logic lives in Cloud Functions)

├── components/ # Presentational + shared UI

├── lib/

│ ├── emissions/ # Emission factor engine, calculators

│ ├── gemini/ # Gemini client wrappers, prompt templates

│ └── firebase/ # Firebase client + admin SDK init

├── functions/ # Cloud Functions (TypeScript)

│ ├── src/calculateFootprint.ts

│ ├── src/parseActivityText.ts

│ ├── src/parseUtilityBill.ts

│ └── src/weeklyDigest.ts # Scheduled function

├── types/ # Shared TypeScript interfaces

├── tests/ # Unit + integration tests

├── e2e/ # Playwright end-to-end tests

└── .github/workflows/ # CI/CD pipelines

8.2 CI/CD Pipeline (GitHub Actions)

Lint & Type Check — ESLint + tsc --noEmit on every push and PR.

Unit & Integration Tests — Jest for /lib and /functions logic; fails the pipeline below 80% coverage on the emission-calculation module specifically (the most correctness-critical code path).

Build — next build to catch SSR/type errors before deploy.

E2E Smoke Tests — Playwright runs the core "log an activity → see dashboard update" flow against a preview deployment.

Preview Deploy — Firebase Hosting preview channels for every PR, giving reviewers a live URL.

Production Deploy — merge to main triggers deploy to Firebase Hosting + Cloud Functions, gated on all prior steps passing.

Secrets (Gemini API key, Firebase service account) are stored in GitHub Actions encrypted secrets and injected at build/deploy time — never committed to the repository (see §9.1).

9. Security & Privacy Architecture

Evaluation Focus: Security — HIGH IMPACT

9.1 Secrets & Credential Management

Gemini API key and Firebase Admin service account credentials are never bundled into client-side code; all Gemini calls are proxied through Cloud Functions, which hold the key server-side only.

Secrets are stored in Google Secret Manager (referenced by Cloud Functions at runtime) and in GitHub Actions encrypted secrets for CI — not in .env files committed to the repo. A committed .env.example documents required variable names with placeholder values only.

Firebase client config (apiKey, projectId, etc.) is safe for client exposure by design (it is not a secret), but Firestore Security Rules — not the client SDK — are the actual access-control boundary.

9.2 Firestore Security Rules

Every collection has explicit, deny-by-default rules. Representative pattern for user activity logs:

match /users/{userId}/activities/{activityId} {

allow read: if request.auth != null && request.auth.uid == userId;

allow create: if request.auth != null && request.auth.uid == userId

                && request.resource.data.keys().hasOnly([...allowedFields])

                && request.resource.data.co2eKg is number;

allow update, delete: if request.auth != null && request.auth.uid == userId;

}

// Emission factor reference data: public read, admin-only write

match /emissionFactors/{docId} {

allow read: if true;

allow write: if false; // only Cloud Functions with Admin SDK can write

}

Cohort/leaderboard documents store only aggregated, anonymized values (cohort key + bucketed footprint range) — never a direct join back to a user document — enforced by writing leaderboard entries exclusively from a trusted Cloud Function, with no client write path at all.

9.3 Data Privacy & Minimization

Personally identifying free-text (e.g. names mentioned in a logged note) is never sent to Gemini without first being passed through a lightweight redaction step for obvious PII patterns before being included in any prompt context.

Utility bill images are stored in Cloud Storage with a short (e.g. 7-day) lifecycle rule that auto-deletes the original image after the extracted data is confirmed by the user — only the structured numeric result is retained long-term.

Users can export or permanently delete their account and all associated activity data in one action (data portability and right-to-erasure by design), implemented as a Cloud Function that cascades deletes across Firestore and Cloud Storage.

Location data is collected at city/state granularity only (for grid emission-factor lookup), never precise GPS coordinates.

A clear, plain-language privacy notice is shown at signup explaining exactly what is logged, that activity text may be processed by an AI model, and how long bill images are retained.

9.4 Application-Layer Security

All Cloud Functions validate and sanitize input server-side (never trust client-supplied co2eKg values directly — the server recomputes emissions from raw activity data using the authoritative factor table, the client-sent estimate is advisory only).

Rate limiting on Gemini-backed endpoints (per-user request quotas via Firestore-tracked counters) to prevent abuse and control API cost exposure.

Content Security Policy headers configured in next.config.js to restrict script sources; Firebase App Check enabled to ensure API requests originate from the genuine app, not scripted abuse.

Dependency scanning via GitHub Dependabot and npm audit as a required CI step; no known critical/high vulnerabilities allowed in production dependencies at merge time.

Standard transport security: HTTPS enforced everywhere via Firebase Hosting defaults; no mixed content.

9.5 AI-Specific Safety Considerations

Gemini prompts for the Carbon Coach are grounded in the user's own stored data and the structured emission-factor dataset, with explicit system instructions to decline giving advice outside the carbon/sustainability domain and to avoid fabricating numeric claims not traceable to the factor table.

All AI-extracted data (parsed activities, bill OCR results) is shown to the user for confirmation before being persisted — the AI never has unilateral write access to a user's footprint record.

10. Performance & Resource Efficiency

Evaluation Focus: Efficiency — MEDIUM IMPACT

10.1 Frontend Performance

React Server Components by default; client components only where interactivity is required (charts, forms, chat) — minimizes shipped JavaScript.

Next.js Image component with automatic AVIF/WebP and responsive sizing for all illustrative imagery.

Route-level code splitting is automatic via the App Router; heavy chart libraries are dynamically imported (next/dynamic) only on dashboard routes, not the marketing pages.

Target Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1, validated in CI via Lighthouse CI on every PR preview deploy.

10.2 Database & Query Efficiency

Firestore data modeled to avoid N+1 reads: daily/weekly/monthly aggregates are pre-computed and stored as denormalized summary documents (written by a Cloud Function on each new activity log) rather than recalculated client-side from the full activity history on every dashboard load.

Composite indexes defined explicitly for all compound queries (e.g. user + date range) to avoid Firestore's default single-field index limitations causing slow or failed queries.

Pagination (cursor-based, using startAfter) for activity history views — never loading a user's entire log history at once.

10.3 AI/Compute Cost Efficiency

Gemini Flash tier is used for routine parsing and chat (lower latency and cost than Pro-tier models) since the structured-extraction and recommendation tasks don't require frontier-model reasoning depth.

Prompt context is kept minimal and targeted: only the relevant slice of a user's recent activity (e.g. last 7 days) is included, not their full history, to control token usage and latency.

Responses use Gemini's structured output (JSON schema) mode rather than free-form text + a second parsing pass, cutting one full round-trip per interaction.

Heavy analytical workloads (cohort clustering for the leaderboard) run as a scheduled Vertex AI batch job (e.g. nightly) rather than on the user-facing request path, keeping interactive latency unaffected by analytics cost.

Cloud Functions are configured with appropriately small memory allocations and minInstances: 0 for low-traffic endpoints to avoid idle billing, while the weekly-digest and bill-parsing functions get slightly higher memory for faster cold-start-sensitive execution.

10.4 Caching Strategy

Data

Cache Layer

TTL / Invalidation

Emission factor reference table

Next.js fetch cache / CDN edge

Revalidated on admin update (on-demand revalidation), not time-based

User's own dashboard summary

TanStack Query client cache + Firestore real-time listener

Invalidated instantly on new write via listener

Static marketing/awareness pages

Firebase Hosting CDN (static generation)

Rebuilt on deploy

Leaderboard cohort aggregates

Pre-computed Firestore doc, refreshed by scheduled function

Recomputed nightly, not per-request

11. Test Strategy & Validation Plan

Evaluation Focus: Testing — MEDIUM IMPACT

11.1 Test Pyramid

Layer

Tooling

Coverage Focus

Unit tests

Jest + ts-jest

Emission calculation functions (every category, edge cases like zero/negative input), Gemini response-parsing/validation logic, utility functions

Integration tests

Jest + Firebase Emulator Suite

Cloud Functions against emulated Firestore/Auth/Storage — e.g. logging an activity correctly updates daily, weekly, and monthly aggregate documents

Component tests

React Testing Library

Form validation, chart rendering with mock data, confirmation-before-save flows for AI-parsed entries

End-to-end tests

Playwright

Full user journeys: signup → first calculation, daily log → dashboard update, bill upload → confirm → log

Security rules tests

@firebase/rules-unit-testing

Verifies a user cannot read/write another user's activities; verifies leaderboard documents reject client writes

11.2 Emission Calculation Correctness — Special Focus

Because the calculation engine is the core trust mechanism of the product, it receives dedicated test rigor beyond standard unit testing:

Golden-file tests: a fixed set of input activities with hand-verified expected kg CO2e outputs, checked on every CI run so a refactor can never silently change calculation results without an explicit, reviewed update to the golden file.

Property-based tests (fast-check) to confirm invariants hold across random inputs — e.g. emissions are always non-negative, and total footprint always equals the sum of category subtotals.

Snapshot comparison against the previous emission-factor dataset version when factors are updated, so admins can see the magnitude of impact before publishing a factor update.

11.3 AI Output Validation

Gemini's structured-output responses are validated against a strict Zod schema server-side before being shown to the user; malformed or out-of-schema responses are rejected and the user is shown a manual-entry fallback rather than a broken state.

A labeled evaluation set of ~150 realistic free-text logging phrases (covering Hinglish phrasing, regional transport terms like "rickshaw"/"auto"/"share-auto") is used to track parsing accuracy over time as prompts are iterated, directly informing the AI Logging Accuracy success metric in §3.2.

11.4 Manual & Pre-Launch QA

Cross-browser smoke test (Chrome, Safari, Firefox, mobile Chrome/Safari) before each release.

A dedicated accessibility pass using axe-core automated scanning plus manual keyboard-only and screen-reader walkthroughs before each major release (see §12).

Staged rollout via Firebase Remote Config feature flags for any feature touching the calculation engine, allowing instant rollback without a redeploy if an issue is found post-launch.

12. Accessibility & Inclusive Design

Evaluation Focus: Accessibility — LOW IMPACT (polish layer, required for a perfect score)

12.1 Standards Target

WCAG 2.2 Level AA is the baseline target across all user-facing screens, verified via automated axe-core scans in CI plus a manual review pass before each release (see §11.4).

12.2 Concrete Commitments

Full keyboard navigability: every interactive element (log form, chat input, chart toggles, dashboard filters) reachable and operable via keyboard alone, with visible focus states (shadcn/ui's Radix-based primitives provide this by default, verified rather than assumed).

Semantic HTML and ARIA labeling for chart data — each chart ships with an accessible data-table fallback so screen-reader users get the same information as sighted users, not just a described image.

Color is never the sole signal: category breakdowns and trend indicators (up/down) pair color with icons and text labels, supporting color-blind users.

Minimum 4.5:1 contrast ratio enforced via design tokens in the Tailwind config, checked automatically in the component test suite.

All form inputs have explicit, programmatically associated labels (not placeholder-only labels), with clear inline error messaging announced to assistive tech via aria-live regions.

Voice/free-text logging input is itself an accessibility feature for users with motor difficulties typing structured forms, and a text alternative is always available for users who cannot or prefer not to use voice.

12.3 Language & Literacy Inclusivity

Free-text logging is designed to tolerate Hinglish and common regional phrasing ("share-auto," "shared cab") rather than requiring precise English — directly serving lower-English-literacy users, who are otherwise excluded by most existing carbon calculators.

UI copy is written in plain language at roughly a Grade 6–7 reading level, avoiding climate-science jargon (e.g. "kg CO2e" is always paired with a relatable comparison, like "= driving 40 km in a petrol car").

Hindi and Marathi localization is planned for Phase 2 (i18n scaffolding with next-intl is included from MVP to make this a content task, not a re-architecture, when prioritized).

12.4 Device & Connectivity Inclusivity

PWA installability with offline activity logging (queued via a service worker and synced to Firestore when connectivity returns) — important given variable mobile connectivity in tier-2/3 Indian cities.

Performance budgets (§10.1) are partly an accessibility commitment: a fast, low-data-usage app is more usable on budget Android devices and constrained data plans, which describes a large share of the target student persona.

13. Data Model Overview

Representative Firestore collection structure (simplified):

users/{userId}

profile: { city, state, dietType, householdSize, createdAt }

activities/{activityId}

    { category, subType, quantity, unit, co2eKg, source: 'manual'|'ai_parsed'|'bill_ocr', factorVersion, loggedAt }

dailySummaries/{date}

    { totalCo2eKg, byCategory: {...}, factorVersion }

weeklySummaries/{weekId}

    { totalCo2eKg, deltaFromPriorWeek, topCategory }

emissionFactors/{factorSetVersion}

{ transport: {...}, electricity: { byState: {...} }, cookingFuel: {...}, diet: {...}, effectiveFrom }

cohortLeaderboard/{cohortKey}

{ bucketedAverages: [...], memberCountApprox, lastComputedAt } // write-only via Cloud Function

14. Risks & Mitigations

Risk

Likelihood/Impact

Mitigation

Inaccurate AI-parsed activities erode trust

Medium / High

Confidence threshold + mandatory user confirmation before any AI-derived entry is saved (§6.2, §9.5)

Emission factor data becomes outdated

Medium / Medium

Versioned, admin-editable factor collection with effective-date tracking, not hardcoded constants (§6.1)

Gemini API cost scales faster than revenue

Medium / Medium

Flash-tier model, minimal prompt context, structured output, per-user rate limits (§10.3)

Low retention after initial novelty

High / High

Weekly digest + specific, achievable recommendations (not generic tips) to keep the loop valuable, not just informative (§3.2, §6.3)

Leaderboard enables unhealthy comparison/shaming

Low / Medium

Cohort-level anonymized comparison only, streaks tied to consistency not absolute footprint rank (§6.6)

Privacy concerns over AI processing personal habit data

Medium / High

PII redaction before prompts, transparent privacy notice, full data export/delete, minimal retention of raw images (§9.3)

15. Implementation Timeline (6-Week MVP)

Week

Milestone

1

Project scaffolding (Next.js + TS + Tailwind), Firebase project setup, Auth flow, Firestore schema + security rules v1

2

Emission factor engine + admin-editable dataset; manual structured-form logging end-to-end

3

Gemini integration: free-text parsing with confirmation flow; dashboard charts (daily/weekly/monthly)

4

Carbon Coach chat + weekly recommendation generation; weekly digest scheduled function

5

Utility bill upload + Gemini Vision parsing; PWA/offline support; gamification (streaks, badges)

6

Accessibility pass, security rules testing, E2E test suite, performance tuning, soft launch

16. Appendix

16.1 Glossary

kg CO2e: Kilograms of CO2-equivalent — the standard unit for expressing the combined warming impact of different greenhouse gases on a common scale.

Grid emission factor: The average kg of CO2e emitted per kWh of electricity generated on a given grid, which varies by state in India depending on the coal/hydro/solar/nuclear generation mix.

Grounding: Constraining an AI model's output to reference a specific, verifiable dataset (here, the emission-factor table) rather than relying purely on the model's internal, unverifiable knowledge.

16.2 Open Questions for Stakeholder Input

Should Phase 2's campus/org leaderboard expose any opt-in identity at all (e.g. team name), or remain fully anonymized even at the cohort level?

Is a partnership with a verified carbon-offset provider (Phase 3) in scope for this challenge's evaluation, or should it remain a stated future direction only?

What's the preferred source of truth to cite for state-wise grid emission factors at launch — CEA's published baseline database is the most authoritative public option and should be confirmed before the factor table is finalized.

16.3 Document Control

Version

Date

Change

1.0

June 18, 2026

Initial PRD — Next.js + Gemini API + Firebase + Vertex AI architecture, full evaluation-matrix alignment
