# LedgerGuard — Detailed Frontend–Backend Integration Implementation Plan

## 1. Project Overview

**Project:** LedgerGuard  
**Architecture:** Multi-tenant SaaS application  
**Backend:** Node.js, Express.js, TypeScript, MongoDB, Mongoose  
**Frontend:** React, TypeScript, Vite  
**Authentication:** JWT-based authentication  
**Database:** MongoDB Atlas with a central database and separate logical tenant databases for organizations.

### Main objective

Complete the integration between the existing LedgerGuard frontend and backend without unnecessarily rewriting working modules.

The primary goals are:

1. Complete organization registration.
2. Add missing company information to the Organization database schema.
3. Connect all registration form steps to the backend.
4. Ensure the first organization owner is created correctly.
5. Make login and authentication persistence reliable.
6. Display actual organization information in the dashboard.
7. Maintain tenant isolation and role-based access.
8. Identify remaining frontend sections that are still placeholders.

**Important:** Some backend integration is already completed, and another team member has implemented part of the frontend integration. The AI must inspect the current code before changing anything. It must preserve working implementations.

---

# 2. Existing Architecture and Current Implementation

Before modifying code, inspect these existing files.

## Backend

- `backend/src/models/Organization.ts`
- `backend/src/models/User.ts`
- `backend/src/models/Tenant.ts`
- `backend/src/controllers/organizationController.ts`
- `backend/src/services/organizationProvisioningService.ts`
- `backend/src/controllers/authController.ts`
- `backend/src/services/authService.ts`
- `backend/src/middleware/authMiddleware.ts`
- `backend/src/middleware/tenantMiddleware.ts`
- `backend/src/controllers/dashboardController.ts`
- `backend/src/services/dashboardService.ts`
- `backend/src/routes/organizationRoutes.ts`
- `backend/src/routes/authRoutes.ts`
- `backend/src/routes/dashboardRoutes.ts`
- `backend/src/services/tenantConnectionManager.ts`
- `backend/src/app.ts`
- `backend/src/server.ts`
- `backend/src/config/env.ts`

## Frontend

- `Frontend/src/App.tsx`
- `Frontend/src/pages/EntryPortal.tsx`
- `Frontend/src/pages/OrganizationRegistration.tsx`
- `Frontend/src/pages/Login.tsx`
- `Frontend/src/pages/CompanyDashboard.tsx`
- `Frontend/src/services/api.ts`
- `Frontend/src/components/Sidebar.tsx`
- `Frontend/src/components/Topbar.tsx`

Also inspect related TypeScript types, CSS files, components, hooks and configuration.

## 2.1 What is already implemented

### Backend

- Central MongoDB connection.
- Organization, User and Tenant models.
- Organization provisioning service.
- Tenant database initialization.
- Creation of an organization owner during provisioning.
- JWT-based login.
- Authenticated `/api/auth/me` endpoint.
- Authentication middleware.
- Organization status validation.
- Dashboard overview endpoint.
- Organization-specific user statistics.
- CORS configuration.
- Public organization registration endpoint.

### Frontend

- Entry portal with company and employee login options.
- Login form connected to the login API.
- JWT storage in `sessionStorage`.
- Centralized API service in `services/api.ts`.
- Dashboard connected to the overview API.
- Dashboard displays organization and user statistics.
- Three-step registration progress indicator.
- Company information form fields already present.

## 2.2 Existing incomplete or mismatched functionality

1. `OrganizationRegistration.tsx` currently implements only Step 1.
2. Step 2 for owner account information is missing.
3. Step 3 review and submission are missing.
4. Registration form does not call the existing `registerOrganization()` API function.
5. The API registration function accepts fewer fields than the frontend collects.
6. The Organization schema does not contain the additional company information.
7. The dashboard does not display all company information.
8. The frontend does not reliably validate the stored JWT using `/api/auth/me` when the application starts.
9. Several dashboard navigation sections are still placeholders.
10. Login contains a registration link pointing to `/register`, but the application currently uses conditional rendering rather than a configured router. This link must be corrected.
11. The frontend currently has no shared authentication context. Evaluate whether a lightweight context is useful before adding one.

