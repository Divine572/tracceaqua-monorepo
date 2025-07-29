# TracceAqua - Phase 1: Project Setup & Infrastructure

Let's build the complete monorepo structure step by step.

## 🚀 **Step 1: Initialize Monorepo with Turborepo**

```bash
# Create the monorepo
npx create-turbo@latest tracceaqua-monorepo --package-manager pnpm
cd tracceaqua-monorepo

# Clean up the default structure
rm -rf apps/docs apps/web packages/ui packages/eslint-config-custom packages/tsconfig

# Create our custom structure
mkdir -p packages/frontend packages/backend packages/contracts packages/shared
```

## 📝 **Step 2: Update Workspace Configuration**

Create/update these files in the root:

**pnpm-workspace.yaml**
```yaml
packages:
  - 'packages/*'
```

**turbo.json**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "test": {
      "dependsOn": ["^test"]
    }
  }
}
```

**package.json** (Update root)
```json
{
  "name": "tracceaqua-monorepo",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "clean": "turbo run clean",
    "format": "prettier --write \"**/*.{ts,tsx,md}\""
  },
  "devDependencies": {
    "@turbo/gen": "^1.10.0",
    "turbo": "latest",
    "prettier": "^3.0.0"
  },
  "packageManager": "pnpm@8.15.0"
}
```

## 🎨 **Why shadcn/ui for TracceAqua?**

**shadcn/ui** is the perfect choice for TracceAqua because:

### ✅ **Perfect for Our Blue Theme**
- Built-in color system with CSS variables
- **Slate** base color has blue undertones that complement our blue accent colors
- Easy to customize the primary/accent colors to TracceAqua blue afterwards
- The base color controls grays/neutrals, while we'll set blue as the primary accent

### ✅ **Built on the Right Foundation**
- **Radix UI Primitives** - Ensures accessibility and proper behavior
- **Tailwind CSS** - Utility-first styling that matches our design system
- **TypeScript** - Full type safety out of the box

### ✅ **Developer Experience** 
- Copy-paste components (you own the code)
- No runtime dependencies to worry about
- Easy to customize and extend
- Works perfectly in monorepos

### ✅ **Components We Need**
- **Forms** (perfect for our multi-step conservation/supply chain forms)
- **Dialogs & Modals** (user management, confirmations)
- **Tables** (data display for admin dashboards)
- **Buttons, Cards, Tabs** (consistent UI throughout the app)

### ✅ **Production Ready**
- Used by Vercel, Linear, Supabase, and many other companies
- Actively maintained and regularly updated
- Excellent documentation and community support

## 🔧 **Step 3.1: Fix Dependency Issues**

**First, let's fix the problematic packages:**

```bash
# 1. Remove the old pinata-sdk (causes bs-platform errors)
pnpm remove pinata-sdk

# 2. Install the NEW Pinata SDK (rewritten in 2024)
pnpm add pinata

# 3. Fix zod version conflict (downgrade from v4 to v3)
pnpm add zod@^3.22.4

# 4. Add missing peer dependencies for Next.js 15/React 19
pnpm add --legacy-peer-deps @types/react@^18.0.0 @types/react-dom@^18.0.0
```

### **🛠️ Why These Fixes?**

1. **Old `pinata-sdk` → New `pinata`**: The old SDK has outdated BuckleScript dependencies that fail on modern Node.js
2. **Zod v4 → v3**: Web3 packages still expect zod v3, while you have v4 installed
3. **React 19 compatibility**: Adding legacy peer deps to handle React 19 with older packages
4. **NEW Pinata SDK benefits**:
   - ✅ **No more bs-platform errors**
   - ✅ **Lightweight and modern**
   - ✅ **Works in both browser and server**
   - ✅ **Built for modern frameworks like Next.js**
   - ✅ **Better TypeScript support**

### **📦 New Pinata SDK Usage**
The new SDK has a simpler API:
```typescript
// Old pinata-sdk (don't use)
// import pinataSDK from 'pinata-sdk'

// NEW Pinata SDK (use this)
import { PinataSDK } from 'pinata'

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY!
})
```

## 🚨 **Immediate Actions for Your Current Setup**

Since you've already encountered these issues, here's what to do **right now**:

```bash
# 1. Navigate to your frontend package
cd packages/frontend

# 2. Remove problematic packages
pnpm remove pinata-sdk

# 3. Install the correct packages
pnpm add pinata
pnpm add zod@^3.22.4

