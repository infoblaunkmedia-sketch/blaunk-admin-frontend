# Blaunk Admin CRM — Master Build Prompt for Claude Code

## CONTEXT

You are rebuilding a React + TypeScript admin CRM from scratch.
The old codebase exists at the root of this project. Read it for reference ONLY —
do not copy its patterns, routing, or state management approach.
The old code has critical issues you must fix: no routing library, hardcoded credentials,
all state ephemeral (lost on refresh), dead tabs, non-functional access control,
and a God component (`Admin.tsx`) owning everything.

Your job is to build the new, clean version described in this document.
Follow every instruction here precisely. When something is not specified, use
your best judgment but stay consistent with the patterns you establish.

---

## TECH STACK

Keep the existing `package.json` dependencies. Add the following:

```
react-router-dom       → page routing (replace the useState-based nav)
zustand                → global state management (replace prop drilling)
@tanstack/react-query  → server state / data fetching patterns
react-toastify         → notifications (replace react-hot-toast)
```

Remove or do not use:
- Any hardcoded credential strings anywhere in source
- `window.location.reload()` as a logout mechanism
- Direct `console.log` for debugging (use a logger utility)

---

## CRITICAL ARCHITECTURE RULES

1. **Routing**: Use `react-router-dom` v6. Every module is a route, every sub-tab is a nested route. No `activeTab` useState navigation.
2. **State**: Use Zustand for auth state, user permissions, and any shared cross-module state. Component-local `useState` is fine for form UI only.
3. **Auth**: JWT token stored in `httpOnly` cookie (or `sessionStorage` if cookie is not available in this setup). Never in `localStorage`. Never hardcoded.
4. **Access control**: User permissions from auth token gate route rendering. A user without permission for a module cannot see it in the sidebar and gets redirected if they hit the URL directly.
5. **Forms**: Keep `react-hook-form` — it is used correctly in the old code. Keep `react-data-table-component` for tables.
6. **PDF**: Keep `@react-pdf/renderer` for payslip generation.
7. **Excel**: Keep `exceljs` + `file-saver` for MIS exports. Keep `xlsx` for file imports.
8. **No mock data**: Do not create `generate/` or `mock*.ts` files. All data comes from API calls (use placeholder `async` service functions that return typed empty arrays/objects — the structure must be real even if the data is not wired up yet).
9. **Error boundaries**: Wrap every module route in an `<ErrorBoundary>` component. A crash in one module must not crash the shell.
10. **Form state persistence**: Use Zustand or `sessionStorage` to persist in-progress form state when a user navigates away and returns. Never lose a half-filled form on tab switch.

---

## FOLDER STRUCTURE

```
src/
  app/
    router.tsx          ← all routes defined here
    shell/
      Sidebar.tsx
      Topbar.tsx
      Shell.tsx          ← layout wrapper
  auth/
    Login.tsx
    authStore.ts         ← Zustand auth store
    useAuth.ts
    ProtectedRoute.tsx
  modules/
    dashboard/
    cms/
    people/
      employees/
      payroll/
      vacancies/
    channelPartners/
      dsa/
      verifiers/
      vendors/
      credentials/
    finance/
      b2bPayments/
      dsaPayouts/
      bankAccounts/
    platform/
      planCharges/
      commission/
      vouchers/
      dsaLimits/
    marketing/
      mediaAds/
      matchDoe/
      contests/
    customers/
      individuals/
      issues/
      reviews/
    reports/
    corporate/
      shareholding/
      companyProfile/
    settings/
      userRights/
      security/
      ipManagement/
  shared/
    components/         ← reusable UI: PageHeader, DataTable wrapper, FormSection, etc.
    hooks/
    services/           ← API service functions (typed, async, placeholder)
    types/              ← all TypeScript interfaces
    utils/
    constants/          ← shared constants (countries, states, designations, departments)
```