Do not treat these as reasons to rebuild the application from scratch.

---

# 3. Phase 1 — Finalize the Data Model

This phase must be completed before connecting the registration form.

## 3.1 Update Organization schema

File:

`backend/src/models/Organization.ts`

The current Organization schema contains:

- name
- slug
- status
- createdAt
- updatedAt

Add the following fields:

| Field | Type | Required |
|---|---|---|
| companyEmail | String | Yes |
| companyDomain | String | Yes |
| contactNumber | String | Yes |
| companySize | String | Yes |
| companyAddress | String | Yes |

The existing fields must remain unchanged.

### Recommended field definitions

**companyEmail**
- String
- Required
- Trim whitespace
- Convert to lowercase
- Validate email format

**companyDomain**
- String
- Required
- Trim whitespace
- Convert to lowercase
- Store a normalized hostname/domain rather than an arbitrary URL
- Reject invalid domain formats
- Do not perform external DNS verification during registration

**contactNumber**
- String, never Number
- Required
- Trim whitespace
- Validate an appropriate international phone format
- Preserve the country code and leading zeroes where applicable

**companySize**
- String
- Required
- Use the exact values already present in the frontend:

`1-10`, `11-50`, `51-200`, `201-500`, `500+`

**companyAddress**
- String
- Required
- Trim whitespace
- Set a reasonable maximum length, such as 300 characters

### Important data-design decision

Keep these two email addresses separate:

- `companyEmail`: Official company contact email.
- `ownerEmail`: Login email of the person registering the organization.

They may be identical, but they serve different purposes.

Do not store the owner email as a replacement for companyEmail.

## 3.2 Update TypeScript interfaces

Update `IOrganization` to include all new fields.

Ensure that all code consuming the Organization model uses the updated interface.

Do not duplicate Organization types unnecessarily in multiple files. Reuse shared types where practical.

## 3.3 Existing database records

Existing organizations such as Acme Technologies, Beta Solutions and other previously created test organizations do not automatically receive the new fields.

Plan a safe migration:

1. Identify existing organization documents missing the new fields.
2. Backfill legitimate company information where available.
3. If values are unavailable, use an explicit migration strategy rather than inventing company details.
4. During migration, consider making new fields optional for existing records.
5. After migration and verification, make them required for new registrations.

Do not delete or recreate existing organizations or tenant databases.

---

# 4. Phase 2 — Update Organization Provisioning Backend

Files:

- `backend/src/services/organizationProvisioningService.ts`
- `backend/src/controllers/organizationController.ts`
- `backend/src/routes/organizationRoutes.ts`

The existing provisioning service already creates:

1. Organization.
2. First owner user.
3. Tenant record.
4. Tenant metadata.

Preserve this existing flow.

## 4.1 Update provisioning input

The service should accept:

```ts
interface ProvisionOrganizationInput {
  name: string;

  companyEmail: string;
  companyDomain: string;
  contactNumber: string;
  companySize: string;
  companyAddress: string;

  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
}
```

The actual companySize type should use the defined enum values rather than unrestricted strings.

## 4.2 Validation

Validate all fields before creating database records.

Organization validation:

- Name is required.
- Name must be between 2 and 100 characters.
- Company email must be valid.
- Company domain must be valid and normalized.
- Contact number must be valid.
- Company size must match the allowed values.
- Address must not be empty.
- Address must not exceed the configured maximum length.

Owner validation:

- Owner name is required.
- Owner email must be valid.
- Owner password must contain at least 8 characters.
- Enforce the existing bcrypt password-length limit of 72 UTF-8 bytes.

Normalize emails before checking for duplicates.

## 4.3 Organization slug and database name