# 4. Install Web3 packages with legacy peer deps flag
pnpm add --legacy-peer-deps @reown/appkit @reown/appkit-adapter-wagmi wagmi viem ethers

# 5. Verify your installation
pnpm list pinata zod
```

### **🔍 Expected Output:**
```
├── pinata@1.x.x
├── zod@3.22.4
```

If you see this, you're good to proceed! 

## 🎨 **Step 3.2: Setup Next.js Frontend (Corrected)**

```bash
cd packages/frontend

# Initialize Next.js with TypeScript (if not done already)
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*" --use-pnpm

# Upgrade to Tailwind CSS v4
pnpm add tailwindcss@next @tailwindcss/vite@next
pnpm add -D tailwindcss-animate

# Note: Tailwind v4 doesn't need:
# - tailwind.config.js (configuration is in globals.css)
# - postcss.config.js (handled automatically)
# - separate plugin installations (built-in)


# Option 1: Install shadcn/ui (RECOMMENDED - includes proper Radix UI packages)
npx shadcn@latest init

# The CLI will prompt you to configure:
# ✔ Which style would you like to use? › New York (or Default)
# ✔ Which color would you like to use as base color? › Slate (best for blue themes)
# ✔ Would you like to use CSS variables for colors? › Yes

# IMPORTANT: Base color options are:
# - Neutral, Gray, Zinc, Stone, Slate
# Choose "Slate" - it has blue undertones and works perfectly with our blue accent colors

# After setup, we'll customize the primary colors to TracceAqua blue in globals.css
# The base color (Slate) controls the gray/neutral colors
# We'll override the primary colors to be our blue theme

# This automatically installs the correct packages:
# - @radix-ui/react-dialog, @radix-ui/react-dropdown-menu, @radix-ui/react-tabs
# - class-variance-authority, clsx, tailwind-merge, lucide-react
# - tailwindcss-animate

# Then add individual components as needed:
# npx shadcn@latest add button
# npx shadcn@latest add card  
# npx shadcn@latest add dialog
# npx shadcn@latest add dropdown-menu
# npx shadcn@latest add tabs
# npx shadcn@latest add form

# Option 2: Install Radix UI packages directly (if you prefer unstyled components)
# pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs
# pnpm add @radix-ui/react-avatar @radix-ui/react-label @radix-ui/react-select
# pnpm add @radix-ui/react-separator @radix-ui/react-slot
# pnpm add class-variance-authority clsx tailwind-merge lucide-react

# Option 3: Install the combined package (all Radix primitives)
# pnpm add radix-ui

# Option 4: Install Radix Themes (pre-styled components)
# pnpm add @radix-ui/themes

# ⚠️ Note: If you encounter peer dependency issues with React 19/Next.js 15:
# Use the --legacy-peer-deps flag: 
# npm install --legacy-peer-deps
# Or with pnpm: pnpm install --force

# For shadcn/ui specifically:
# npx shadcn@latest init --legacy-peer-deps

# Forms and validation
pnpm add react-hook-form @hookform/resolvers zod

# State management
pnpm add zustand @tanstack/react-query @tanstack/react-query-devtools

# Web3 & Blockchain
pnpm add @reown/appkit @reown/appkit-adapter-wagmi wagmi viem @tanstack/react-query ethers

# QR Code
pnpm add react-qr-code qr-scanner

# File upload & IPFS
pnpm add react-dropzone pinata-sdk

# PWA Support
pnpm add next-pwa

# Utilities
pnpm add date-fns uuid
pnpm add -D @types/uuid

# Development dependencies
pnpm add -D @types/node @typescript-eslint/eslint-plugin @typescript-eslint/parser
pnpm add -D eslint-config-next prettier prettier-plugin-tailwindcss
pnpm add -D tailwindcss-animate
```

**packages/frontend/package.json**
```json
{
  "name": "@tracceaqua/frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.0",
    "@reown/appkit": "^1.0.0",
    "@reown/appkit-adapter-wagmi": "^1.0.0",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-query-devtools": "^5.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "date-fns": "^3.0.0",
    "ethers": "^6.8.0",
    "lucide-react": "^0.400.0",
    "next": "14.0.0",
    "next-pwa": "^5.6.0",
    "pinata": "^1.0.0",
    "qr-scanner": "^1.4.2",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-dropzone": "^14.2.3",
    "react-hook-form": "^7.47.0",
    "react-qr-code": "^2.0.12",
    "tailwind-merge": "^2.0.0",
    "tailwindcss": "^4.0.0-alpha",
    "tailwindcss-animate": "^1.0.7",
    "uuid": "^9.0.1",
    "viem": "^2.0.0",
    "wagmi": "^2.0.0",
    "zod": "^3.22.4",
    "zustand": "^4.4.4"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@types/uuid": "^9.0.5",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "autoprefixer": "^10.0.1",
    "eslint": "^8.0.0",
    "eslint-config-next": "14.0.0",
    "postcss": "^8.0.0",
    "prettier": "^3.0.0",
    "prettier-plugin-tailwindcss": "^0.5.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.0"
  }
}
```

**packages/frontend/next.config.js**
```js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    NEXT_PUBLIC_SEPOLIA_RPC_URL: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_PINATA_GATEWAY: process.env.NEXT_PUBLIC_PINATA_GATEWAY,
  },
  images: {
    domains: ['gateway.pinata.cloud'],
  },
}