Each module folder contains:
- `index.tsx` — the route component (layout + sub-routing)
- `[SubSection].tsx` — individual sub-section components
- `[module].types.ts` — TypeScript interfaces for this module
- `[module].service.ts` — API service functions for this module

---

## AUTHENTICATION

### Two login paths — not one

The login screen must present a toggle or tab: **Employee Login** | **DSA Login**

**Employee Login:**
- Field: Employee Code (e.g. E0001)
- Field: Password
- Field: Captcha (rendered from Settings → Security captcha config)
- Validation: If employee status is `EXIT` or `HOLD` → show "Account not active" error, block login
- On success → redirect to `/dashboard`

**DSA Login:**
- Field: DSA Code
- Field: Password
- Field: Captcha
- Validation: If DSA status is `SUSPENDED` or `BLOCKED` → show "Account suspended" error, block login
- On success → redirect to DSA portal view (different sidebar from admin)

**Both paths:**
- Forgot Password link → `/forgot-password` (email-based reset flow, build the UI, wire later)
- Failed login increments attempt counter → after 5 attempts show lockout message

**Logout:**
- Clear auth token/session
- Redirect to `/login`
- Never use `window.location.reload()`

---

## SIDEBAR & NAVIGATION

Sidebar module order (top to bottom — this order is mandatory):

```
1.  Dashboard
2.  CMS
3.  People
4.  Channel Partners
5.  Finance
6.  Platform & Products
7.  Marketing & Ads
8.  Customers & Care
9.  Reports (MIS)
10. Corporate
11. Settings
```

Sidebar must:
- Show only modules the logged-in user has permission for (from User Rights)
- Highlight the active module
- Support collapsed/expanded sub-navigation per module
- Show notification badges on Dashboard, Finance (pending approvals), Customers & Care (open issues)

---

## MODULE SPECIFICATIONS

### 1. DASHBOARD

**Route:** `/dashboard`

**Purpose:** First screen after login. Orientation at a glance.

**Components:**
- KPI cards: Active Employees count, Open Customer Issues count, Pending DSA Payments, Pending Verifications
- Each KPI card is clickable → navigates to the relevant module filtered to that state
- Recent Activity feed (latest 10 actions across the system — read from an activity log service)
- Quick navigate shortcuts to the most-used modules

**No data entry on this screen. Read-only.**

---

### 2. CMS

**Route:** `/cms`

**Purpose:** Admin uploads and manages content that appears on the public website.

**Sub-sections:**
- Image Library (`/cms/images`) — upload images, categorize by section, set active/inactive
- Page Content (`/cms/pages`) — manage text blocks, banners, and content sections per page

**Notes:**
- Scope is partially TBD — build the structure and image upload flow fully.
- Use `react-easy-crop` for image cropping before upload (same as existing HR photo flow).
- Each image has: section tag, upload date, status (active/inactive), thumbnail preview.

---

### 3. PEOPLE

**Route:** `/people`

#### 3a. Employees (`/people/employees`)

**Form fields (from existing `Credentials.tsx` — keep all fields, improve the layout):**

Personal: full name, DOB, gender, nationality, marital status, address, city, state, country, PIN, mobile, emergency contact name/number/relation, email, photo (with crop)

Employment: employee code (auto-generated), department, designation, date of joining, employee status (Active / HOLD / EXIT), remarks

Salary (all fields required):
```
Basic Salary, HRA, LTA, Medical, CEA, Food Allowance,
Supplementary, MEA, PF (Employee), ESI, Health Insurance,
NPS, Professional Tax, Gratuity, Round Off,
Monthly CTC (auto-calculated), Per Day CTC (auto-calculated)
```

Bank: account holder name, account number, IFSC, bank name, branch

Documents: Aadhaar, PAN, passport number, photo upload slots