Retain the existing slug generation mechanism.

For example:

Company name: Acme Technologies

Slug: `acme-technologies`

Tenant database name: `tenant_acme_technologies`

Do not change the tenant database naming convention without a strong reason.

Handle duplicate organization slugs explicitly.

Do not silently generate an unpredictable slug or overwrite an existing organization.

## 4.4 Provisioning transaction

Preserve the existing transaction-based central database creation.

The process should be:

1. Validate all input.
2. Normalize the company and owner details.
3. Hash the owner's password.
4. Start a MongoDB session.
5. Check whether the owner email already exists.
6. Create the Organization with all company fields.
7. Create the first User with role `owner`.
8. Create the Tenant record.
9. Commit the transaction.
10. Initialize tenant metadata.
11. Return the safe registration response.

The owner must never be created as an ordinary member during company registration.

Do not return passwordHash or raw passwords.

## 4.5 Failure handling

Preserve the existing tenant initialization failure handling.

If tenant initialization fails after the central transaction commits:

- Close the tenant connection.
- Mark the Tenant connectionStatus as inactive.
- Mark the Organization status as suspended.
- Return an appropriate error.
- Do not claim that registration completed successfully.

Handle duplicate key errors separately.

Suggested status codes:

| Situation | HTTP status |
|---|---|
| Successful registration | 201 |
| Invalid input | 400 |
| Duplicate email or slug | 409 |
| Tenant initialization unavailable | 503 |
| Unexpected server/database error | 500 |

Avoid relying only on matching arbitrary error-message strings. Use structured service errors or error codes where practical.

---

# 5. Phase 3 — Define the Registration API Contract

Endpoint:

`POST /api/organizations/register`

The frontend and backend must use exactly the same request field names.

## 5.1 Request body

```json
{
  "name": "Acme Technologies",
  "companyEmail": "contact@acme.com",
  "companyDomain": "acme.com",
  "contactNumber": "+91XXXXXXXXXX",
  "companySize": "51-200",
  "companyAddress": "Nagpur, Maharashtra, India",
  "ownerName": "John Doe",
  "ownerEmail": "john@acme.com",
  "ownerPassword": "StrongPassword123"
}
```

These values are examples only.

## 5.2 Expected successful response

Maintain the existing response wrapper:

```json
{
  "success": true,
  "message": "Organization and owner account created successfully",
  "data": {
    "organizationId": "organization_id",
    "organizationName": "Acme Technologies",
    "slug": "acme-technologies",
    "databaseName": "tenant_acme_technologies",
    "status": "active",
    "owner": {
      "userId": "user_id",
      "name": "John Doe",
      "email": "john@acme.com",
      "role": "owner"
    }
  }
}
```

Extend the response with company details if useful, but keep the existing fields stable.

The response must never include the owner's password or password hash.

### Registration authentication decision

The current registration endpoint creates an owner but does not issue a JWT.

Preserve that behavior initially.

After successful registration, show a success message and direct the user to the login screen.

Do not automatically authenticate the owner unless the backend response and frontend flow are deliberately changed together.

---

# 6. Phase 4 — Complete the Frontend Registration Form

File:

`Frontend/src/pages/OrganizationRegistration.tsx`

Currently, the form stores company details in local React state, but it only implements the first step.

Complete the three-step flow.

## 6.1 Step 1 — Company Details

Collect:

| Field | Frontend state key | Backend key |
|---|---|---|
| Company Name | companyName | name |
| Official Company Email | companyEmail | companyEmail |
| Company Domain | companyDomain | companyDomain |
| Contact Number | contactNumber | contactNumber |
| Company Size | companySize | companySize |
| Company Address | companyAddress | companyAddress |

Keep the current company size options.

Add validation before allowing the user to continue.

Validation should include:

- Required fields.
- Valid company email.
- Valid domain.
- Valid contact number.
- Valid company size.
- Non-empty address.

