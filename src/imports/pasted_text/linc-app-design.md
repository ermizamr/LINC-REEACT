# 🎨 FIGMA AI DESIGN PROMPT: LINC Mobile App (Flutter)



## 📌 Project Overview & Brand Identity

- **App Name:** LINC (Life Infrastructure Network)

- **Tagline:** Need → Understand → Match → Connect → Solve

- **Core Concept:** A clean, trustworthy "Social Network for Work & Everyday Services". Instead of browsing dozens of confusing directories, users describe what they need in natural language or interact with an intelligent RAG-driven AI to find nearby verified individual providers, businesses, or organizations.

- **Platform:** Cross-platform Mobile App (Flutter — iOS & Android layout standards).



---



## 🎨 Visual Design System & Aesthetics Guidelines



### 1. Aesthetic Direction

- **Tone:** Premium, modern, calm, trustworthy, and distraction-free (comfortable for long sessions).

- **Design Philosophy:** Clean whitespace, soft rounded corners (12px–18px), subtle hairline borders (`1px solid rgba(0,0,0,0.06)` or dark mode equivalent), subtle depth with soft layered blurs and elevation, ergonomic bottom-heavy layouts (thumb-friendly for Flutter).



### 2. Color Palette (Sophisticated & Balanced)

- **Primary / Brand:** Deep Midnight Slate (`#0F172A`) & Crisp Royal Indigo (`#4338CA` / `#4F46E5`)

- **Accent / Intelligence:** Electric Cyan / Mint (`#06B6D4` / `#10B981`) — used sparingly for AI tags, match percentages, and interactive highlights.

- **Verification / Trust:** Warm Amber Gold (`#F59E0B`) — for verified badges, top-rated badges, and star ratings.

- **Background & Surfaces 

  - App Background: Soft Crisp Off-White (`#F8FAFC`)

  - Card Surfaces: Pure White (`#FFFFFF`)

  - Subtle Dividers: Light Slate (`#E2E8F0`)



  - Primary Text: Deep Charcoal (`#0F172A` / `#F8FAFC`)

  - Secondary Text: Slate Gray (`#64748B` / `#94A3B8`)

  - Muted / Placeholder: Cool Gray (`#94A3B8` / `#64748B`)



### 3. Typography (Modern Sans-Serif)

- **Font Family:** Inter or Plus Jakarta Sans

- **Hierarchy:**

  - Display / Hero: 26pt–30pt Bold

  - Screen Titles: 20pt–22pt SemiBold

  - Section Headers: 16pt–18pt SemiBold

  - Body Text: 14pt Regular / Medium (1.5 line height for maximum legibility)

  - Captions / Badges: 11pt–12pt Medium / SemiBold (Uppercase tracking for badges)



---



## 📱 Core Architecture & Key App Screens



### 1. Unified Identity & Dual-Mode Header (Crucial UX Decision)

> Users do NOT create separate accounts to provide services. The app allows instantaneous switching between **Client Mode** (finding & requesting help) and **Provider/Business Dashboard** (managing listings, jobs, earnings).

- **Global Header Component:** Shows user avatar, location selector (`Addis Ababa, ET ▾`), notification bell with unread dot, and a slick **Mode Toggle Pill** (`👤 Client` ⇄ `💼 Provider`).



---



### 2. Screen Breakdown & Specifications



#### 🏠 Screen 1: Home / Discovery Hub (Client Mode)

- **Top Search Section:** Prominent AI-powered natural language search bar: *"Describe what you need (e.g. 'plumber near Bole', 'laptop screen fix')..."* with an embedded glowing **AI Sparkle** button.

- **Urgent / AI Prompts Carousel:** Quick suggestion chips (*"Emergency Repair"*, *"House Cleaning"*, *"Tutor"*, *"IT Support"*).

- **Category Grid:** Clean modern 2-row icon grid with subtle soft-tinted backgrounds for each category.

- **Featured / Top Verified Providers:** Horizontal cards displaying:

  - Avatar + Name + Headline

  - ⭐ Rating (e.g. `4.9 (42 reviews)`)

  - 🛡️ Gold Verified Badge

  - Distance chip (`📍 1.8 km away`)

  - Starting Price (`From 300 ETB/hr`)

- **Recent Requests / Community Activity Feed:** Minimalist cards showing open community requests where providers can submit offers.



---



#### 🤖 Screen 2: LINC AI Assistant & Matching Hub

- **Interface:** Conversational, clean chat interface pinned in the bottom nav.