module.exports = withPWA(nextConfig)
```


**packages/frontend/src/app/globals.css** (All-in-One with Tailwind v4)
```css
@import "tailwindcss";

/* Tailwind v4 Configuration */
@theme {
  /* Container Configuration */
  --container-center: true;
  --container-padding: 2rem;
  --container-screens-2xl: 1400px;

  /* TracceAqua Color System */
  --color-background: oklch(100% 0 0);
  --color-foreground: oklch(15% 0.006 285.8);
  --color-card: oklch(100% 0 0);
  --color-card-foreground: oklch(15% 0.006 285.8);
  --color-popover: oklch(100% 0 0);
  --color-popover-foreground: oklch(15% 0.006 285.8);

  /* TracceAqua Primary Colors - Blue Theme */
  --color-primary: oklch(60% 0.15 245); /* TracceAqua Blue #3b82f6 */
  --color-primary-foreground: oklch(98% 0 0);

  /* Secondary - Cyan Accent */
  --color-secondary: oklch(68% 0.14 188); /* Cyan #22d3ee */
  --color-secondary-foreground: oklch(15% 0.006 285.8);

  /* Accent - Teal */
  --color-accent: oklch(66% 0.12 172); /* Teal #14b8a6 */
  --color-accent-foreground: oklch(98% 0 0);

  /* Slate Base Colors (chosen in shadcn/ui setup) */
  --color-muted: oklch(96% 0.006 255);
  --color-muted-foreground: oklch(47% 0.006 255);
  --color-border: oklch(90% 0.006 255);
  --color-input: oklch(90% 0.006 255);
  --color-ring: oklch(60% 0.15 245); /* Same as primary */

  /* Destructive */
  --color-destructive: oklch(60% 0.15 0);
  --color-destructive-foreground: oklch(98% 0 0);

  /* Border Radius */
  --radius: 0.75rem;
  --radius-lg: 0.75rem;
  --radius-md: calc(0.75rem - 2px);
  --radius-sm: calc(0.75rem - 4px);

  /* TracceAqua Custom Colors */
  --color-tracceaqua-blue: oklch(60% 0.15 245);
  --color-tracceaqua-cyan: oklch(68% 0.14 188);
  --color-tracceaqua-teal: oklch(66% 0.12 172);
  --color-tracceaqua-dark-blue: oklch(38% 0.15 245);

  /* Blue Scale for TracceAqua */
  --color-blue-50: oklch(97% 0.01 245);
  --color-blue-100: oklch(92% 0.05 245);
  --color-blue-200: oklch(84% 0.08 245);
  --color-blue-300: oklch(73% 0.12 245);
  --color-blue-400: oklch(63% 0.15 245);
  --color-blue-500: oklch(60% 0.15 245); /* Primary */
  --color-blue-600: oklch(52% 0.15 245);
  --color-blue-700: oklch(43% 0.15 245);
  --color-blue-800: oklch(35% 0.15 245);
  --color-blue-900: oklch(27% 0.12 245);

  /* Cyan Scale */
  --color-cyan-50: oklch(97% 0.01 188);
  --color-cyan-100: oklch(92% 0.04 188);
  --color-cyan-200: oklch(84% 0.08 188);
  --color-cyan-300: oklch(75% 0.12 188);
  --color-cyan-400: oklch(68% 0.14 188); /* Secondary */
  --color-cyan-500: oklch(60% 0.14 188);
  --color-cyan-600: oklch(52% 0.14 188);
  --color-cyan-700: oklch(44% 0.12 188);
  --color-cyan-800: oklch(36% 0.10 188);
  --color-cyan-900: oklch(28% 0.08 188);

  /* Teal Scale */
  --color-teal-50: oklch(97% 0.01 172);
  --color-teal-100: oklch(92% 0.04 172);
  --color-teal-200: oklch(84% 0.08 172);
  --color-teal-300: oklch(75% 0.12 172);
  --color-teal-400: oklch(68% 0.14 172);
  --color-teal-500: oklch(66% 0.12 172); /* Accent */
  --color-teal-600: oklch(58% 0.12 172);
  --color-teal-700: oklch(50% 0.10 172);
  --color-teal-800: oklch(42% 0.08 172);
  --color-teal-900: oklch(34% 0.06 172);

  /* TracceAqua Animations */
  --animate-float: float 4s ease-in-out infinite;
  --animate-shimmer: shimmer 3s ease-in-out infinite;
  --animate-glow: glow 2s ease-in-out infinite;
  --animate-heartbeat: heartbeat 2s ease-in-out infinite;
  --animate-scan: scan 2s linear infinite;
}