Show field-specific validation messages.

Do not clear entered values when navigating between steps.

## 6.2 Step 2 — Owner Account

Add a second form step.

Collect:

- Owner Name.
- Owner Email.
- Password.
- Confirm Password.

Use the following frontend state structure:

```ts
const [ownerDetails, setOwnerDetails] = useState({
  ownerName: "",
  ownerEmail: "",
  ownerPassword: "",
  confirmPassword: ""
});
```

Validation:

- Owner name is required.
- Owner email must be valid.
- Password must meet backend password requirements.
- Confirm password must match.
- Do not send confirmPassword to the backend.

Provide a show/hide password option if consistent with the existing login design.

## 6.3 Step 3 — Review

Display all collected information.

Sections:

**Company Information**
- Company name.
- Company email.
- Domain.
- Contact number.
- Company size.
- Address.

**Owner Information**
- Owner name.
- Owner email.

Never display the password.

Allow users to navigate back and edit information.

Add a final Register Organization button.

## 6.4 Registration API submission

Import the existing API method:

```ts
import { registerOrganization } from "../services/api";
```

Construct the request using the exact backend contract:

```ts
{
  name: companyDetails.companyName,
  companyEmail: companyDetails.companyEmail,
  companyDomain: companyDetails.companyDomain,
  contactNumber: companyDetails.contactNumber,
  companySize: companyDetails.companySize,
  companyAddress: companyDetails.companyAddress,
  ownerName: ownerDetails.ownerName,
  ownerEmail: ownerDetails.ownerEmail,
  ownerPassword: ownerDetails.ownerPassword
}
```

On submission:

1. Set loading state.
2. Disable repeated submissions.
3. Call `registerOrganization()`.
4. Display backend validation errors clearly.
5. On success, show confirmation.
6. Provide a button to return to the login screen.
7. Do not submit twice if the user double-clicks.
8. Do not log passwords or sensitive request data.

Handle network failures and server errors.

---

# 7. Phase 5 — Update Frontend API Service

File:

`Frontend/src/services/api.ts`

This file already contains:

- API base URL.
- User interface.
- LoginResponse.
- DashboardResponse.
- ApiError.
- Shared request function.
- loginUser().
- getCurrentUser().
- getDashboardOverview().
- registerOrganization().
- logoutUser().

Preserve this centralized API structure.

## 7.1 Update registration input type

Create a named interface:

```ts
export interface RegisterOrganizationInput {
  name: string;
  companyEmail: string;
  companyDomain: string;
  contactNumber: string;
  companySize: "1-10" | "11-50" | "51-200" | "201-500" | "500+";
  companyAddress: string;

  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
}
```

Update `registerOrganization()` to accept this interface.

## 7.2 Improve API response typing

Avoid `unknown` where the response structure is known.

Create a typed registration response matching the backend contract.

Maintain the shared ApiResponse wrapper.

## 7.3 Request helper

Review the existing request helper.

Ensure:

- Authorization header is attached when a token exists.
- JSON responses are parsed safely.
- Non-JSON server responses do not crash the frontend.
- Network errors have useful messages.
- HTTP status codes remain available through ApiError.
- Content-Type is set appropriately for JSON requests.

Do not introduce Axios or another HTTP client unnecessarily. The current Fetch-based implementation is sufficient.

## 7.4 Token handling

Continue using the existing token key:

`ledgerguard_token`

Do not introduce a second token key or multiple competing token storage mechanisms.

---

# 8. Phase 6 — Authentication Persistence and Application Flow

Files:

- `Frontend/src/pages/EntryPortal.tsx`
- `Frontend/src/pages/Login.tsx`
- `Frontend/src/services/api.ts`
- Optionally introduce `Frontend/src/context/AuthContext.tsx` if justified.

The current EntryPortal checks whether a token exists in sessionStorage.

However, the existence of a token does not prove that it is valid.

## 8.1 Initial application loading

