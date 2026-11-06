# Trivllo Turborepo Monorepo

Enterprise-grade Next.js serverless monorepo powered by **Turborepo**, **oRPC**, **BetterAuth**, **Mongoose**, and **Cloudinary**.

---

## 🏛 Architecture Overview

No standalone Express backend server is needed anymore. All backend logic is unified into serverless procedures running directly inside Next.js Route Handlers (`/api/orpc/[...rest]` and `/api/auth/[...all]`).

```
trivllo/
├── apps/
│   ├── user/              # User-facing Next.js portal (Port 3000)
│   ├── vendor/            # Vendor dashboard Next.js portal (Port 3001)
│   └── admin/             # Admin & CMS Next.js portal (Port 3002)
│
├── packages/
│   ├── ui/                # Shared frontend shadcn UI components (60+ components)
│   ├── types/             # Domain & separate Employee schemas (Zod + TS)
│   ├── database/          # Next.js serverless cached Mongoose connection + 37 models
│   ├── betterauth/        # BetterAuth serverless handler, client & role guards
│   ├── cloudinary/        # Direct upload signatures & serverless Cloudinary SDK
│   ├── orpc/              # End-to-end type-safe oRPC procedures & routers
│   ├── eslint-config/     # Shared ESLint rules
│   ├── tailwind-config/   # Shared Tailwind v4 configuration
│   └── typescript-config/ # Shared TypeScript base & Next.js configs
```

---

## 👥 Employee Role Separation Schemas (`@repo/types`)

Clean, decoupled role schemas with dedicated oRPC procedures:

| Role | Schema Location | Target Workflows |
|---|---|---|
| **Blog Editor** | `@repo/types/employee/blog-editor.schema` | Lexical CMS, post drafts, revision snapshots, categories, media metadata |
| **Reviewer** | `@repo/types/employee/reviewer.schema` | Review moderation, spam flagging, property approval decisions & checklist |
| **SEO Manager** | `@repo/types/employee/seo.schema` | Page metadata, Google Indexing API submission, 301/302 redirects, SEO audit |
| **Analyst** | `@repo/types/employee/analyst.schema` | Revenue metrics, booking status counts, cancellation rates, cohort analysis, report exports |

---

## 🚀 Port Map & Scripts

| App | Port | Dev Command |
|---|---|---|
| `apps/user` | `3000` | `npm run dev:user` |
| `apps/vendor` | `3001` | `npm run dev:vendor` |
| `apps/admin` | `3002` | `npm run dev:admin` |

To run all apps simultaneously:
```bash
npm run dev
```

---

## ⚡ Serverless API Route Handlers

Each app has two root serverless handlers:
- **BetterAuth**: `src/app/api/auth/[...all]/route.ts`
- **oRPC**: `src/app/api/orpc/[...rest]/route.ts`

### Example: Calling oRPC on the client
```typescript
import { orpc } from "@repo/orpc/client";

// Fully type-safe with autocomplete:
const result = await orpc.blog.getPublishedPosts({ page: 1, limit: 10 });
const stats = await orpc.analytics.getDashboardOverview({ preset: "last_7_days" });
```