/* Dark Mode Color Overrides */
@media (prefers-color-scheme: dark) {
  @theme {
    --color-background: oklch(6% 0.015 245); /* Very dark blue */
    --color-foreground: oklch(98% 0 0);
    --color-card: oklch(8% 0.015 245);
    --color-card-foreground: oklch(98% 0 0);
    --color-popover: oklch(8% 0.015 245);
    --color-popover-foreground: oklch(98% 0 0);

    --color-muted: oklch(15% 0.015 245);
    --color-muted-foreground: oklch(65% 0.006 255);
    --color-border: oklch(20% 0.015 245);
    --color-input: oklch(20% 0.015 245);
  }
}

/* Base Styles */
@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

/* TracceAqua Custom Utility Classes */
@layer utilities {
  /* Gradient Utilities */
  .gradient-blue-primary {
    background: linear-gradient(135deg, oklch(60% 0.15 245), oklch(38% 0.15 245));
  }
  
  .gradient-cyan-blue {
    background: linear-gradient(135deg, oklch(68% 0.14 188), oklch(60% 0.15 245));
  }
  
  .gradient-teal-cyan {
    background: linear-gradient(135deg, oklch(66% 0.12 172), oklch(68% 0.14 188));
  }
  
  .gradient-emerald-teal {
    background: linear-gradient(135deg, oklch(66% 0.15 160), oklch(66% 0.12 172));
  }

  /* Onboarding Screen Gradients */
  .gradient-screen-1 {
    background: linear-gradient(135deg, oklch(52% 0.15 245), oklch(35% 0.15 245));
  }
  
  .gradient-screen-2 {
    background: linear-gradient(135deg, oklch(60% 0.14 188), oklch(52% 0.15 245));
  }
  
  .gradient-screen-3 {
    background: linear-gradient(135deg, oklch(58% 0.12 172), oklch(60% 0.14 188));
  }
  
  .gradient-screen-4 {
    background: linear-gradient(135deg, oklch(66% 0.15 160), oklch(58% 0.12 172));
  }

  /* Animation Utilities */
  .animate-float {
    animation: var(--animate-float);
  }
  
  .animate-shimmer {
    animation: var(--animate-shimmer);
    background: linear-gradient(90deg, transparent, oklch(100% 0 0 / 0.2), transparent);
    background-size: 200px 100%;
  }
  
  .animate-glow {
    animation: var(--animate-glow);
  }
  
  .animate-heartbeat {
    animation: var(--animate-heartbeat);
  }
  
  .animate-scan {
    animation: var(--animate-scan);
  }

  /* Animation Delays */
  .animation-delay-200 {
    animation-delay: 0.2s;
  }
  
  .animation-delay-500 {
    animation-delay: 0.5s;
  }
  
  .animation-delay-1000 {
    animation-delay: 1s;
  }

  /* Scale Utilities */
  .hover\:scale-102:hover {
    transform: scale(1.02);
  }
  
  .active\:scale-95:active {
    transform: scale(0.95);
  }
  
  .active\:scale-98:active {
    transform: scale(0.98);
  }
}

/* TracceAqua Custom Animations */
@keyframes float {
  0%, 100% { 
    transform: translateY(0px) rotate(0deg); 
  }
  33% { 
    transform: translateY(-15px) rotate(1deg); 
  }
  66% { 
    transform: translateY(-5px) rotate(-1deg); 
  }
}

