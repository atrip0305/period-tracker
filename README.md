# CycleSync

### Privacy-conscious menstrual cycle tracking with uncertainty-aware predictions

CycleSync is a full-stack menstrual cycle tracking application designed to help users record period data, understand cycle patterns, and receive **probabilistic estimates** for upcoming periods and cycle phases.

Instead of treating menstrual cycles as perfectly regular or presenting predictions as exact medical facts, CycleSync explicitly models **cycle variability, incomplete logs, and prediction confidence**.

---

## The Problem

Most period trackers appear simple from the outside:

> Record the last period → add a fixed number of days → predict the next one.

Real menstrual cycle data is rarely that clean.

Cycle lengths can vary from month to month, users may forget to log certain days, spotting should not necessarily be interpreted as menstruation, and predictions become less reliable when very little historical data is available.

There is also a privacy consideration: menstrual-cycle data is sensitive personal information, yet many tracking applications depend heavily on accounts, cloud storage, analytics, or external services.

CycleSync explores a different approach:

* distinguish **observed data** from **predicted data**
* model predictions as **windows rather than exact dates**
* degrade confidence when historical data is sparse or inconsistent
* handle missing and irregular logs explicitly
* maintain a clear boundary around client-side persistence
* keep the prediction engine deterministic and testable

---

## Solution

CycleSync converts daily flow logs into progressively higher-level cycle information:

```text
Daily Flow Logs
       │
       ▼
Period Detection
       │
       ▼
Cycle Reconstruction
       │
       ▼
Cycle Statistics
       │
       ├── Average cycle length
       ├── Cycle variability
       └── Prediction confidence
       │
       ▼
Prediction Engine
       │
       ├── Next period window
       ├── Estimated ovulation window
       └── Current cycle phase
       │
       ▼
Calendar Representation
```

The application deliberately separates **facts** from **inferences**.

A day explicitly logged by the user is factual data. Period boundaries, cycle phases, ovulation windows, and future period dates are derived estimates whose confidence depends on the available history.

---

## Key Features

### Cycle Logging

Users can record daily menstrual information including:

* light flow
* medium flow
* heavy flow
* spotting
* optional notes

The backend validates incoming logs and prevents inconsistent states such as future-date entries or incompatible period/spotting combinations.

### Intelligent Period Detection

CycleSync does not simply assume that every bleeding entry represents a complete period.

The detection engine:

* groups consecutive menstrual-flow logs
* distinguishes spotting from menstrual flow
* rejects isolated single-day bleeding as a detected period
* tolerates limited missing data
* flags periods reconstructed across missing days
* closes periods when missing-data gaps exceed the configured threshold

This produces cleaner cycle histories before predictions are calculated.

### Cycle Reconstruction

Detected periods are transformed into menstrual cycles using the interval between consecutive period start dates.

```text
Period 1 Start ──────────────► Period 2 Start
                 Cycle Length
```

This allows CycleSync to learn from actual historical behaviour rather than assuming a universal cycle length.

### Variability-Aware Predictions

Instead of returning one supposedly exact next-period date, CycleSync calculates:

```text
Expected Date
     │
 ┌───┴───┐
Earliest Latest
```

The prediction window expands based on observed cycle variability.

At minimum, CycleSync provides a small uncertainty window rather than implying false precision.

### Confidence Scoring

Prediction confidence is reduced when:

* too few historical cycles are available
* cycle lengths vary substantially
* the available data is insufficient for a reliable estimate

The prediction engine therefore communicates not only **what it predicts**, but also **how much confidence should be placed in that prediction**.

### Cycle Phase Estimation

CycleSync can derive the user's estimated current phase:

```text
MENSTRUAL
FOLLICULAR
OVULATION_WINDOW
LUTEAL
```

Ovulation is represented as a **probability window**, not a guaranteed date.

For low-confidence data, the estimated window is widened.

### Irregular-Cycle Handling

The prediction logic contains explicit safeguards for unusual or highly irregular cycle histories.