**UX rules:**
- Split the form into clearly labeled sections using a stepper or collapsible accordion — do NOT dump 50 fields on one page
- Auto-calculate Monthly CTC = sum of all components; Per Day CTC = Monthly CTC ÷ 26
- Save as draft (persists in sessionStorage) until final Submit
- Search employees by name, code, department before creating new (prevent duplicates)

**Constants (move to `src/shared/constants/hrConstants.ts`):**
- Countries: India, UAE, UK, USA, Singapore, Malaysia, Thailand, Qatar, Kuwait, Bahrain, Oman, Saudi Arabia, Hong Kong, Australia
- All 36 Indian states
- Designations and departments (extract from existing `hrConstants.tsx`)

#### 3b. Payroll (`/people/payroll`)

Sub-tabs: Monthly Payslip | Yearly Payslip | Employee Cost

Filters: Financial Year, Department, Employee (search/select), Period, Month

On filter submit → show matching employee records in a DataTable

Each row → "Generate PDF" → uses `@react-pdf/renderer` to produce the payslip

**Critical fix from old code:** Do NOT hardcode any employee data. Pull from the Employees data service.

#### 3c. Vacancies (`/people/vacancies`)

Form: Job title, department, number of openings, description, required experience, location, posted date, status (Open/Closed)

Table view of all vacancies with status filter.

---

### 4. CHANNEL PARTNERS

**Route:** `/channel-partners`

#### 4a. DSA Network (`/channel-partners/dsa`)

Fields: DSA code (auto-generated), company name, owner name, mobile, email, country, city, state, products covered, sharing ratio (e.g. 30:70), status (Active / Suspended / Blocked), KYC status, bank details, joining date

**Important:** The sharing ratio stored here is auto-referenced by Finance → DSA Payouts for limit calculation. It must be a typed field (`shareRatio: number`) not a display string.

This record is linked to the DSA website login account.

#### 4b. Verifiers (`/channel-partners/verifiers`)

Fields: Verifier code, company name, contact person, mobile, email, city, state, products covered, verification fee, status, KYC status, bank details

#### 4c. Vendors (`/channel-partners/vendors`)

**New entity — does not exist in old code.**

Fields: Vendor code (auto-generated), business name, owner name, mobile, email, address, city, state, country, product categories, bank details, KYC status, status (Active / Inactive / Suspended), joining date

This record is linked to the Vendor website login account.

#### 4d. 3P Credentials (`/channel-partners/credentials`)

Keep the existing `ThirdPCredentials.tsx` structure — same fields — but re-routed here from HR. Clean up the layout using the same accordion/stepper pattern as the Employee form.

---

### 5. FINANCE

**Route:** `/finance`

#### 5a. B2B Payments (`/finance/b2b`)

Inline-editable DataTable. Fields per row:
```
Order ID, Payin Amount, Charges, TDS, TCS, Penalties,
Portal Fee (auto-deducted from Plan Charges config),
Net Payout, Bank Transfer Status, Transaction Number, Date
```

Actions: Edit row → save, Filter by date range / status, Excel upload (bulk import), Export as Excel

#### 5b. DSA Payouts (`/finance/dsa-payouts`)

**This is a Maker & Checker workflow — two stages:**

**Stage 1 — DSA submits (Maker):**
- DSA enters: Amount (in their local currency), Transaction Number
- System auto-fetches their sharing ratio from Channel Partners → DSA Network
- System shows calculated limit: `Principal INR + (Sharing% × Principal INR) = Total Limit`
- Currency conversion to INR is applied (rate field, editable by Management)
- DSA submits → record status becomes `PENDING_APPROVAL`
- The submitted record appears in Management's approval queue (Platform & Products → DSA Limits view)

**Stage 2 — Management approves (Checker):**
- Management sees pending submissions in Platform & Products → DSA Limits
- Verifies currency conversion and calculated limit
- Approves or Rejects with a note
- On Approve → status becomes `APPROVED`, PAY-IN balance updates:
  `New Amount + BOD Balance − Used = Available Balance`