When the application starts:

1. Read the stored JWT.
2. If no token exists, display the entry portal.
3. If a token exists, call `GET /api/auth/me`.
4. If the request succeeds, restore the authenticated user.
5. If the token is invalid or expired, clear it and show the entry portal.
6. If the backend is temporarily unavailable, show an appropriate recoverable error rather than silently treating the user as logged out.

Avoid showing the dashboard before authentication validation finishes.

Use a loading state.

## 8.2 Login flow

The existing Login component already calls `loginUser()`.

Preserve the existing implementation.

After successful login:

- Store the JWT.
- Update authenticated state.
- Load current user information.
- Display the organization dashboard.

Ensure errors from the backend are visible.

## 8.3 Logout flow

On logout:

1. Remove `ledgerguard_token`.
2. Clear authenticated user state.
3. Clear organization-specific frontend data.
4. Return to the entry portal.

## 8.4 Employee and company login

Both existing company and employee login options may use the same authentication endpoint.

The backend identifies the actual role through the authenticated user record.

Do not trust a role selected or sent by the frontend.

New employee accounts should remain unavailable through public self-registration unless an invitation/administrator-based registration feature is implemented separately.

---

# 9. Phase 7 — Dashboard Integration

Files:

- `backend/src/services/dashboardService.ts`
- `backend/src/controllers/dashboardController.ts`
- `Frontend/src/services/api.ts`
- `Frontend/src/pages/CompanyDashboard.tsx`

The existing dashboard endpoint is:

`GET /api/dashboard/overview`

It already returns:

- Organization details.
- Current user details.
- Total users.
- Active users.
- Inactive users.

Preserve this endpoint and its existing response structure.

## 9.1 Extend dashboard organization data

Add these fields to the organization section:

```ts
{
  id: string;
  name: string;
  slug: string;
  companyEmail: string;
  companyDomain: string;
  contactNumber: string;
  companySize: string;
  companyAddress: string;
  status: string;
  createdAt: string;
}
```

Update the Mongoose `.select()` fields accordingly.

Update `DashboardResponse` in the frontend.

## 9.2 Display company details

In CompanyDashboard.tsx, extend the Organization Details panel to display:

- Company name.
- Company email.
- Company domain.
- Contact number.
- Company size.
- Company address.
- Organization status.
- Organization slug.

Keep Account Details separate.

Continue displaying actual statistics returned by the backend.

Do not add hardcoded users, transactions, balances, revenue or financial activity.

Those features must be connected to real backend functionality before being displayed as real data.

## 9.3 Role-based dashboard navigation

The intended dashboard is an Organization Dashboard for:

- owner
- admin
- member

The current Sidebar includes labels such as Platform Console and Super Admin, which do not match this architecture.

Update the terminology to Organization Dashboard.

Recommended role behavior:

**Owner**
- View dashboard.
- Manage organization settings.
- Manage users.
- View organization information.

**Admin**
- View dashboard.
- Manage permitted organization users.
- Access permitted organization settings.

**Member**
- View dashboard information allowed to members.
- Access personal account information.

Enforce permissions in backend middleware and endpoints, not only by hiding frontend navigation items.

Do not implement management permissions without defining and testing the corresponding backend routes.

---

# 10. Phase 8 — Registration and Authentication Error Handling

Use consistent response structures throughout the backend.

Suggested error response:

```json
{
  "success": false,
  "message": "A useful error message"
}
```

Handle:

- Missing fields.
- Invalid email.
- Invalid company domain.
- Invalid phone number.
- Unsupported company size.
- Invalid password.
- Password confirmation mismatch (frontend).
- Duplicate owner email.
- Duplicate organization slug.
- Invalid or expired JWT.
- Inactive user.
- Suspended organization.
- Missing tenant.
- MongoDB connection errors.
- Unexpected server errors.

Avoid exposing database connection strings, password hashes, stack traces or internal infrastructure details to the frontend.