Rather than producing increasingly precise-looking but unreliable predictions, CycleSync can reduce confidence, suppress certain estimates, and expose warning flags.

### Layered Calendar

Calendar data can represent multiple types of information simultaneously:

* factual menstrual logs
* predicted ovulation windows
* current cycle phase
* prediction confidence
* conflict/warning flags
* today's date

This separation allows the UI to visually distinguish recorded information from inferred information.

### Privacy-Oriented Local Storage

The frontend includes a dedicated storage boundary built around **IndexedDB**.

Persistence is abstracted behind a storage interface so UI and domain logic do not directly access browser persistence APIs.

The local storage layer is designed around:

* device-owned data
* no analytics
* no telemetry
* no background synchronisation
* no account requirement
* explicit deletion
* no direct IndexedDB access outside the storage module

> **Development note:** CycleSync currently contains both the local IndexedDB persistence layer and backend-backed daily-log functionality while the architecture is being integrated. The long-term design favours a privacy-first local data boundary.

---

# Tech Stack

| Layer             | Technology                          |
| ----------------- | ----------------------------------- |
| Language          | TypeScript                          |
| Frontend          | React 19                            |
| Build Tool        | Vite                                |
| Styling           | Tailwind CSS                        |
| Local Persistence | IndexedDB + `idb`                   |
| Backend           | NestJS 11                           |
| ORM               | Prisma                              |
| Backend Database  | SQLite                              |
| Validation        | class-validator / class-transformer |
| Testing           | Jest                                |
| API Testing       | Supertest                           |
| Code Quality      | ESLint + Prettier                   |

---

# Architecture

CycleSync follows a modular full-stack architecture.

```text
cycle-sync/
│
├── apps/
│   │
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   └── calendar/
│   │   │   │
│   │   │   ├── features/
│   │   │   │   └── daily-log/
│   │   │   │
│   │   │   ├── storage/
│   │   │   │   ├── index.ts
│   │   │   │   ├── localStore.ts
│   │   │   │   └── types.ts
│   │   │   │
│   │   │   └── types/
│   │   │
│   │   └── package.json
│   │
│   └── backend/
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       │
│       └── src/
│           ├── modules/
│           │   ├── health/
│           │   ├── logs/
│           │   └── prediction/
│           │       ├── calendar/
│           │       ├── domain/
│           │       ├── logic/
│           │       └── __tests__/
│           │
│           ├── prisma/
│           └── day-log/
│
└── tsconfig.base.json
```

The prediction engine is intentionally isolated from the UI so its behaviour can be tested independently.

---

# Prediction Pipeline

The core prediction workflow is composed of several deterministic transformations.

## 1. Extract periods

```text
Daily Logs
    │
    ▼
extractDetectedPeriods()
    │
    ▼
DetectedPeriod[]
```

Menstrual flow levels are used to identify period boundaries while spotting and missing data are handled separately.

---

## 2. Derive cycles

```text
DetectedPeriod[]
       │
       ▼
deriveCycles()
       │
       ▼
DetectedCycle[]
```

Cycle length is calculated from one period start date to the next.

---

## 3. Calculate cycle statistics

The most recent cycles are used to estimate:

```text
averageCycleLength
variabilityDays
confidence
```

Using recent history prevents very old cycle information from dominating current predictions.

---

## 4. Predict the next period

The expected next start date is calculated from:

```text
lastPeriodStart + averageCycleLength
```

The application then generates an uncertainty interval:

```text
earliest ← expected → latest
```

where the width depends on historical variability.

---

## 5. Estimate cycle phase

CycleSync combines:

```text
Last detected period
        +
Average cycle length
        +
Prediction confidence
        +
Current date
```

to derive the estimated menstrual phase and ovulation window.

These estimates are deliberately presented as probabilities rather than medical certainties.

---

# Prediction Philosophy

CycleSync follows a simple principle:

> **Predictions should communicate uncertainty rather than hide it.**

For example, suppose recent cycles are:

```text
28 days
30 days
29 days
```

CycleSync calculates an average cycle length of approximately:

```text
29 days
```

