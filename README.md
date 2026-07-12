# Stock & Inventory Management Web App

A premium, secure, full-stack Stock & Inventory Management system built with Next.js (App Router), MongoDB Atlas, Mongoose, NextAuth (Credentials provider), and Cloudflare R2 object storage.

---

## Technical Stack & Features

- **Next.js (App Router)**: Fast, dynamic pagination and server-side search rendering.
- **MongoDB Atlas & Mongoose**: Flexible document model representing inventory items with indexed fields (`partNo`, `machineName`, and `createdAt` descending) for efficient querying.
- **NextAuth (Auth.js)**: Cookie-secured administrative view restricting create/update/delete API routes via centralized `src/middleware.js`.
- **Ant Design UI**: Clean, premium responsive screens providing interactive search controls, forms, bulk delete actions, and modals.
- **Cloudflare R2 Direct Uploads**: Client-side photo resizing (~1600px Max, target under 400KB WebP) using `browser-image-compression` and direct uploads to R2 using short-lived Presigned PUT URLs, preventing server bandwidth/Vercel size limitations.
- **Excel Bulk Import**: Server-side worksheet compiler (`xlsx`) with normalized header matching matching aliases and ordered insert recovery.
- **Clean Dev Testing**:
  - Jest & React Testing Library for isolated unit/components validation.
  - Playwright for end-to-end integration flows.

---

## Environment Setup

Create a `.env` file at the root directory based on the `.env.example` template:

```ini
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/stock-management
NEXTAUTH_SECRET=<generate_with_openssl_rand_base64_32>
NEXTAUTH_URL=http://localhost:3000

# Cloudflare R2 Storage (S3 API compliance)
R2_ACCOUNT_ID=<cloudflare_r2_account_id>
R2_ACCESS_KEY_ID=<cloudflare_access_key>
R2_SECRET_ACCESS_KEY=<cloudflare_secret_key>
R2_BUCKET_NAME=<r2_bucket_name>
R2_PUBLIC_BASE_URL=https://pub-xxxxxx.r2.dev
R2_PUBLIC_HOSTNAME=pub-xxxxxx.r2.dev

# Admin Seed Account
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=AdminSecurePassword123!
```

---

## Step-by-Step Installation

### 1. Database Setup
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Deploy a new shared database cluster (free M0 tier).
3. Under **Database Access**, create a user with read/write privileges.
4. Under **Network Access**, allow IP `0.0.0.0/0` (standard for serverless deployments like Vercel).
5. Obtain your application connection string and paste it into `MONGODB_URI`.

### 2. Cloudflare R2 Object Store Setup
1. Log into your Cloudflare dashboard and navigate to **R2**.
2. Click **Create Bucket** and select a unique name (paste in `R2_BUCKET_NAME`).
3. Under the Bucket settings, click **Connect Domain** or enable the **R2 Public Dev Domain** to allow public object reads, pasting that hostname target link into `R2_PUBLIC_BASE_URL` (e.g. `https://pub-xxxxx.r2.dev`) and hostname to `R2_PUBLIC_HOSTNAME` (e.g., `pub-xxxxx.r2.dev`).
4. Click **Manage R2 API Tokens** from the R2 navigation home screen.
5. Create a new token with **Edit** permissions, copy the `Access Key ID` and `Secret Access Key` into your env configuration.

### 3. Seed Admin Credentials
To populate the single initial administrative user, execute the database seed runner:
```bash
npm run create-admin
```
This utility hashes the password using `bcryptjs` and securely upserts the account document into your MongoDB cluster.

### 4. Running the Local Dev Instance
```bash
# Install NPM dependencies
npm install

# Start Next.js Development Server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside your web browser.

---

## Running Test Suites

We enforce two types of validation suites that run in isolation:

### Unit & Component Tests (Jest)
Validates query-building methods, import header schema-matching, and isolated component rendering hooks:
```bash
npm run test
```

### End-to-End Tests (Playwright)
Executes Chrome headless instances performing admin sign-in, item additions, searching, editing, and bulk deletion under local port conditions:
```bash
# Installs Chromium binaries (required first time)
npx playwright install chromium

# Runs playwrite testing framework
npm run test:e2e
```

---

## Deploying to Vercel

1. Push your code repository clone online (GitHub, GitLab, or Bitbucket).
2. Connect your repository on the [Vercel Dashboard](https://vercel.com).
3. Import your project as a standard **Next.js** framework target.
4. Copy all credentials from your local `.env` and paste them into Vercel's **Environment Variables** panel in deployment configuration.
5. Click **Deploy**. Vercel will build, optimize static files, and host the Next.js routes seamlessly.