- **Input Field:** Audio voice-note icon + Text input + Attachment button.

- **AI Response Bubble:** Explains the extracted requirements (Category, Budget, Urgency, Distance) with matching provider cards embedded directly in the message flow.

- **Provider Match Card inside Chat:** 

  - Match Score Ring (e.g., `96% Match`)

  - Provider profile snippet

  - Breakdown: *"High Rating + Within 3km + Fits 500 ETB Budget"*

  - Direct Action buttons: `[ Book Service ]` and `[ Open DM ]`.



---



#### 💬 Screen 3: Direct Messaging with Embedded "@AI" Trust Advisor

- **Header:** Provider Name, Status (`Online`), Verified Seal, Call/Video button.

- **Message List:** Standard clean chat bubbles (Requester in Royal Indigo, Provider in Soft Gray).

- **Embedded Trust Feature (@AI):**

  - When user types `@AI is this provider trustworthy?` or taps a quick `@AI Trust Insight` prompt:

  - An exclusive, private, glassmorphic **"AI Trust Advisor (Only visible to you)"** card appears inline.

  - Summarizes: 98% on-time completion, 0 reports, avg response 5 mins, fair market rate comparison.



---



#### 📋 Screen 4: Service Listing & Provider Profile Page

- **Hero:** Provider/Business cover image & avatar, verified badge, response time badge.

- **Stats Bar:** 3 clean stat blocks: ⭐ `4.9/5 Rating` | 💼 `85 Jobs Done` | 📍 `2.4 km`.

- **Services Offered:** Accordion/Card list with service title, tags, delivery time, price pill (`500 ETB Fixed` or `250 ETB/hr`).

- **Reviews & Proof of Work Gallery:** Photo carousel of past work + client review cards with verified booking tags.

- **Floating Bottom Bar:** `[ Message Provider ]` (Secondary button) + `[ Book Now ]` (Primary indigo button).



---



#### 📅 Screen 5: Bookings & Schedule Management

- **Segmented Tabs:** `Active (2)` | `Upcoming` | `Completed` | `Cancelled`.

- **Booking Card:**

  - Status Pill: `Pending Provider Approval` (Amber) / `Confirmed` (Teal) / `In Progress` (Indigo).

  - Service title, Provider name & thumbnail, Date & Time slot.

  - Agreed Price & Payment Status (`Cash on Delivery` / `Escrow`).

  - Quick Actions: `[ Reschedule ]`, `[ View Location ]`, `[ Chat ]`.



---



#### 🏢 Screen 6: Business & Organization Hub (Separate Entity)

- **Business Profile:** Company Logo, Banner, Business Type Tag (`Agency`, `LLC`, `NGO`).

- **Team Members Section:** List of registered staff / verified workers under this business.

- **Multiple Service Packages:** Multi-tier service offerings with business verification badge.



---



#### 🛡️ Screen 7: Trust & Verification Center

- **Status Tracker:** 3-step progress bar (`Documents Submitted` → `Under Review` → `Verified`).

- **Upload Form:** ID card / Business License upload with camera preview, document checklist, and privacy seal notice.



---



#### 📊 Screen 8: Provider Dashboard (When Toggled to Provider Mode)

- **Revenue / Metrics Overview:** Total Earnings, Active Jobs, Profile Views, Match Score.

- **Incoming Job Requests:** Cards with `Accept (15 mins left)` or `Decline`.

- **Availability Toggle:** Smooth Switch for `🟢 Available for Instant Booking` / `🔴 Busy`.



---



## 🛠️ Flutter UI Component Guidelines

- **Bottom Navigation Bar:** Floating modern pill bar with 5 items: `Home`, `Explore/Categories`, `AI Assistant (Centered glowing icon)`, `Messages`, `Profile`.

- **Modals & Bottom Sheets:** Smooth drag-to-dismiss bottom sheets for quick bookings, filters, and AI insights.

- **States & Micro-interactions:**

  - Skeleton loading states (no ugly spinners).

  - Subtle haptic feedback indicator states.

  - Badges with soft opacity backgrounds (e.g. `bg-emerald-50 text-emerald-700`).



---



## 🎯 Deliverables Required from Figma

1. **Design System:** Complete Color Styles (Light & Dark), Typography Tokens, Buttons, Inputs, Badges, and Elevation Shadows.

2. **Key Screen Wireframes & High-Fidelity Mockups** for the 8 screens detailed above.

3. **Interactive Components:** Dual-mode switcher toggle, `@AI` inline message bubble, and provider match card with match % ring.