- On Reject → status becomes `REJECTED`, DSA notified

**PAY-IN formula displayed on DSA's view:**
```
New amount added today
+ Beginning of Day (BOD) balance
− Used value
= Available balance
```

#### 5c. BGT Bank Accounts (`/finance/bank-accounts`)

**Scoped to BGT vendor payments ONLY — not a general bank registry.**

Three payment method sections:
1. NEFT / RTGS — account holder, account number, IFSC, bank name, branch
2. QR Code — per-country QR image upload (use existing Paybank structure)
3. WIRE / SWIFT — SWIFT code, IBAN, bank name, beneficiary name, country

When a BGT vendor selects "Pay" in their portal, these three options appear as a dropdown.

---

### 6. PLATFORM & PRODUCTS

**Route:** `/platform`

#### 6a. Plan Charges (`/platform/plan-charges`)

**Two distinct plan types — separate sub-tabs:**

**Product Subscription Plans:**

| Plan Name | MRP | Offer Price |
|-----------|-----|-------------|
| Bronze    |     |             |
| Silver    |     |             |
| Gold      |     |             |
| Platinum  |     |             |
| Diamond   |     |             |

Edit/Save toggle. MRP and Offer Price are the two corrected columns (not the old incorrect column names).

**Advertisement Plans:**

| Ad Type          | Price |
|------------------|-------|
| Slider           |       |
| Banner           |       |
| Business Card    |       |
| Trendy Star      |       |
| Exclusive Videos |       |

Edit/Save toggle per plan type.

#### 6b. Commission (`/platform/commission`)

Portal fees per product category: Tour, Cake, Store (percentage inputs)
GST / BGT commission rates (percentage inputs)
Edit/Save toggle. Two independent editable sections.

#### 6c. Vouchers (`/platform/vouchers`)

Fields per voucher:
- Code: 12-character alphanumeric (auto-generate button + manual override)
- Plan tier: linked to Plan Charges → Product Subscription plan names (Bronze/Silver/Gold/Platinum/Diamond)
- Discount: percentage (0–100, hard cap at 100%)
- Usage type: One-time per individual | One-time per vendor
- Status: Active / Expired / Redeemed
- Expiry date
- Created by (auto-filled from logged-in user)

Admin has full rights to create, edit, and expire codes.
Table shows all vouchers with status filter and search by code.

#### 6d. DSA Limits (`/platform/dsa-limits`)

Two views:

**Config view:** Set global DSA credit limit parameters. Currency conversion rates per country.

**Approval queue:** Shows all `PENDING_APPROVAL` DSA payout submissions from Finance → DSA Payouts.

Each pending item shows: DSA code, DSA name, submitted amount, currency, converted INR amount, calculated limit, sharing ratio used, submission date.

Actions: Approve (with transaction note) | Reject (with reason).

---

### 7. MARKETING & ADS

**Route:** `/marketing`

#### 7a. Media Ads (`/marketing/media-ads`)

**READ-ONLY view — no edit capability on this screen.**

Purpose: Office staff checks how many ads have been received from DSA agents.

Display: ADS Illustration Table showing:
- Section name (Slider, Explore, TrendyStar, GlobalStore, Boutique, BGT, Tour, etc.)
- Platform (Homepage, BGT, Tour, Store, Cake, Boutique, Logistic)
- Slot limit per section
- Slots filled (count)
- Slots remaining
- Submitted by (DSA code)
- Submission date
- Status (Pending Review / Approved / Rejected)
- Image thumbnail

Filters: by section, by platform, by status, by date range.

No "Add" or "Edit" button on this screen. Data comes from DSA Media Upload submissions.

#### 7b. Match Doe (`/marketing/match-doe`)

**New feature — does not exist in old code.**

Purpose: Management issues a 5-digit verification code. DSA must enter this code when submitting media uploads. Without it, their upload is rejected.