---

# 11. Phase 9 — API Testing

Test using Postman before declaring integration complete.

## 11.1 Organization registration

**Request**

POST `/api/organizations/register`

Test cases:

1. Valid company registration.
2. Missing company name.
3. Invalid company email.
4. Invalid domain.
5. Invalid contact number.
6. Unsupported company size.
7. Missing company address.
8. Missing owner name.
9. Invalid owner email.
10. Weak password.
11. Duplicate owner email.
12. Duplicate organization slug.
13. Tenant initialization failure.

Verify successful registration creates:

- One Organization document.
- One User document with role owner.
- One Tenant document.
- Tenant metadata in the corresponding tenant database.

Verify the owner password is stored only as a hash.

## 11.2 Login

POST `/api/auth/login`

Test:

- Correct credentials.
- Incorrect password.
- Unknown email.
- Inactive user.
- Suspended organization.
- Unavailable tenant.

## 11.3 Current user

GET `/api/auth/me`

Test:

- Valid JWT.
- Missing JWT.
- Invalid JWT.
- Expired JWT.
- Inactive user.
- User belonging to a suspended organization.

## 11.4 Dashboard overview

GET `/api/dashboard/overview`

Test:

- Owner access.
- Admin access.
- Member access.
- Organization isolation.
- Correct user statistics.
- Newly added organization fields.

---

# 12. Phase 10 — Frontend Integration Testing

Test the entire user journey from a clean browser session.

### Flow A — New organization

1. Open LedgerGuard.
2. Select Register New Company.
3. Enter company details.
4. Continue to owner account.
5. Enter owner information.
6. Continue to review.
7. Verify all information.
8. Submit registration.
9. Receive success message.
10. Navigate to login.

### Flow B — Organization owner login

1. Enter owner credentials.
2. Submit login.
3. Receive JWT.
4. Validate current user.
5. Open dashboard.
6. Confirm correct company details.
7. Confirm user role is owner.

### Flow C — Session persistence

1. Login.
2. Refresh the browser.
3. Confirm the authenticated session is restored.
4. Confirm dashboard data loads.
5. Log out.
6. Refresh again.
7. Confirm the user is returned to the entry portal.

### Flow D — Existing organizations

Verify that previously created organizations still work after the schema changes.

Do not break Acme, Beta or other existing test organization accounts.

### Flow E — Tenant isolation

Verify that a user from Organization A cannot access Organization B's data.

Never trust organizationId supplied by the frontend for authenticated organization-specific requests. Use the authenticated user's organizationId from the verified JWT/user record.

---

# 13. Phase 11 — Remaining Frontend Work Audit

After registration and authentication integration, inspect the remaining dashboard sections.

Current Sidebar items include:

- Dashboard
- Organizations
- All Users
- Tenants
- Analytics
- Activity Logs
- Reports
- Settings

Some of these currently display placeholder content.

Create a separate implementation backlog.

For each section, identify:

1. Whether a frontend page already exists.
2. Whether a backend model exists.
3. Whether an API endpoint exists.
4. Whether the API is connected.
5. Whether role-based permissions are required.
6. What is missing.

Do not invent financial data or implement placeholder API responses just to make a page look functional.

Prioritize user management and organization settings after the registration flow is complete.

Transaction analytics, ledger reports and financial activity must be integrated only when their backend functionality is ready.

---

# 14. Recommended Implementation Order

Follow this exact order to avoid breaking existing work.

| Phase | Work | Priority |
|---|---|---|
| 1 | Organization schema and migration | Critical |
| 2 | Provisioning service and controller | Critical |
| 3 | Registration API contract and Postman tests | Critical |
| 4 | Registration form Steps 2 and 3 | Critical |
| 5 | Frontend API types and registration connection | Critical |
| 6 | Authentication restoration and logout | High |
| 7 | Dashboard company details | High |
| 8 | Role-based navigation and permission audit | High |
| 9 | Full frontend/backend integration tests | Critical |
| 10 | Remaining dashboard section audit | Medium |