@keyframes shimmer {
  0% { 
    background-position: -200px 0; 
  }
  100% { 
    background-position: calc(200px + 100%) 0; 
  }
}

@keyframes glow {
  0%, 100% { 
    box-shadow: 
      0 0 20px oklch(60% 0.15 245 / 0.3),
      0 0 40px oklch(60% 0.15 245 / 0.1);
  }
  50% { 
    box-shadow: 
      0 0 30px oklch(60% 0.15 245 / 0.5),
      0 0 60px oklch(60% 0.15 245 / 0.2);
  }
}

@keyframes heartbeat {
  0%, 100% { 
    transform: scale(1); 
  }
  25% { 
    transform: scale(1.1); 
  }
  50% { 
    transform: scale(1); 
  }
  75% { 
    transform: scale(1.05); 
  }
}

@keyframes scan {
  0% { 
    top: 0; 
  }
  100% { 
    top: 100%; 
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeIn {
  from { 
    opacity: 0; 
  }
  to { 
    opacity: 1; 
  }
}

/* Additional Animation Classes */
.animate-fadeInUp {
  animation: fadeInUp 0.8s ease-out forwards;
}

.animate-fadeInScale {
  animation: fadeInScale 0.8s ease-out forwards;
}

.animate-fadeIn {
  animation: fadeIn 1s ease-out forwards;
}

/* Custom scrollbar for TracceAqua */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: oklch(90% 0.006 255);
}

::-webkit-scrollbar-thumb {
  background: oklch(60% 0.15 245);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: oklch(52% 0.15 245);
}
```

## 🔧 **Step 4: Setup NestJS Backend**

```bash
cd packages/backend

# Initialize NestJS
npx @nestjs/cli new . --package-manager pnpm

# Install core dependencies
pnpm add @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/config
pnpm add @nestjs/passport @nestjs/jwt passport passport-jwt passport-local
pnpm add @nestjs/swagger swagger-ui-express

# Database & ORM
pnpm add nestjs/prisma prisma @prisma/client

# Validation
pnpm add class-validator class-transformer

# File upload & IPFS (NEW Pinata SDK)
pnpm add pinata multer @nestjs/platform-express
pnpm add -D @types/multer

# Utilities
pnpm add bcryptjs uuid
pnpm add -D @types/bcryptjs @types/uuid

# Testing
pnpm add -D @nestjs/testing jest supertest ts-jest
pnpm add -D @types/jest @types/supertest
```

**packages/backend/package.json**
```json
{
  "name": "@tracceaqua/backend",
  "version": "0.0.1",
  "description": "TracceAqua Backend API",
  "author": "",
  "private": true,
  "license": "UNLICENSED",
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "prisma:generate": "prisma generate",
    "prisma:push": "prisma db push",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/config": "^3.1.1",
    "@nestjs/core": "^10.0.0",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.2",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/prisma": "^0.2.2",
    "@nestjs/swagger": "^7.1.17",
    "@prisma/client": "^5.6.0",
    "bcryptjs": "^2.4.3",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "multer": "^1.4.5-lts.1",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "pinata": "^1.0.0",
    "prisma": "^5.6.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1",
    "swagger-ui-express": "^5.0.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/express": "^4.17.17",
    "@types/jest": "^29.5.2",
    "@types/multer": "^1.4.11",
    "@types/node": "^20.3.1",
    "@types/passport-jwt": "^3.0.13",
    "@types/passport-local": "^1.0.38",
    "@types/supertest": "^2.0.12",
    "@types/uuid": "^9.0.7",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.42.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "jest": "^29.5.0",
    "prettier": "^3.0.0",
    "source-map-support": "^0.5.21",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.0",
    "ts-loader": "^9.4.3",
    "ts-node": "^10.9.1",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.1.3"
  }
}
```

## ⛓️ **Step 5: Setup Smart Contracts**

```bash
cd packages/contracts

# Initialize Hardhat project
npx hardhat init --typescript