UI:
- Large display of current active Match Doe code (e.g. **48291**)
- "Refresh Code" button → generates a new 5-digit code, invalidates the old one
- Code auto-refreshes on every new session
- History table: previous codes, generated timestamp, generated by

**The same code is validated on the DSA's Media Upload form before submission is accepted.**

Store the current active code in a service (not hardcoded). The DSA upload form calls a validation check against this stored code.

#### 7c. Contests (`/marketing/contests`)

Fields: Contest name, description, start date, end date, prize, eligibility criteria, status (Draft / Active / Ended)
Table view with status filter.

---

### 8. CUSTOMERS & CARE

**Route:** `/customers`

#### 8a. Individuals (`/customers/individuals`)

**New — does not exist in old code.**

These are end users who registered on the website via Individual login.

Fields (read/manage only — they register themselves):
- Customer ID (auto-generated), full name, email, mobile, country, registration date
- Account status: Active / Suspended / Blocked
- Last login date
- Total orders / bookings (if available)

Admin can: search, view profile, change account status, add internal notes.
Admin cannot create individual accounts from here (self-registration on website only).

#### 8b. Issues (`/customers/issues`)

From existing `ReportAnIssue.tsx` — keep structure, clean up.

Fields: RN number (auto-generated), customer name/ID, article/product, issue type, vendor name, vendor response, penalty applied (amount), status (Pending / In Progress / Resolved), country, raised date, resolved date

Status lifecycle must be enforced: Pending → In Progress → Resolved (no skipping).
Penalty amount → links to Finance if vendor deduction is needed.

#### 8c. Reviews (`/customers/reviews`)

Review moderation table: reviewer name, product/service, rating (1-5), review text, date, status (Published / Hidden / Flagged).
Actions: Publish, Hide, Flag for review.

---

### 9. REPORTS (MIS)

**Route:** `/reports`

**Single unified report module — replaces all 11 scattered MIS components.**

**Do not build 11 separate MIS pages.** Build ONE configurable report generator.

UI:
1. Department selector (dropdown): HR | Finance | DSA | Sales | Admin | Customer Care | Verifier | IT | Company Secretary | Payroll
2. Report type selector (changes based on department selected)
3. Date range picker (from / to)
4. Additional filters (department sub-filter, employee, country — depends on report type)
5. Output format: Excel (primary)
6. "Generate Report" button → calls the relevant service → downloads file via `file-saver`

**Report types per department:**

| Department | Report Types |
|---|---|
| HR | Employee List, Salary Register, Vacancy Report |
| Finance | B2B Payment Ledger, Outstanding Payments |
| DSA | DSA Performance, DSA Payment History, DSA Limit Usage |
| Sales | MIS-Subscription, MIS-Lead Tour, MIS-Lead Cake, MIS-Lead Store, MIS-Product Listing, MIS-Email Subscription |
| Admin | Country Login Analytics, Admin Activity |
| Customer Care | Issue Report, Review Summary |
| Verifier | Verifier Activity, KYC Status |
| IT | Security Log, IP Access Log |
| Company Secretary | Shareholding Register |
| Payroll | Monthly Payslip Register, Yearly Summary, Employee Cost |

Each report type maps to a typed service function that returns structured data → ExcelJS builds the workbook → file-saver downloads it.

---

### 10. CORPORATE

**Route:** `/corporate`

#### 10a. Shareholding (`/corporate/shareholding`)

From existing `Shareholding.tsx` — keep all fields.

Fields: Shareholder name, folio number, share type (Equity/Preference), ISIN, number of shares, allotment date, PAN, address, bank details, nominees (dynamic array — name, relation, percentage).

Search by shareholder name or folio number.
Edit/Save toggle.

#### 10b. Company Profile (`/corporate/profile`)

From existing `CompanyDetails.tsx` — FIX the broken `onSubmit` (it was a no-op).