Do not start Phase 4 before the backend request contract is finalized.

Do not start dashboard enhancements before the backend response shape is finalized.

---

# 15. Important Technical Rules for the AI

Follow these rules throughout implementation:

1. Inspect the existing file before editing it.
2. Do not assume code matches an earlier conversation or an older ZIP.
3. Preserve working authentication, tenant provisioning and dashboard functionality.
4. Do not rewrite the entire project.
5. Do not create duplicate models, routes, interfaces or API functions.
6. Reuse existing services and components wherever possible.
7. Keep backend and frontend field names consistent.
8. Use TypeScript types rather than unnecessary `any`.
9. Keep the frontend and backend request/response contracts aligned.
10. Never expose passwords or password hashes.
11. Never hardcode organization IDs, user IDs or financial data.
12. Do not trust organization IDs or roles sent by the frontend for authorization.
13. Preserve the existing central database and tenant database architecture.
14. Do not delete existing Atlas databases or collections.
15. Do not introduce new dependencies unless necessary.
16. Do not change UI design unnecessarily; prioritize functionality and preserve the existing visual style.
17. Do not implement public employee self-registration.
18. Do not automatically issue a JWT during registration unless explicitly agreed and implemented consistently on both sides.
19. Avoid changing unrelated Week 2 ledger functionality.
20. Run TypeScript checks and builds after each logical implementation phase.

### Build verification

Backend:

```bash
npm run build
```

Frontend:

```bash
npm run build
```

If either build fails:

- Inspect the complete error output.
- Identify all related errors.
- Fix related type/interface/import issues together.
- Re-run the complete build.
- Do not repeatedly patch only the first displayed error without checking the surrounding implementation.

---

# 16. Definition of Done

The integration will be considered complete only when all of these conditions are met.

### Backend

- [ ] Organization schema contains all company information fields.
- [ ] Existing organization records are handled safely.
- [ ] Provisioning accepts and persists all company fields.
- [ ] Owner account is created correctly.
- [ ] Tenant provisioning continues to work.
- [ ] Registration API returns the agreed response.
- [ ] Duplicate and validation errors are handled correctly.
- [ ] Dashboard API returns all company details.
- [ ] Existing authentication and organization isolation still work.

### Frontend

- [ ] Company details form works.
- [ ] Owner account form works.
- [ ] Review step works.
- [ ] Registration API is connected.
- [ ] Loading, validation and server error states work.
- [ ] Successful registration directs the user to login.
- [ ] Login works.
- [ ] JWT is validated when the application starts.
- [ ] Logout clears the session.
- [ ] Dashboard displays real organization details.
- [ ] Role and navigation terminology match the organization-dashboard architecture.

### Final verification

- [ ] Backend build passes.
- [ ] Frontend build passes.
- [ ] Registration tested through the UI.
- [ ] Login tested through the UI.
- [ ] Dashboard tested through the UI.
- [ ] Existing organizations remain functional.
- [ ] Tenant isolation verified.
- [ ] No secrets or sensitive data exposed.

---

# 17. Instructions for Starting the Work

Start by performing a read-only audit of the current project.

Return:

1. Current implementation status.
2. Files that need changes.
3. Existing code that should be preserved.
4. Any additional issues discovered.
5. Exact implementation order.

Then implement Phase 1 through Phase 3 together.

After that:

- Run the backend build.
- Test the registration endpoint.
- Verify MongoDB documents.
- Report changed files and test results.

Proceed to frontend registration only after the backend contract is stable.

Work in logical batches. Avoid making unrelated changes or rewriting working modules.

**Final objective:** A fully integrated LedgerGuard organization onboarding and authentication flow in which a company can register with its complete information, create its first owner account, provision its tenant database, log in securely, and view accurate organization-specific dashboard information.