It then measures the variation between those cycles.

Rather than displaying:

```text
Your next period will start on January 29.
```

the system represents the result as something closer to:

```text
Expected: January 29
Possible window: January 27 – January 31
Confidence: High
```

As variability increases, the prediction window and confidence adjust accordingly.

---

# Privacy Architecture

CycleSync's frontend storage module establishes a deliberate persistence boundary:

```text
React UI
   │
   ▼
Storage Interface
   │
   ▼
IndexedDB Adapter
   │
   ▼
Browser IndexedDB
```

Components should never interact directly with IndexedDB.

Instead:

```ts
storage.getAllPeriodLogs()
storage.savePeriodLog(...)
storage.deletePeriodLog(...)
storage.clearAll()
```

form the public persistence API.

This keeps storage implementation details separate from application and domain logic.

---

# Getting Started

## Prerequisites

Install:

* Node.js 20+ recommended
* npm
* Git

No external database server is required for the current backend because it uses SQLite through Prisma.

---

## 1. Clone the repository

```bash
git clone https://github.com/atrip0305/period-tracker
cd atrip0305-period-tracker
```

---

## 2. Set up the backend

Navigate to the backend:

```bash
cd apps/backend
```

Install dependencies:

```bash
npm install
```

Create:

```text
apps/backend/.env
```

and add:

```env
DATABASE_URL="file:./dev.db"
```

Generate the Prisma client:

```bash
npx prisma generate
```

Apply the existing database migrations:

```bash
npx prisma migrate deploy
```

For local development where you want Prisma to manage development migrations, you can instead use:

```bash
npx prisma migrate dev
```

Start the backend:

```bash
npm run start:dev
```

The NestJS server runs on:

```text
http://localhost:3000
```

Check the health endpoint:

```text
GET /health
```

A successful response should return:

```json
{
  "status": "ok"
}
```

---

## 3. Set up the frontend

Open another terminal:

```bash
cd apps/frontend
```

Install dependencies:

```bash
npm install
```

Start Vite:

```bash
npm run dev
```

Vite will print the local development URL, typically:

```text
http://localhost:5173
```

Open it in your browser.

---

## Development Configuration Note

The current daily-log hook contains a development API address.

If you are using backend-backed logging, update the API URL in:

```text
apps/frontend/src/features/daily-log/useDailyLog.ts
```

to point to your local backend, for example:

```ts
http://localhost:3000/logs
```

A future improvement is to move this value into a Vite environment variable such as:

```env
VITE_API_URL=http://localhost:3000
```

to avoid environment-specific URLs in application code.

---

# Running Tests

CycleSync includes unit tests for important prediction and validation behaviour.

Navigate to:

```bash
cd apps/backend
```

Run the test suite:

```bash
npm test
```

Run in watch mode:

```bash
npm run test:watch
```

Generate coverage:

```bash
npm run test:cov
```

Run end-to-end tests:

```bash
npm run test:e2e
```

The tests cover behaviour including:

* period extraction
* start-to-start cycle derivation
* average cycle calculation
* prediction windows
* confidence calculation
* cycle phase derivation
* low-confidence ovulation windows
* irregular-cycle handling
* missing log handling
* calendar assembly
* daily-log validation

---

# Edge Cases Considered

Cycle prediction becomes substantially more interesting once imperfect data is considered.

CycleSync explicitly accounts for cases such as:

### Missing logs

Small gaps can be tolerated while reconstructing a period, but the resulting period is marked with a confidence flag.

### Large gaps

If missing data exceeds the configured limit, the period is force-closed rather than silently assuming continuous menstruation.

### Spotting

Spotting is represented separately and is not automatically interpreted as the boundary of a menstrual period.

### Insufficient history

Predictions are not generated with the same confidence when only one or two cycles are available.

### High cycle variability

Greater variation reduces confidence in future estimates.

### Short or highly irregular cycles

The phase-estimation logic can flag highly irregular conditions and avoid presenting unreliable ovulation estimates.

### Overlapping predictions and observed menstruation

