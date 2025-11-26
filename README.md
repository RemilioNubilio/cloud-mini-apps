# 🚀 Cloud Mini Apps - Turborepo Monorepo

A Turborepo monorepo for managing multiple mini apps with independent deployments to Vercel.

## 📁 Structure

```
cloud-mini-apps/
├── apps/
│   └── clone-ur-crush/      # Clone Ur Crush app
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── eslint-config/       # ESLint configs
│   └── typescript-config/   # TypeScript configs
├── .env.example             # Environment variables template
└── README.md
```

## ⚡ Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

```bash
# Copy the example and fill in your values
cp .env.example .env

# Edit .env with your actual values:
# - BLOB_READ_WRITE_TOKEN (from Vercel Blob Storage)
# - ELIZA_CLOUD_API_KEY (from Eliza Cloud)
```

### 3. Run Development Server

```bash
npm run dev
# App runs at http://localhost:3002
```

## 🔐 Environment Variables

Required variables (see `.env.example` in root):

```bash
NEXT_PUBLIC_ELIZA_CLOUD_URL=http://localhost:3000
CLONEURCRUSH_ELIZA_API_KEY=your-api-key
```

**Note:** `BLOB_READ_WRITE_TOKEN` is automatically provided by Vercel when you connect Blob Storage in production.

All environment variables are prefixed with `CLONEURCRUSH_` for clarity and to prevent conflicts when adding more mini apps.

## 🌐 Deploying to Vercel

1. **Push to GitHub**

   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Import your repository
   - **Set Root Directory:** `apps/clone-ur-crush`
   - Deploy

3. **Add Environment Variables**
   - Settings → Environment Variables
   - Add all variables from `.env.example`
   - Connect Vercel Blob Storage (token auto-added)

4. **Configure Custom Domain**
   - Settings → Domains
   - Add your domain

## 🛠️ Commands

```bash
npm run dev         # Run all apps
npm run build       # Build all apps
npm run lint        # Lint all apps
npm run check-types # Type check
```

## 🆕 Adding a New App

```bash
# Copy clone-ur-crush as template
cp -r apps/clone-ur-crush apps/new-app

# Update package.json name and port
# Add app-specific env vars to root .env
# Install and run
npm install
cd apps/new-app && npm run dev
```

## 📦 Packages

### `@repo/ui`

Shared React components used across apps.

### `@repo/eslint-config` & `@repo/typescript-config`

Shared linting and TypeScript configurations.

## 🔗 Tech Stack

- **Framework:** [Next.js 15+](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Build:** [Turborepo](https://turbo.build/)
- **Validation:** [Zod](https://zod.dev/)
- **Deployment:** [Vercel](https://vercel.com/)

---

**Questions?** Check the app-specific README in `apps/clone-ur-crush/` or open an issue.