Fields: Legal company name, CIN, PAN, GSTIN, registered address, correspondence address, logo upload, authorized signatory name and signature upload, incorporation date.

This data is referenced in Payslip PDF headers and Invoice headers — pull from this record dynamically (do not hardcode company name anywhere).

---

### 11. SETTINGS

**Route:** `/settings`

#### 11a. User Rights (`/settings/rights`)

**This must actually work — it was non-functional in the old code.**

UI: Table with employee codes as rows, module names as columns. Checkbox at each intersection.

On Save:
- Permissions are stored (service call)
- The Sidebar reads each logged-in user's permissions from their auth token / permissions service
- Modules the user lacks permission for are hidden from the sidebar
- Direct URL navigation to a restricted module redirects to a 403 screen

Pre-built roles: Super Admin (all access), HR Manager (People + Reports), Finance Manager (Finance + Reports + Platform), Operations (Marketing + Customers + Reports).
Custom per-employee override is also supported.

#### 11b. Security (`/settings/security`)

Two sections:

**Captcha Management:**
- Table of modules (Login — Employee, Login — DSA, Media Upload, etc.)
- Each module has an editable captcha code
- **The Login screen MUST read its captcha from this table** — this was disconnected in old code

**Passcode Management:**
- Access passcodes for sensitive operations

#### 11c. IP Management (`/settings/ip-management`)

Whitelist of allowed IP addresses / CIDR ranges for admin panel access.

Table: IP address, label (e.g. "Blaunk Office Mumbai"), added by, added date, status (Active/Inactive).

If a request comes from a non-whitelisted IP → the admin URL returns a denial page (handle in router with an IP check on entry).

---

## CROSS-CUTTING CONCERNS

### Shared Components (build these first, use them everywhere)

```
<PageHeader title="" subtitle="" actions={[]} />
<SectionCard title="" collapsible={true} />
<DataTableWrapper columns={} data={} searchable={true} exportable={true} />
<StatusBadge status="" />  ← color-coded: Active=green, Suspended=amber, Blocked=red, etc.
<FormField label="" error="" required={true} />
<ConfirmDialog message="" onConfirm={} onCancel={} />
<EmptyState message="" action={} />
<ErrorBoundary fallback={} />
```

### Maker & Checker Pattern

Used in: Finance → DSA Payouts AND Platform & Products → DSA Limits.

Build a reusable `<ApprovalWorkflow>` component:
- Props: `items`, `onApprove(id, note)`, `onReject(id, reason)`, `statusField`
- Shows a queue of pending items with Approve/Reject actions
- Handles optimistic UI updates

### MIS Export Pattern

Build a single reusable `generateExcelReport(reportType, filters, data)` utility in `src/shared/utils/reportGenerator.ts`.

All 10+ report types call this utility — do not duplicate ExcelJS boilerplate.

### Image Upload + Crop Pattern

Build a single `<ImageUploader cropAspect={} onCrop={} maxSizeMB={} />` component.
Used in: CMS, Employee photo, DSA Media Upload, BGT QR codes, Marketing media.
Do not re-implement cropping logic per module.

---

## DESIGN SYSTEM

Use Bootstrap 5 (already installed) as the base. Build a thin design token layer on top:

```css
:root {
  --brand-primary: #1A1A2E;
  --brand-accent: #E94560;
  --brand-surface: #F8F9FA;
  --sidebar-bg: #1A1A2E;
  --sidebar-text: #A0AEC0;
  --sidebar-active: #E94560;
  --sidebar-width: 240px;
  --topbar-height: 60px;
  --card-radius: 10px;
  --card-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
```

Shell layout: Fixed sidebar (240px) + fixed topbar (60px) + scrollable main content area.

Typography: Use a clean sans-serif. Suggested: `'DM Sans'` from Google Fonts.