Observed menstrual data takes precedence over inferred cycle phases.

---

# Data Model

The backend currently uses two primary Prisma models.

### Cycle

```text
Cycle
├── id
├── startDate
├── endDate
├── dayLogs
├── createdAt
└── updatedAt
```

### DayLog

```text
DayLog
├── id
├── date
├── flow
├── notes
├── cycleId
├── createdAt
└── updatedAt
```

`date` is unique for daily logs, preventing multiple conflicting records for the same calendar day.

---

# Engineering Decisions

### Why TypeScript?

Both frontend and backend use TypeScript, providing shared language semantics and stronger contracts around domain concepts such as flow intensity, cycle phases, prediction confidence, and calendar entries.

### Why NestJS?

NestJS provides a modular backend architecture that keeps logging, persistence, health checks, and prediction logic separated into independently maintainable modules.

### Why Prisma + SQLite?

SQLite keeps local development lightweight while Prisma provides type-safe database access and explicit schema migrations.

The persistence layer can later be migrated to another relational database with comparatively little impact on the domain logic.

### Why IndexedDB?

IndexedDB allows structured client-side persistence without requiring account creation or cloud infrastructure.

The implementation is hidden behind a storage abstraction so the rest of the application does not depend directly on browser database APIs.

### Why deterministic prediction logic?

CycleSync intentionally does not use machine learning simply for the sake of using ML.

With limited personal cycle history, deterministic statistical logic is:

* easier to explain
* easier to test
* computationally inexpensive
* transparent about assumptions
* more appropriate for small datasets

The architecture leaves room for more sophisticated models later without coupling them to the UI.

---

# Current Development Status

CycleSync is an actively developed project.

The repository currently contains the core architecture for:

```text
✓ menstrual flow logging
✓ period extraction
✓ cycle reconstruction
✓ cycle statistics
✓ confidence-aware period prediction
✓ cycle phase estimation
✓ ovulation probability windows
✓ irregular-cycle safeguards
✓ calendar composition
✓ local IndexedDB persistence
✓ NestJS API and SQLite persistence
✓ unit and end-to-end testing infrastructure
```

Some frontend/backend integration and UI flows are still under development.

This repository should therefore be considered a **working prototype**, not a medical or production-ready application.

---

# Roadmap

Potential next steps include:

* [ ] complete frontend/backend integration
* [ ] replace hard-coded development API URLs with environment configuration
* [ ] connect live prediction results to the production calendar UI
* [ ] consolidate the local-first and backend persistence strategies
* [ ] add symptom and mood tracking
* [ ] visualise historical cycle-length trends
* [ ] expose prediction-confidence explanations in the UI
* [ ] add data export/import
* [ ] improve accessibility
* [ ] expand integration and end-to-end testing
* [ ] package the application as a Progressive Web App
* [ ] explore optional encrypted backup without compromising local-first behaviour

---

# Medical Disclaimer

CycleSync is an educational software project and is **not a medical device**.

Period, ovulation, fertility, and cycle-phase predictions are estimates derived from user-provided historical data. They should not be used for diagnosis, contraception, fertility treatment, or other medical decisions.

Users should consult a qualified healthcare professional for medical advice.

---

# What This Project Demonstrates

From an engineering perspective, CycleSync explores several problems beyond basic CRUD application development:

* full-stack TypeScript architecture
* modular backend design
* domain-driven separation of prediction logic
* time-series style cycle analysis
* uncertainty-aware algorithms
* defensive handling of incomplete data
* browser-side structured persistence
* relational data modelling with Prisma
* REST API design
* input validation
* unit and end-to-end testing
* privacy-conscious application architecture

The central engineering challenge is not simply storing period dates — it is converting incomplete real-world observations into **useful predictions without pretending those predictions are more certain than the underlying data allows**.

---

## Author

**Ankita Tripathy**

B.Tech — Information Technology
National Institute of Technology, Kurukshetra

---

## License

This project is currently intended for educational and portfolio purposes.

If you plan to make the repository open source, add an appropriate `LICENSE` file and update this section accordingly.
