# Storage Boundary — Privacy Contract

This folder defines the **only location** in the application
where user data may be persisted.

## Guarantees

- All data is stored **locally on the user's device**
- No network requests originate from this layer
- No analytics, tracking, or telemetry
- No background sync
- No cloud assumptions

## Architectural Rules

- UI components MUST NOT access browser storage directly
- Domain logic MUST NOT know how data is stored
- Only `src/storage/index.ts` may be imported by the app
- Implementations (IndexedDB, etc.) stay private to this folder

## Intentional Non-Goals

- No encryption-at-rest (browser sandbox already applies)
- No multi-device sync
- No accounts or identifiers

If any code outside this folder touches persistence APIs
(localStorage, IndexedDB, File System Access, etc.),
that is a **privacy violation**.

This boundary is intentional and non-negotiable.