# Install dependencies
pnpm add -D hardhat @nomicfoundation/hardhat-toolbox
pnpm add -D @typechain/hardhat typechain @typechain/ethers-v6
pnpm add -D @nomiclabs/hardhat-ethers ethers
```

**packages/contracts/package.json**
```json
{
  "name": "@tracceaqua/contracts",
  "version": "1.0.0",
  "description": "TracceAqua Smart Contracts",
  "main": "index.js",
  "scripts": {
    "build": "hardhat compile",
    "dev": "hardhat node",
    "test": "hardhat test",
    "deploy:sepolia": "hardhat run scripts/deploy.ts --network sepolia",
    "verify:sepolia": "hardhat run scripts/verify.ts --network sepolia",
    "lint": "solhint 'contracts/**/*.sol'"
  },
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^4.0.0",
    "@nomiclabs/hardhat-ethers": "^2.2.3",
    "@typechain/ethers-v6": "^0.5.0",
    "@typechain/hardhat": "^9.0.0",
    "ethers": "^6.8.0",
    "hardhat": "^2.19.0",
    "solhint": "^4.0.0",
    "typechain": "^8.3.0",
    "typescript": "^5.1.3"
  }
}
```

## 📦 **Step 6: Setup Shared Package**

```bash
cd packages/shared

# Initialize package
pnpm init

# Install TypeScript
pnpm add -D typescript
```

**packages/shared/package.json**
```json
{
  "name": "@tracceaqua/shared",
  "version": "1.0.0",
  "description": "Shared types and utilities for TracceAqua",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "typescript": "^5.1.3"
  }
}
```

**packages/shared/tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "CommonJS",
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 🔐 **Step 7: Environment Variables Setup**

Create these environment files:

**packages/frontend/.env.local**
```bash
# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Blockchain
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# API
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# IPFS (NEW Pinata SDK)
NEXT_PUBLIC_PINATA_GATEWAY=https://your-gateway.mypinata.cloud
PINATA_JWT=your_pinata_jwt_token
```

**packages/backend/.env**
```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/tracceaqua

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=7d

# IPFS/Pinata (NEW SDK)
PINATA_JWT=your_pinata_jwt_token
PINATA_GATEWAY_URL=https://your-gateway.mypinata.cloud

# Blockchain
PRIVATE_KEY=your_deployer_private_key
CONTRACT_ADDRESS=0x...

# Server
PORT=3001
```

## 🎨 **TracceAqua Design System (All-in-One with Tailwind v4)**

With **Tailwind CSS v4**, everything is configured directly in `globals.css` - no separate config files needed!

### **What's Included in globals.css:**

#### **🎨 Complete Color System**
- **Primary Blue**: TracceAqua brand blue for buttons, links, focus states
- **Secondary Cyan**: Accent color for highlights and secondary actions  
- **Accent Teal**: Supporting color for success states and progress
- **Slate Base**: Neutral grays with blue undertones (perfect with our theme)
- **Full Color Scales**: Complete blue, cyan, and teal color palettes

#### **🌊 Gradient System**
- **Screen Gradients**: Matching the onboarding flow (blue → cyan → teal → emerald)
- **Component Gradients**: Ready-to-use gradient utilities
- **Smart Color Blending**: Using modern `oklch()` color space for better gradients

#### **⚡ Animation System**
- **TracceAqua Animations**: float, shimmer, glow, heartbeat, scan
- **Onboarding Animations**: fadeInUp, fadeInScale, fadeIn
- **Smooth Transitions**: Professional animations with proper easing

#### **📱 Responsive Design**
- **Container System**: Centered containers with proper padding
- **Mobile-First**: Optimized for TracceAqua's mobile experience
- **Dark Mode**: Automatic dark mode with blue theme

#### **✨ Tailwind v4 Benefits**
- **🚀 No Config File**: Everything in one CSS file
- **⚡ Faster Builds**: Simplified compilation
- **🎯 Better Performance**: Optimized CSS output
- **🔧 Easier Maintenance**: Single source of truth
- **📦 Modern Syntax**: Using latest CSS features like `oklch()`

### **Usage Examples:**
```jsx
// Gradient backgrounds (onboarding screens)
<div className="gradient-screen-1">First screen</div>
<div className="gradient-screen-2">Second screen</div>

// Animations
<div className="animate-float">Floating element</div>
<button className="animate-glow">Glowing button</button>

// Colors
<div className="bg-primary text-primary-foreground">Primary button</div>
<div className="bg-secondary text-secondary-foreground">Secondary button</div>
```

## ✅ **Step 8: Test the Setup**

From the root directory:

```bash
# Install all dependencies
pnpm install

# Test builds
pnpm build

# Start development servers
pnpm dev
```

This should start:
- Frontend on http://localhost:3000
- Backend on http://localhost:3001

## 🎯 **Next Steps**

Once this setup is complete, let me know and we'll move to:
1. **Phase 2**: Authentication & User Management
2. Create the onboarding flow
3. Set up the database schema
4. Implement WalletConnect integration

**Ready to proceed?** 🚀