Status badges must be color-coded consistently:
- Active / Approved / Resolved → green
- Pending / Draft → amber
- Suspended / Rejected / HOLD → red
- Inactive / Expired → gray

---

## REMOVED MODULES — DO NOT BUILD

The following exist in the old codebase but have been removed by client decision.
Do not build these. Do not reference them:

- ❌ Retail Shop (Invoice, Financial, Rejection)
- ❌ Retail Management (Tax Code, Voucher, Upload, Values)
- ❌ M&A (BGT Config, Sponsor Ads)
- ❌ Operations module (was fully dependent on Retail)
- ❌ Country Login Analytics (was in M&A)
- ❌ Country Media (was in Admin & Personnel)

---

## DEAD CODE — DO NOT REPLICATE

These existed as broken/empty stubs in old code. Do not create them:

- ❌ Sales → Advertisement tab (was empty)
- ❌ Sales → Homepage tab (was empty)
- ❌ Sales → Logistic tab (was empty)
- ❌ IT Dept → Upload tab (was empty)
- ❌ Customer Care → Profile tab (was empty)
- ❌ Tag module (unclear purpose, duplicate registration)
- ❌ Management → `onSubmit={() => {}}` no-op pattern anywhere

---

## BUILD ORDER (recommended)

Build in this sequence to unblock other modules:

```
Phase 1 — Foundation
  1. Project setup: router, Zustand store, shell layout (Sidebar + Topbar)
  2. Authentication: Login (two-path), ProtectedRoute, auth store
  3. Shared components: PageHeader, SectionCard, DataTableWrapper, StatusBadge, ImageUploader
  4. Shared utilities: reportGenerator, logger, apiService base

Phase 2 — Core modules
  5. Settings → User Rights, Security, IP Management (gate everything on this)
  6. People → Employees (largest form — establish form pattern here)
  7. People → Payroll
  8. Channel Partners → DSA, Verifiers, Vendors, 3P Credentials

Phase 3 — Operations
  9. Finance → B2B Payments, DSA Payouts (Maker & Checker), BGT Bank Accounts
 10. Platform & Products → Plan Charges, Commission, Vouchers, DSA Limits
 11. Marketing & Ads → Media Ads (read-only), Match Doe, Contests

Phase 4 — Support & Governance
 12. Customers & Care → Individuals, Issues, Reviews
 13. Corporate → Shareholding, Company Profile
 14. Reports (MIS) → unified report generator
 15. CMS → Image Library, Page Content
 16. Dashboard → KPIs, Activity feed (wire to real data from above modules)
```

---

## VALIDATION CHECKLIST

Before considering any module complete, verify:

- [ ] Route is registered in `router.tsx`
- [ ] Module is gated by user permission from Settings → User Rights
- [ ] Form state is preserved if user navigates away and returns
- [ ] All TypeScript interfaces are defined in the module's `.types.ts` file
- [ ] API calls use the module's `.service.ts` file (no inline fetch calls in components)
- [ ] DataTable has search, sort, and pagination
- [ ] Empty state is handled (no blank screens)
- [ ] Error boundary is wrapping the route
- [ ] No hardcoded data (no mock arrays inside components)
- [ ] MIS/export uses the shared `reportGenerator` utility
- [ ] Status badges use the shared `<StatusBadge>` component
- [ ] Image uploads use the shared `<ImageUploader>` component

---

## NOTES FOR CLAUDE CODE

- Read this entire document before writing a single line of code.
- Read the existing codebase to understand the domain model (field names, TypeScript interfaces, constants). Extract useful types and constants — do not copy patterns or architecture.
- When you encounter something ambiguous, make the decision that is most consistent with what is already specified here and document your assumption in a comment.
- Do not ask for clarification on things already specified here. Only ask if something is genuinely unspecified and architecturally significant.
- Build module by module following Phase order above. Complete each phase before starting the next.
- After completing each module, run a type-check (`tsc --noEmit`) and fix all type errors before moving on.
