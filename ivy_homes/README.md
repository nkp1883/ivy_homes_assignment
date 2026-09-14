# Ivy Homes Frontend

A frontend implementation of the Ivy Homes Software Engineering Internship assignment.

The application is a property marketplace built around the existing Ivy Homes API. It provides authentication, property discovery, filters, listing details, saved listings, rentals, projects, and a client-facing market insights dashboard.

## Table of Contents

- [Live Demo](#live-demo)
- [GitHub Repository](#github-repository)
- [Tech Stack](#tech-stack)
- [How to Run](#how-to-run)
- [Application Routes](#application-routes)
- [API Investigation](#api-investigation)
- [What I Distrusted and How I Verified It](#what-i-distrusted-and-how-i-verified-it)
- [Hypotheses That Did Not Pan Out](#hypotheses-that-did-not-pan-out)
- [What I Checked That Turned Out to Be Fine](#what-i-checked-that-turned-out-to-be-fine)
- [Assignment Answers](#assignment-answers)
- [Data Findings Used in the Application](#data-findings-used-in-the-application)
- [Insights Dashboard](#insights-dashboard)
- [Saved Listings](#saved-listings)
- [Architecture](#architecture)
- [API Behaviour Summary](#api-behaviour-summary)
- [LLM Disclosure](#llm-disclosure)
- [What I Would Do With Another Two Days](#what-i-would-do-with-another-two-days)
- [Development Workflow](#development-workflow)
- [Notes](#notes)

---

## Live Demo

Demo URL: https://ivy-homes-assignment-swart.vercel.app/

## GitHub Repository

Repository: https://github.com/nkp1883/ivy_homes_assignment

## Tech Stack

- React
- Vite
- JavaScript
- Tailwind CSS
- Axios
- React Router
- Context API
- Local Storage for client-side authentication/session persistence
- Recharts

This is a frontend-only implementation. No custom backend, Express server, MongoDB database, or additional API layer was introduced.

---

## How to Run

### Prerequisites

- Node.js 18+ recommended
- npm

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/nkp1883/ivy_homes_assignment
cd ivy_homes_assignment/ivy_homes
npm install
```

Create a `.env` file in the project root:

```
VITE_IVY_API_URL=https://solve.ivy.homes
VITE_IVY_API_KEY=YOUR_API_KEY
```

The API key is supplied with the assignment.

Do not commit `.env`. It is excluded through `.gitignore`.

### Start the development server

```bash
npm run dev
```

The application will normally be available at:

`http://localhost:5173`

### Production build

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## Application Routes

| Route | Purpose |
|---|---|
| `/login` | Authentication |
| `/insights` | Market analytics dashboard |
| `/listings` | Browse sale listings |
| `/listings/:listingId` | Listing details |
| `/rentals` | Browse rental listings |
| `/rentals/:listingId` | Rental details |
| `/projects` | Browse projects |
| `/projects/:projectId` | Project details |
| `/saved` | Saved listings |

Protected application routes require authentication.

---

## API Investigation

The API documentation was treated as a starting point rather than as an unquestionable specification.

The documentation itself states that it is AI-generated and unreviewed and that the running API should be treated as the source of truth. I therefore validated the important documented behaviours directly against the running API before building the frontend around them.

The investigation used the assignment reference timestamp:

`2026-09-10T00:00:00+05:30`

The general approach was:

1. Read the API documentation and list the assumptions it made.
2. Test authentication and request headers independently.
3. Test collection endpoints with small requests.
4. Test pagination using both documented and alternative parameters.
5. Test filters and sorting independently.
6. Test individual detail endpoints using IDs known to exist in collection responses.
7. Test favourites and analytics separately.
8. Extract the available datasets and compare counts and fields.
9. Use the observed behaviour to decide which frontend assumptions were safe.

This prevented the frontend from depending on behaviours that existed only in the documentation.

---

## What I Distrusted and How I Verified It

### 1. API key location

The documentation described the API key as a query parameter.

I tested this against the running API and found that the working authentication mechanism was:

```
X-API-Key: <API_KEY>
```

The frontend therefore attaches the API key through the `X-API-Key` request header.

### 2. Login response shape

The documentation described a `token` field.

The actual login response returned:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "Bearer",
  "expires_in": 900,
  "refresh_url": "/auth/refresh",
  "user": {
    "email": "..."
  }
}
```

The frontend therefore uses `access_token` and `refresh_token`, rather than assuming the documented `token` field.

### 3. Token lifetime and refresh

The documentation described a much longer access-token lifetime and did not describe the refresh flow accurately.

The running API returned:

- `expires_in = 900 seconds`

and provided:

- `/auth/refresh`

The refresh endpoint rotates the access and refresh tokens.

The frontend therefore:

- stores both tokens,
- attaches the access token as a Bearer token,
- refreshes proactively before expiry,
- retries requests after an authentication failure,
- clears the local session if refresh fails.

### 4. Logout semantics

I tested whether logout actually invalidated the existing access token server-side.

The logout response indicated that tokens were stateless and should be discarded client-side. An already-issued access token remained usable after logout.

The frontend therefore treats logout as a client-side session operation and clears the stored tokens and user state.

### 5. Pagination

The documentation described page/limit pagination.

Testing showed that offset/limit is the useful pagination mechanism.

For example:

```
offset=0
offset=50
offset=100
...
```

produced different sections of the collection, while changing `page` did not behave as expected.

The effective API page size was also 50, even when a larger limit was requested.

The frontend therefore uses offset pagination and respects the effective 50-record API ceiling.

### 6. Collection totals

The documented `total` field was not treated as an unquestionable count.

For listings, the API reported a total of 3488, while traversing the collection using offset pagination produced 3800 retrievable records, with the final page ending at offset 3790.

The frontend therefore uses the pagination continuation information when fetching the complete collection rather than assuming the reported total is always authoritative.

### 7. Sorting

Descending sorting was tested rather than assumed to work because it was documented by the API.

The observed server-side descending sort behaviour was unreliable.

For this reason, the frontend performs the user-visible sorting locally after fetching the records.

### 8. Analytics endpoint

The documented:

```
GET /v1/analytics/summary
```

was tested directly and returned 404.

Rather than showing an empty dashboard or displaying fabricated documentation example values, the Insights page computes the documented analytics concepts from the actual listing records already available to the frontend.

This includes:

- total listings,
- median price,
- median price per square foot,
- locality-level listing counts,
- locality-level median prices,
- BHK distribution.

The API investigation detail remains in this README rather than being exposed as an error to the end user.

### 9. Saved listings endpoints

The documented favourites endpoints were tested and returned 404.

During further API investigation, I discovered that the running API exposes the working `/v1/saved` endpoint instead.

The frontend therefore uses the backend saved-listings API rather than a Local Storage workaround. Saved listings are associated with the authenticated user and support:

- fetching the user's saved listings,
- adding a listing to saved listings,
- removing a listing from saved listings,
- persistence after page refresh,
- persistence after logging out and logging back in.

The frontend keeps authentication tokens in the client session, while saved-listing state is retrieved from the API through `GET /v1/saved`.

---

## Hypotheses That Did Not Pan Out

Several early hypotheses were deliberately tested rather than accepted from intuition:

- **Locality filtering might be ignored by the API:** it worked and was case-insensitive.
- **BHK filtering might be ignored:** it worked.
- **Furnishing filtering might be ignored:** it worked.
- **Repeated contact details might prove fake listings:** repeated contacts alone were not sufficient evidence.
- **A coarse duplicate fingerprint might identify exact duplicate properties:** deeper inspection showed the apparent matches were different physical properties.
- **Every collection listing should have a working detail endpoint:** this was not true, so the frontend handles detail failures gracefully.

---

## What I Checked That Turned Out to Be Fine

An important part of the investigation was not only finding inconsistencies, but also testing assumptions that did not fail.

### Authentication with the correct API key

Once the API key was sent through the correct `X-API-Key` header, the authentication flow worked.

Login returned usable access and refresh tokens, so there was no need to build a workaround around authentication.

### Bearer authentication

Authenticated API requests worked with:

```
Authorization: Bearer <access_token>
```

This became the standard request behaviour in the Axios client.

### Token refresh

The refresh endpoint worked and returned a new access token and refresh token.

This allowed the frontend to implement a real session-refresh mechanism instead of treating the 15-minute access token as a permanent session.

### Locality filtering

Listing locality filtering worked and was case-insensitive.

The frontend still performs filtering locally so that the visible results remain deterministic and consistent with the UI filters.

### BHK filtering

The listing API correctly responded to BHK filtering during testing.

The frontend also applies the filter locally to keep the UI behaviour predictable.

### Furnishing filtering

Furnishing filtering worked as expected during API testing.

### Listing details

The singular listing detail endpoint worked for valid records that were available through the endpoint.

Some IDs returned by the collection endpoint did return 404 when their individual detail endpoint was requested. The frontend handles that case gracefully instead of assuming every collection record has a corresponding detail response.

### Rental endpoints

The rental collection and detail endpoints were usable.

Pagination, locality, BHK, and furnishing behaviour were tested and incorporated into the frontend.

### Project endpoints

The project collection and detail endpoints were usable.

Locality and status filtering were tested and incorporated into the application.

### Listing IDs

The extracted listing dataset contained unique listing IDs within the collection.

### Rental IDs

Rental IDs were also unique within the extracted rental collection.

### Project IDs

Project IDs were unique within the extracted project collection.

### Physical-property duplicate check

A coarse duplicate fingerprint initially produced a few possible duplicate groups.

Those records were inspected using additional property attributes. The suspected matches turned out to represent different physical properties rather than exact duplicate properties.

Using the more complete physical-property fingerprint resulted in:

```
3800 unique fingerprints
0 exact duplicate groups
```

This was a useful example where an initial hypothesis did not survive deeper inspection.

### Suspicious-price investigation

Very low prices were not automatically treated as fake listings.

The data was grouped by locality and bedroom count and compared against the median price of comparable listings. This produced a small set of suspiciously low-priced records.

Other attributes such as verification, live status, and posting source were considered as supporting context rather than proof that a listing was fake.

---

## Assignment Answers

The calculations were performed against the exhaustively retrieved datasets and the assignment reference timestamp.

| Question | Answer |
|---|---|
| Q1 | 3800 |
| Q2 | 3800 |
| Q3 | 2998 |
| Q4 | 14 |
| Q5 | ₹5,553,900 monthly rent |
| Q6 | ₹18,334.20/sqft |
| Q7 | P30175, Godrej Residency, ₹28,200,000 |
| Q8 | 128 |
| Q9 | 7 |
| Q10 | 317 |

### Calculation notes

- **Q2:** A complete physical-property fingerprint was used. It produced 3800 unique fingerprints and 0 exact duplicate groups.
- **Q4:** 14 distinct records violated the tested sanity rules: 7 had `floor > total_floors` and 7 had non-positive prices. Zero values in other fields were not automatically classified as corrupt.
- **Q5:** The assigned locality was Kharadi; monthly rent was summed across the relevant rental records.
- **Q6:** The arithmetic mean of `price / carpet_area` was calculated for live 2-BHK listings after excluding Q4 and Q9 records and invalid price/area values.
- **Q7:** The project-level price field showed an integrity/unit inconsistency. The final answer was therefore based on the maximum listing-level price grouped by project, producing P30175 / Godrej Residency / ₹28,200,000.
- **Q8:** The time window was `[2026-09-03 00:00 IST, 2026-09-10 00:00 IST)`, producing 128 listings.
- **Q9:** A suspicious listing was defined using positive price `< 1%` of the median price for the same locality and bedroom count. This produced 7 suspects. Verification, live status, and posting source were used only as supporting context.
- **Q10:** Project `total_listings` values were compared with counts from all retrieved listings grouped by `project_id`, producing 317 mismatches.

---

## Data Findings Used in the Application

The Insights page focuses on information useful to a property user rather than exposing API implementation problems.

The underlying investigation established several useful market-level facts, including:

- 3800 listing records were retrievable through the listings collection.
- 2998 listings were marked as live.
- The dataset contains a range of BHK configurations and localities.
- Rental inventory can be analysed independently from sale inventory.
- Locality-level median prices can be calculated from the listing records.
- Price-per-square-foot statistics can be calculated when both price and carpet area are valid.
- Recent listing activity can be calculated from `posted_at`.

These are used to create the client-facing Insights dashboard.

---

## Insights Dashboard

The Insights screen is designed as a product-facing analytics page.

It includes:

| Section | Contents |
|---|---|
| **Market Overview** | Total listings · Median price · Median price per square foot · Live listing inventory |
| **Locality Analysis** | Listing count by locality · Median price by locality · Top localities by available inventory |
| **Property Mix** | BHK distribution · Number of listings for each BHK configuration |
| **Market Highlights** | Most listed locality · Highest median-price locality · Recent listing activity · Rental market snapshot |

The values are calculated from the fetched data rather than hardcoded from examples in the API documentation.

---

## Saved Listings

Saved listings use the working backend `/v1/saved` endpoint discovered during API investigation.

`SavedListingsContext` provides saved-listing state to the application, while the backend API remains the source of truth for the authenticated user's saved listings. The frontend does not use a localStorage-only saved-listing implementation.

---

## Architecture

The frontend is intentionally separated into a few simple layers:

```
ivy_homes_assignment/
└── ivy_homes/
    ├── node_modules/
    ├── public/
    ├── src/
    │   ├── api/
    │   ├── assets/
    │   ├── components/
    │   ├── context/
    │   ├── hooks/
    │   ├── pages/
    │   │   ├── Insights.jsx
    │   │   ├── ListingDetail.jsx
    │   │   ├── Listings.jsx
    │   │   ├── Login.jsx
    │   │   ├── NotFound.jsx
    │   │   ├── ProjectDetail.jsx
    │   │   ├── Projects.jsx
    │   │   ├── RentalDetail.jsx
    │   │   ├── Rentals.jsx
    │   │   └── Saved.jsx
    │   ├── utils/
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    │
    ├── .env
    ├── .gitignore
    ├── .oxlintrc.json
    ├── index.html
    ├── package.json
    ├── package-lock.json
    └── vite.config.js
```

### API layer

Axios is configured centrally so authentication headers and refresh behaviour do not have to be duplicated across pages.

### Authentication layer

AuthContext owns the current user, authentication state, login, logout, and token refresh lifecycle.

### Routing

React Router provides protected application routes and URL-addressable detail pages.

### Saved listings

SavedListingsContext provides saved-listing state to the application, with the backend `/v1/saved` endpoint providing persistence and per-user ownership.

### Client-side analytics

Analytics are calculated from the fetched records because the documented analytics endpoint is unavailable.

---

## API Behaviour Summary

| Area | Observed behaviour | Frontend approach |
|---|---|---|
| API key | `X-API-Key` header required | Axios default header |
| Login | `access_token` + `refresh_token` | Store both |
| Access token | 900 seconds | Proactive refresh |
| Refresh | Working, rotates tokens | Automatic refresh |
| Logout | Tokens are stateless | Clear local session |
| Listings pagination | Offset-based, effective limit 50 | Offset pagination |
| Listings total | Can under-report | Use `has_more` while fetching |
| Listings sorting | Descending server sort unreliable | Client-side sorting |
| Listings filters | Working | Client-side enforcement |
| Listing detail | Some collection IDs return 404 | Graceful detail fallback/error |
| Rentals | Collection/detail usable | Frontend integration |
| Projects | Collection/detail usable | Frontend integration |
| Favourites | 404 | Use discovered `/v1/saved` |
| Saved listings | `/v1/saved` works | Backend persistence |
| Analytics summary | 404 | Compute analytics in frontend |

---

## LLM Disclosure

LLM assistance was used during development for implementation support, debugging, code review, documentation drafting, and reasoning about API behaviour.

The API was independently tested against the running service, datasets were retrieved and analysed, assignment answers were calculated from the observed data, and the final implementation and submission decisions were reviewed by me.

No API behaviour was accepted solely because an LLM suggested it; the running API was treated as the operational source of truth.

---

## What I Would Do With Another Two Days

If I had another two days, I would focus on improving reliability, product quality, and testing rather than adding another large feature.

### 1. Automated testing

Add tests for the highest-risk areas:

- authentication and token refresh,
- protected routes,
- listing filters,
- sorting,
- pagination,
- saved-listing isolation,
- analytics calculations,
- detail-page error handling.

The API investigation revealed enough edge cases that automated regression tests would provide significant value.

### 2. Better API resilience

Introduce a more systematic API data-access layer with:

- request cancellation,
- retry rules for transient failures,
- better timeout handling,
- consistent response normalization,
- clearer distinction between network errors and unavailable resources.

### 3. Improve detail-page fallback

Some listing IDs exist in the collection but return 404 from the individual detail endpoint.

I would make the detail route first use any listing data already available locally and then attempt to enrich it with the detail endpoint. This would reduce unnecessary dead ends for users.

### 4. Improve search and filtering

Add:

- free-text property search,
- multi-select localities,
- more flexible price inputs,
- area filters,
- bedroom range,
- URL-persisted filters.

Persisting filters in the URL would also make filtered pages shareable.

### 5. Improve analytics

Expand the Insights screen with:

- price distribution,
- locality comparison,
- price-per-square-foot comparisons,
- BHK-specific pricing,
- rental-versus-sale comparisons,
- additional interactive charts.

### 6. Production-quality deployment and observability

I would add:

- production error monitoring,
- API latency/error tracking,
- structured frontend logging,
- a clearer deployment configuration,
- automated CI checks for build and tests.

### 7. Security improvements

For a production architecture, I would move the API-key-dependent communication behind a backend or server-side proxy so that credentials are not exposed in browser-delivered JavaScript.

That is deliberately outside the scope of this frontend-only assignment.

---

## Development Workflow

The project was developed incrementally rather than as one large final change.

The purpose of the commit history is to show the progression from API integration to the completed product rather than artificially increasing the number of commits.

---

## Notes

The application deliberately treats the running API as the operational source of truth when its behaviour differs from the written documentation.

The README records those discrepancies because understanding and validating the API was part of the assignment. The product UI, however, is designed around what is useful to the property user rather than exposing backend implementation details or investigation failures.