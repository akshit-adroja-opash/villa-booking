# Codebase Bug & Architecture Analysis Report

This report outlines issues found in the codebase regarding missing API calls, endpoint mismatches, orphan routes, hardcoded URLs, and CORS configuration.

---

## 1. Frontend React components/pages that make NO API calls but should
* **Status**: **No bugs found**.
* **Details**: All dynamic user pages and admin dashboard views successfully fetch real-time data from database endpoints using client-side `fetch`. Redirection pages (e.g. `app/properties/page.tsx`, `app/properties/[id]/page.tsx`, and `app/admin/page.tsx`) correctly forward traffic to dynamic routes.

---

## 2. Frontend API call URL doesn't match any backend route
* **Status**: **No bugs found**.
* **Details**: All consumer `fetch` actions conform to the correct query signatures, request payloads, paths, and HTTP methods defined by the corresponding Next.js route handlers.

---

## 3. Backend route exists but is NEVER called from the frontend (Orphan Routes)

### Bug 1: Orphan Admin Debug Reviews Endpoint
* **File Name & Line**: [app/api/admin/debug-reviews/route.ts](file:///d:/villa-booking/app/api/admin/debug-reviews/route.ts)
* **What the bug is**: The endpoint exists to inspect specific reviews but is never called.
* **How to fix it**: Delete the file if it is obsolete, or integrate it securely into your admin dashboard interface.

### Bug 2: Orphan Admin User Listing Endpoint
* **File Name & Line**: [app/api/admin/list-users/route.ts](file:///d:/villa-booking/app/api/admin/list-users/route.ts)
* **What the bug is**: This endpoint returns user details but is not referenced. The dashboard uses `/api/users` instead.
* **How to fix it**: Delete the file.

### Bug 3: Orphan Admin Reviews Migration Endpoint
* **File Name & Line**: [app/api/admin/migrate-reviews/route.ts](file:///d:/villa-booking/app/api/admin/migrate-reviews/route.ts)
* **What the bug is**: This migration helper endpoint is defined but never invoked from the client.
* **How to fix it**: Move this migration script to a dedicated `scripts` or `migrations` folder outside the Next.js `app` folder to keep the production routing bundle clean.

### Bug 4: Orphan Admin Test Update Endpoint
* **File Name & Line**: [app/api/admin/test-update/route.ts](file:///d:/villa-booking/app/api/admin/test-update/route.ts)
* **What the bug is**: Temporary test endpoint to update database schemas. Unused.
* **How to fix it**: Delete the file.

---

## 4. axios/fetch base URL is missing or wrong (Hardcoded Localhosts)

### Bug 5: Hardcoded Localhost URL in Welcome Email
* **File Name & Line**: [lib/mailer.ts:152](file:///d:/villa-booking/lib/mailer.ts#L152)
* **What the bug is**: The email layout hardcodes the redirect link to `http://localhost:3000/farms` instead of retrieving the dynamic deployment host. Users receiving welcome emails in production will click a broken link.
* **How to fix it**: Utilize the configured `NEXTAUTH_URL` environment variable to construct the link:
  ```typescript
  const origin = process.env.NEXTAUTH_URL || 'https://enjoyfarm.in';
  // Replace the link in the template with:
  // href="${origin}/farms"
  ```

---

## 5. CORS Configuration
* **Status**: **No bugs found**.
* **Details**: As a unified Next.js project, both front-end pages and API endpoints reside on the same server codebase and port. The client triggers relative request paths (`/api/...`), satisfying the same-origin policy naturally without requiring CORS middleware.
