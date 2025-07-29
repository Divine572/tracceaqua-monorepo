# TracceAqua - Blockchain Seafood Traceability System
## Comprehensive Development Guide (Next.js + NestJS + TypeScript)

---

## 🎯 **PROJECT OVERVIEW**

TracceAqua is a blockchain-based seafood traceability and transparency system built for the Nigerian shellfish supply chain. The system provides end-to-end tracking from harvest/farming to consumer, with two main modules: **Conservation** (wild-capture monitoring) and **Supply Chain** (traceability).

### **Key Features**
- Next.js 14+ with TypeScript (Frontend)
- NestJS with TypeScript (Backend)
- Blockchain integration on Sepolia ETH testnet
- WalletConnect authentication with Google social signin
- Admin-controlled role assignment system
- QR code generation and scanning
- IPFS file storage via Pinata
- Mobile-first responsive design
- Multi-stakeholder role management
- Real-time data synchronization

---

## 🏗️ **TECHNOLOGY STACK**

### **Frontend Stack (Next.js)**
- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript 5+
- **Styling:** Tailwind CSS 3.4+
- **UI Components:** shadcn/ui + Radix UI
- **Forms:** React Hook Form + Zod
- **State Management:** Zustand + TanStack Query
- **Web3 Integration:** WalletConnect AppKit v5+ + Wagmi v2
- **QR Codes:** react-qr-code + qr-scanner
- **File Upload:** react-dropzone + IPFS Pinata
- **Icons:** Lucide React
- **Deployment:** Vercel

### **Backend Stack (NestJS)**
- **Framework:** NestJS 10+ with TypeScript
- **Database:** PostgreSQL 16+ with Prisma ORM
- **Authentication:** JWT + Passport.js
- **File Storage:** Pinata IPFS SDK
- **API Documentation:** Swagger/OpenAPI
- **Validation:** class-validator + class-transformer
- **Testing:** Jest + Supertest
- **Deployment:** Railway/DigitalOcean

### **Blockchain Stack**
- **Smart Contracts:** Solidity 0.8.20+
- **Development:** Hardhat + TypeScript
- **Network:** Sepolia Testnet
- **RPC:** `https://ethereum-sepolia-rpc.publicnode.com`
- **Libraries:** ethers.js v6+ + viem

### **Development Tools**
- **Monorepo:** Turborepo
- **Package Manager:** pnpm
- **Code Quality:** ESLint + Prettier + Husky
- **Testing:** Jest + Cypress + Playwright

---

## 🔐 **AUTHORIZATION & ROLE MANAGEMENT SYSTEM**

### **Authorization Flow Design**

#### **1. User Registration Process**
```mermaid
graph TD
    A[New User] --> B[WalletConnect + Google Signin]
    B --> C[Account Created with CONSUMER Role]
    C --> D[User Can Immediately Use Basic Features]
    D --> E[User Applies for Professional Role]
    E --> F[Admin Reviews Application]
    F --> G{Admin Decision}
    G -->|Approve| H[Role Upgraded]
    G -->|Reject| I[Remains Consumer + Feedback]
    H --> J[User Gets Professional Access]
```

#### **2. Role Assignment Workflow**
- **Step 1:** User connects wallet + Google social login
- **Step 2:** Account automatically created with `CONSUMER` role (immediate access)
- **Step 3:** User can immediately scan QR codes and trace products
- **Step 4:** User applies for professional role (Farmer, Researcher, etc.)
- **Step 5:** Admin reviews application with submitted documents
- **Step 6:** Admin approves/rejects with feedback
- **Step 7:** Approved users get upgraded role and professional access

#### **3. Role Hierarchy & Permissions**

##### **ADMIN** (Highest Level)
- **Permissions:**
  - Manage all user roles and permissions
  - View system analytics and reports
  - Access all modules and data
  - System configuration and settings
  - Approve/reject user applications
  - Suspend/activate user accounts

##### **RESEARCHER** 
- **Permissions:**
  - Full access to Conservation module
  - Create and manage sampling records
  - Enter lab test results
  - View analytics related to conservation data
  - Export research data

##### **FARMER** (Aquaculture)
- **Permissions:**
  - Access Supply Chain module (Farmed workflow only)
  - Create hatchery and grow-out records
  - Track harvest operations
  - View their own farming data

##### **FISHERMAN** (Wild Capture)
- **Permissions:**
  - Access Supply Chain module (Wild-capture workflow only)
  - Record fishing operations
  - Document catch data
  - View their own fishing records

##### **PROCESSOR**
- **Permissions:**
  - Access Supply Chain module (Processing stage)
  - Create processing records
  - Upload quality test results
  - Link to received products

##### **TRADER/DISTRIBUTOR**
- **Permissions:**
  - Access Supply Chain module (Distribution stage)
  - Create transport and logistics records
  - Track cold chain data
  - Link to processed products

##### **RETAILER**
- **Permissions:**
  - Access Supply Chain module (Retail stage)
  - Create retail records
  - Generate QR codes for products
  - Manage inventory

##### **CONSUMER** (Default Role)
- **Permissions:**
  - Scan QR codes for product tracing
  - View public traceability information
  - Provide feedback and ratings
  - Apply for professional roles
  - Access help and documentation

##### **PENDING_UPGRADE** (Application Submitted)
- **Permissions:**
  - All Consumer permissions
  - Cannot create professional records
  - Can view application status
  - Can update application documents

### **Authentication Implementation**

#### **Frontend Authentication (Next.js)**
```typescript
// lib/auth.ts
export interface User {
  id: string;
  address: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  profile: UserProfile;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  RESEARCHER = 'RESEARCHER', 
  FARMER = 'FARMER',
  FISHERMAN = 'FISHERMAN',
  PROCESSOR = 'PROCESSOR',
  TRADER = 'TRADER',
  RETAILER = 'RETAILER',
  CONSUMER = 'CONSUMER',
  PENDING = 'PENDING'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED'
}
```

#### **Backend Authentication (NestJS)**
```typescript
// auth/guards/role.guard.ts
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()]
    );
    
    if (!requiredRoles) return true;
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role) && user.status === 'ACTIVE';
  }
}
```

---

## 📁 **PROJECT STRUCTURE**

```
tracceaqua-monorepo/
├── packages/
│   ├── frontend/                    # Next.js Frontend
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── admin/
│   │   │   │   ├── conservation/
│   │   │   │   ├── supply-chain/
│   │   │   │   └── analytics/
│   │   │   ├── api/                 # API routes
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── auth/
│   │   │   ├── onboarding/
│   │   │   ├── conservation/
│   │   │   ├── supply-chain/
│   │   │   ├── qr-code/
│   │   │   └── common/
│   │   ├── lib/
│   │   │   ├── auth.ts
│   │   │   ├── blockchain.ts
│   │   │   ├── api.ts
│   │   │   └── utils.ts
│   │   ├── hooks/
│   │   ├── stores/                  # Zustand stores
│   │   ├── types/
│   │   ├── constants/
│   │   ├── public/
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── backend/                     # NestJS Backend
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── guards/
│   │   │   │   └── strategies/
│   │   │   ├── users/
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   ├── users.module.ts
│   │   │   │   └── dto/
│   │   │   ├── conservation/
│   │   │   │   ├── conservation.controller.ts
│   │   │   │   ├── conservation.service.ts
│   │   │   │   ├── conservation.module.ts
│   │   │   │   └── dto/
│   │   │   ├── supply-chain/
│   │   │   │   ├── supply-chain.controller.ts
│   │   │   │   ├── supply-chain.service.ts
│   │   │   │   ├── supply-chain.module.ts
│   │   │   │   └── dto/
│   │   │   ├── blockchain/
│   │   │   │   ├── blockchain.service.ts
│   │   │   │   └── blockchain.module.ts
│   │   │   ├── ipfs/
│   │   │   │   ├── ipfs.service.ts
│   │   │   │   └── ipfs.module.ts
│   │   │   ├── database/
│   │   │   │   ├── prisma.service.ts
│   │   │   │   └── migrations/
│   │   │   ├── common/
│   │   │   │   ├── decorators/
│   │   │   │   ├── filters/
│   │   │   │   ├── pipes/
│   │   │   │   └── interceptors/
│   │   │   ├── config/
│   │   │   │   └── configuration.ts
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── test/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── contracts/                   # Smart Contracts
│   │   ├── contracts/
│   │   │   ├── TracceAqua.sol
│   │   │   ├── ConservationData.sol
│   │   │   └── SupplyChainData.sol
│   │   ├── scripts/
│   │   │   ├── deploy.ts
│   │   │   └── verify.ts
│   │   ├── test/
│   │   ├── hardhat.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── shared/                      # Shared Types & Utils
│       ├── types/
│       │   ├── auth.ts
│       │   ├── conservation.ts
│       │   ├── supply-chain.ts
│       │   └── blockchain.ts
│       ├── utils/
│       ├── constants/
│       ├── package.json
│       └── tsconfig.json
├── apps/
├── turbo.json
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

## 🚀 **DEVELOPMENT PHASES**

### **Phase 1: Project Setup & Infrastructure (Week 1-2)**

#### **1.1 Monorepo Setup**
```bash
# Initialize Turborepo
npx create-turbo@latest tracceaqua-monorepo
cd tracceaqua-monorepo

# Setup pnpm workspace
echo "packages:
  - 'packages/*'
  - 'apps/*'" > pnpm-workspace.yaml
```

#### **1.2 Frontend Setup (Next.js)**
```bash
# Create Next.js app
cd packages
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir --import-alias "@/*"
cd frontend

# Install core dependencies
pnpm add @radix-ui/react-avatar @radix-ui/react-button @radix-ui/react-dialog
pnpm add @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-select
pnpm add @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-toast
pnpm add class-variance-authority clsx tailwind-merge lucide-react

# Forms and validation
pnpm add react-hook-form @hookform/resolvers zod

# State management
pnpm add zustand @tanstack/react-query @tanstack/react-query-devtools

# Web3 & Blockchain
pnpm add @reown/appkit @reown/appkit-adapter-wagmi wagmi viem @tanstack/react-query
pnpm add ethers

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
```

#### **1.3 Backend Setup (NestJS)**
```bash
# Create NestJS app
cd packages
npx @nestjs/cli new backend --package-manager pnpm
cd backend

# Install core dependencies
pnpm add @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/config
pnpm add @nestjs/passport @nestjs/jwt passport passport-jwt passport-local
pnpm add @nestjs/swagger swagger-ui-express

# Database & ORM
pnpm add @nestjs/prisma prisma @prisma/client
pnpm add postgresql

# Validation
pnpm add class-validator class-transformer

# File upload & IPFS
pnpm add pinata-sdk multer @nestjs/platform-express
pnpm add -D @types/multer

# Utilities
pnpm add bcryptjs uuid
pnpm add -D @types/bcryptjs @types/uuid

# Testing
pnpm add -D @nestjs/testing jest supertest ts-jest
pnpm add -D @types/jest @types/supertest
```

#### **1.4 Smart Contracts Setup**
```bash
# Create contracts package
mkdir packages/contracts
cd packages/contracts

# Initialize Hardhat project
npx hardhat init --typescript
pnpm add -D hardhat @nomicfoundation/hardhat-toolbox
pnpm add -D @nomiclabs/hardhat-ethers ethers @typechain/hardhat typechain
```

#### **1.5 Shared Package Setup**
```bash
# Create shared types package
mkdir packages/shared
cd packages/shared
pnpm init

# Install TypeScript
pnpm add -D typescript
```

**Testing Checkpoint 1:** ✅ Verify all packages install correctly and build without errors

### **Phase 2: Authentication & User Management (Week 3-4)**

#### **2.1 Backend Authentication Implementation**

##### **Database Schema Setup**
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String      @id @default(cuid())
  address     String      @unique
  email       String?     @unique
  role        UserRole    @default(PENDING)
  status      UserStatus  @default(PENDING)
  profile     UserProfile?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // Relationships
  conservationRecords ConservationRecord[]
  supplyChainRecords  SupplyChainRecord[]
  adminActions        AdminAction[]

  @@map("users")
}

model UserProfile {
  id              String  @id @default(cuid())
  userId          String  @unique
  firstName       String
  lastName        String
  organization    String?
  licenseNumber   String?
  phoneNumber     String?
  profileImage    String?
  documents       String[] // IPFS hashes
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("user_profiles")
}

enum UserRole {
  ADMIN
  RESEARCHER
  FARMER
  FISHERMAN
  PROCESSOR
  TRADER
  RETAILER
  CONSUMER
  PENDING
}

enum UserStatus {
  ACTIVE
  PENDING
  SUSPENDED
  REJECTED
}

model AdminAction {
  id        String   @id @default(cuid())
  adminId   String
  targetId  String
  action    String
  reason    String?
  createdAt DateTime @default(now())
  
  admin User @relation(fields: [adminId], references: [id])
  
  @@map("admin_actions")
}
```

##### **Authentication Service**
```typescript
// src/auth/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateWallet(address: string, signature: string): Promise<User | null> {
    // Verify wallet signature
    const isValid = await this.verifySignature(address, signature);
    if (!isValid) return null;

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { address },
      include: { profile: true }
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          address,
          role: UserRole.CONSUMER, // Start as consumer
          status: UserStatus.ACTIVE // Immediately active
        },
        include: { profile: true }
      });
    }

    return user;
  }

  async login(user: User) {
    const payload = { 
      sub: user.id, 
      address: user.address, 
      role: user.role,
      status: user.status 
    };
    
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        address: user.address,
        email: user.email,
        role: user.role,
        status: user.status,
        profile: user.profile
      }
    };
  }
}
##### **Role Application Service**
```typescript
// src/role-applications/role-applications.service.ts
@Injectable()
export class RoleApplicationsService {
  constructor(private prisma: PrismaService) {}

  async submitApplication(userId: string, applicationData: CreateRoleApplicationDto) {
    // Update user status to PENDING_UPGRADE
    await this.prisma.user.update({
      where: { id: userId },
      data: { role: UserRole.PENDING_UPGRADE }
    });

    // Create role application
    return this.prisma.roleApplication.create({
      data: {
        userId,
        requestedRole: applicationData.requestedRole,
        documents: applicationData.documents,
        organization: applicationData.organization,
        licenseNumber: applicationData.licenseNumber,
        businessType: applicationData.businessType,
        experience: applicationData.experience,
        status: ApplicationStatus.PENDING
      }
    });
  }

  async reviewApplication(
    applicationId: string, 
    adminId: string, 
    decision: 'APPROVED' | 'REJECTED',
    feedback?: string
  ) {
    const application = await this.prisma.roleApplication.findUnique({
      where: { id: applicationId },
      include: { user: true }
    });

    if (!application) throw new NotFoundException('Application not found');

    // Update application
    await this.prisma.roleApplication.update({
      where: { id: applicationId },
      data: {
        status: decision === 'APPROVED' ? ApplicationStatus.APPROVED : ApplicationStatus.REJECTED,
        adminFeedback: feedback,
        reviewedBy: adminId
      }
    });

    // Update user role
    const newRole = decision === 'APPROVED' 
      ? application.requestedRole 
      : UserRole.CONSUMER;

    await this.prisma.user.update({
      where: { id: application.userId },
      data: { role: newRole }
    });

    return { success: true, newRole };
  }
}
```

#### **2.3 Frontend Role Application**

##### **Role Application Form**
```typescript
// components/auth/role-application-form.tsx
export function RoleApplicationForm() {
  const { user } = useAuthStore()
  const [selectedRole, setSelectedRole] = useState<UserRole>()
  
  const form = useForm<RoleApplicationData>({
    resolver: zodResolver(roleApplicationSchema)
  })

  const professionalRoles = [
    { value: UserRole.RESEARCHER, label: 'Researcher', description: 'Conservation data collection and analysis' },
    { value: UserRole.FARMER, label: 'Farmer', description: 'Aquaculture operations' },
    { value: UserRole.FISHERMAN, label: 'Fisherman', description: 'Wild-capture fishing operations' },
    { value: UserRole.PROCESSOR, label: 'Processor', description: 'Seafood processing facilities' },
    { value: UserRole.TRADER, label: 'Trader/Distributor', description: 'Transportation and logistics' },
    { value: UserRole.RETAILER, label: 'Retailer', description: 'Retail and consumer sales' }
  ]

  async function onSubmit(data: RoleApplicationData) {
    try {
      await api.post('/role-applications', data)
      toast.success('Application submitted successfully!')
      // Update user role to PENDING_UPGRADE
      updateUser({ role: UserRole.PENDING_UPGRADE })
    } catch (error) {
      toast.error('Failed to submit application')
    }
  }

  if (user?.role !== UserRole.CONSUMER) {
    return <ApplicationStatusCard />
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Apply for Professional Role</CardTitle>
        <CardDescription>
          Upgrade your account to access professional features
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="requestedRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your professional role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {professionalRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div>
                            <div className="font-medium">{role.label}</div>
                            <div className="text-sm text-muted-foreground">{role.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization/Company</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your organization name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="licenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License/Permit Number (if applicable)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter license or permit number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="documents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supporting Documents</FormLabel>
                  <FormControl>
                    <FileUpload
                      onUpload={(ipfsHashes) => field.onChange(ipfsHashes)}
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                    />
                  </FormControl>
                  <FormDescription>
                    Upload business license, permits, certifications, or other relevant documents
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full">
              Submit Application
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
```

#### **3.3 Consumer Dashboard**
```typescript
// components/dashboard/consumer-dashboard.tsx
export function ConsumerDashboard() {
  const { user } = useAuthStore()
  const [recentScans, setRecentScans] = useState([])
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome, {user?.profile?.firstName || 'Consumer'}!</h1>
        <Button asChild>
          <Link href="/apply-role">
            Upgrade to Professional
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Scan Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Scan QR codes to trace seafood products
            </p>
            <Button asChild className="w-full">
              <Link href="/scan">
                Open Scanner
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fish className="h-5 w-5" />
              Trace by Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Enter trace code manually
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/trace">
                Enter Code
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View your scanning history
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/history">
                View History
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {recentScans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Product Traces</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentScansTable scans={recentScans} />
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Ready for More?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Join as a professional stakeholder to contribute to the seafood supply chain
          </p>
          <Button asChild>
            <Link href="/apply-role">
              Apply for Professional Role
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

##### **WalletConnect Setup**
```typescript
// lib/wallet-connect.ts
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { sepolia } from 'viem/chains'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!

const metadata = {
  name: 'TracceAqua',
  description: 'Blockchain Seafood Traceability System',
  url: 'https://tracceaqua.vercel.app',
  icons: ['https://tracceaqua.vercel.app/icon.svg']
}

const wagmiAdapter = new WagmiAdapter({
  networks: [sepolia],
  projectId
})

createAppKit({
  adapters: [wagmiAdapter],
  networks: [sepolia],
  projectId,
  metadata,
  features: {
    email: true,
    socials: ['google']
  }
})

export { wagmiAdapter }
```

##### **Auth Store (Zustand)**
```typescript
// stores/auth-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      
      login: (user: User, token: string) => {
        localStorage.setItem('token', token)
        set({ user, isAuthenticated: true })
      },
      
      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, isAuthenticated: false })
      },
      
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } })
        }
      }
    }),
    { name: 'auth-storage' }
  )
)
```

**Testing Checkpoint 2:** ✅ Test wallet connection, immediate consumer access, role application system, and admin role approval workflow

### **Phase 3: Onboarding Experience & User Interface (Week 5-6)**

#### **3.1 Advanced Onboarding Flow Implementation**

##### **Onboarding Component with Enhanced Features**
```typescript
// components/onboarding/onboarding-flow.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Users, Scan, Shield, Heart, Waves, Fish, Volume2, VolumeX } from 'lucide-react';

interface OnboardingScreen {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  animation: string;
  buttonText: string;
  gradient: string;
  bgPattern: string;
}

const OnboardingFlow = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasVibration, setHasVibration] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Check for vibration support
  useEffect(() => {
    setHasVibration('vibrate' in navigator);
  }, []);

  // Initialize Audio Context
  useEffect(() => {
    if (soundEnabled && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, [soundEnabled]);

  const screens: OnboardingScreen[] = [
    {
      id: 1,
      title: "For All Stakeholders",
      description: "Whether you're a harvester, processor, transporter, inspector, or consumer, TracceAqua empowers you with transparency.",
      icon: <Users className="w-20 h-20 text-blue-400" />,
      animation: "users",
      buttonText: "Next",
      gradient: "from-blue-600 to-blue-800",
      bgPattern: "users"
    },
    {
      id: 2,
      title: "Trace With Ease",
      description: "Consumers can simply scan a QR code to get the full history and origin of their shellfish product.",
      icon: <Scan className="w-20 h-20 text-cyan-400" />,
      animation: "scan",
      buttonText: "Continue",
      gradient: "from-cyan-500 to-blue-600",
      bgPattern: "scan"
    },
    {
      id: 3,
      title: "How It Works",
      description: "We use blockchain technology to record every step of the shellfish journey, from harvest to your plate.",
      icon: <Shield className="w-20 h-20 text-teal-400" />,
      animation: "blockchain",
      buttonText: "Amazing!",
      gradient: "from-teal-500 to-cyan-600",
      bgPattern: "blockchain"
    },
    {
      id: 4,
      title: "Welcome to TracceAqua!",
      description: "Your trusted partner for traceability and conservation in the Nigerian shellfish supply chain",
      icon: <Heart className="w-20 h-20 text-emerald-400" />,
      animation: "welcome",
      buttonText: "Get Started",
      gradient: "from-emerald-500 to-teal-600",
      bgPattern: "welcome"
    }
  ];

  // Web Audio API sound generation
  type PlaySoundType = 'click' | 'transition' | 'success' | 'whoosh';

  const playSound = (type: PlaySoundType): void => {
    if (!soundEnabled || !audioContextRef.current) return;

    const ctx: AudioContext = audioContextRef.current;
    const oscillator: OscillatorNode = ctx.createOscillator();
    const gainNode: GainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    switch (type) {
      case 'click':
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
        break;
      case 'transition':
        oscillator.frequency.setValueAtTime(400, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
        break;
      case 'success':
        [523, 659, 784].forEach((freq, i) => {
          const osc: OscillatorNode = ctx.createOscillator();
          const gain: GainNode = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.03, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          osc.start(ctx.currentTime + i * 0.1);
          osc.stop(ctx.currentTime + 0.5 + i * 0.1);
        });
        break;
      case 'whoosh':
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
        break;
    }
  };

  // Enhanced navigation with transitions and feedback
  const handleNext = async () => {
    if (hasVibration) {
      navigator.vibrate([50, 30, 50]);
    }

    if (currentScreen === screens.length - 1) {
      playSound('success');
      // Navigate to authentication
      window.location.href = '/auth/login';
    } else {
      playSound('click');
    }

    setIsTransitioning(true);
    
    setTimeout(() => {
      if (currentScreen < screens.length - 1) {
        setCurrentScreen(currentScreen + 1);
        playSound('transition');
      }
      setIsTransitioning(false);
    }, 300);
  };

  const handlePrevious = () => {
    if (hasVibration) {
      navigator.vibrate(30);
    }
    
    playSound('click');
    setIsTransitioning(true);
    
    setTimeout(() => {
      if (currentScreen > 0) {
        setCurrentScreen(currentScreen - 1);
        playSound('transition');
      }
      setIsTransitioning(false);
    }, 300);
  };

  const handleSkip = () => {
    if (hasVibration) {
      navigator.vibrate([30, 50, 30, 50, 30]);
    }
    
    playSound('whoosh');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentScreen(screens.length - 1);
      setIsTransitioning(false);
    }, 300);
  };

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>): void => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>): void => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentScreen < screens.length - 1) {
      if (hasVibration) navigator.vibrate(30);
      playSound('click');
      handleNext();
    }

    if (isRightSwipe && currentScreen > 0) {
      if (hasVibration) navigator.vibrate(30);
      playSound('click');
      handlePrevious();
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentScreen]);

  // Custom animation components
  const CustomAnimation: React.FC<{ type: string; className?: string }> = ({ type, className = "" }) => {
    switch (type) {
      case 'users':
        return (
          <div className={`${className} relative`}>
            <div className="w-24 h-24 relative">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 bg-white rounded-full animate-ping opacity-60"
                  style={{
                    top: `${20 + (i % 3) * 20}%`,
                    left: `${20 + (i % 2) * 40}%`,
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: '2s'
                  }}
                />
              ))}
              <Users className="w-20 h-20 text-blue-400 relative z-10" />
            </div>
          </div>
        );
      case 'scan':
        return (
          <div className={`${className} relative`}>
            <div className="w-24 h-24 relative">
              <div className="absolute inset-0 border-2 border-white/30 rounded-lg">
                <div className="w-full h-0.5 bg-cyan-400 animate-scan absolute top-0"></div>
              </div>
              <Scan className="w-20 h-20 text-cyan-400 relative z-10 m-2" />
            </div>
          </div>
        );
      case 'blockchain':
        return (
          <div className={`${className} relative`}>
            <div className="w-24 h-24 relative">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-4 h-4 border border-white rounded transform rotate-45 animate-spin opacity-60"
                  style={{
                    top: `${30 + i * 15}%`,
                    left: `${30 + i * 10}%`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: '3s'
                  }}
                />
              ))}
              <Shield className="w-20 h-20 text-teal-400 relative z-10" />
            </div>
          </div>
        );
      case 'welcome':
        return (
          <div className={`${className} relative`}>
            <div className="w-24 h-24 relative">
              <Waves className="absolute top-2 left-2 w-4 h-4 text-white/40 animate-bounce" />
              <Fish className="absolute top-4 right-2 w-3 h-3 text-white/40 animate-bounce delay-500" />
              <Heart className="w-20 h-20 text-emerald-400 relative z-10 animate-heartbeat" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Background pattern components
  const BackgroundPattern: React.FC<{ type: string }> = ({ type }) => {
    switch (type) {
      case 'users':
        return (
          <div className="absolute inset-0 opacity-10">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-4 h-4 bg-white rounded-full animate-pulse"
                style={{
                  top: `${20 + (i * 15)}%`,
                  left: `${10 + (i % 2 * 80)}%`,
                  animationDelay: `${i * 0.5}s`
                }}
              />
            ))}
          </div>
        );
      case 'scan':
        return (
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-20 h-20 border-2 border-white rounded-lg animate-pulse"></div>
            <div className="absolute bottom-1/3 right-1/4 w-16 h-16 border-2 border-white rounded-lg animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 right-1/6 w-12 h-12 border border-white rounded animate-ping delay-500"></div>
          </div>
        );
      case 'blockchain':
        return (
          <div className="absolute inset-0 opacity-10">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-6 h-6 border border-white transform rotate-45 animate-spin"
                style={{
                  top: `${15 + (i * 8)}%`,
                  left: `${5 + (i % 4 * 25)}%`,
                  animationDuration: `${3 + (i % 3)}s`,
                  animationDelay: `${i * 0.3}s`
                }}
              />
            ))}
          </div>
        );
      case 'welcome':
        return (
          <div className="absolute inset-0 opacity-15">
            <Waves className="absolute top-20 left-10 w-12 h-12 animate-bounce" />
            <Fish className="absolute top-40 right-16 w-10 h-10 animate-bounce delay-500" />
            <Waves className="absolute bottom-32 left-20 w-14 h-14 animate-bounce delay-1000" />
            <Fish className="absolute bottom-20 right-10 w-8 h-8 animate-bounce delay-1500" />
            <Heart className="absolute top-32 right-32 w-6 h-6 animate-pulse delay-300" />
            <Shield className="absolute bottom-40 left-32 w-5 h-5 animate-spin delay-800" />
          </div>
        );
      default:
        return null;
    }
  };

  const current = screens[currentScreen];

  return (
    <div 
      className="min-h-screen flex flex-col overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sound Toggle Button */}
      <button
        onClick={() => {
          setSoundEnabled(!soundEnabled);
          if (hasVibration) navigator.vibrate(20);
          playSound('click');
        }}
        className="absolute top-4 right-4 z-50 p-3 bg-white/20 backdrop-blur-sm rounded-full
                 hover:bg-white/30 transition-all duration-300 transform hover:scale-110 active:scale-95"
      >
        {soundEnabled ? (
          <Volume2 className="w-5 h-5 text-white" />
        ) : (
          <VolumeX className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Background with enhanced gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${current.gradient} transition-all duration-700 ease-in-out`}>
        <BackgroundPattern type={current.bgPattern} />
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-float"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${3 + Math.random() * 4}s`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10"></div>
      </div>

      {/* Content Container */}
      <div className={`relative z-10 flex flex-col min-h-screen transition-all duration-500 ${
        isTransitioning ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
      }`}>
        
        {/* Progress Indicators */}
        <div className="flex justify-center pt-16 pb-8">
          <div className="flex space-x-3">
            {screens.map((_, index) => (
              <div
                key={index}
                className={`h-3 rounded-full transition-all duration-500 transform ${
                  index === currentScreen 
                    ? 'w-10 bg-white shadow-lg scale-110 animate-glow' 
                    : index < currentScreen 
                    ? 'w-3 bg-white/90 scale-100' 
                    : 'w-3 bg-white/30 scale-90'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col items-center justify-center px-6 text-center transition-all duration-700 transform ${
          isTransitioning ? 'translate-x-8 opacity-0' : 'translate-x-0 opacity-100'
        }`}>
          
          <div className="mb-8 transform transition-all duration-700 hover:scale-110 hover:rotate-3">
            <CustomAnimation type={current.animation} className="animate-fadeInScale" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 max-w-md leading-tight">
            <span className="inline-block animate-fadeInUp animate-shimmer">
              {current.title}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/90 max-w-sm leading-relaxed mb-12 animate-fadeInUp animation-delay-200">
            {current.description}
          </p>
        </div>

        {/* Enhanced Navigation */}
        <div className="p-6 space-y-4">
          <button
            onClick={handleNext}
            className="w-full bg-white text-gray-800 font-semibold py-5 px-6 rounded-2xl 
                     transform transition-all duration-300 hover:scale-105 hover:shadow-2xl
                     flex items-center justify-center space-x-2 group relative overflow-hidden
                     active:scale-95 animate-glow"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                          transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                          transition-transform duration-1000"></div>
            
            <span className="relative z-10">{current.buttonText}</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 relative z-10" />
          </button>

          {currentScreen > 0 && (
            <button
              onClick={handlePrevious}
              className="w-full text-white/80 font-medium py-4 px-6 rounded-xl
                       hover:text-white hover:bg-white/10 transition-all duration-300
                       transform hover:scale-102 active:scale-98"
            >
              Back
            </button>
          )}

          {currentScreen < screens.length - 1 && (
            <button
              onClick={handleSkip}
              className="w-full text-white/60 font-medium py-3 hover:text-white/80 
                       transition-all duration-300 hover:scale-105 active:scale-95
                       animate-bounce animation-delay-1000"
            >
              Skip
            </button>
          )}

          <div className="text-center text-white/40 text-sm mt-4 animate-fadeIn animation-delay-1000">
            Swipe left/right or use arrow keys to navigate
          </div>
        </div>
      </div>

      {/* Enhanced Custom CSS */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(1deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }

        @keyframes glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3),
                        0 0 40px rgba(59, 130, 246, 0.1);
          }
          50% { 
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.5),
                        0 0 60px rgba(59, 130, 246, 0.2);
          }
        }

        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.1); }
          50% { transform: scale(1); }
          75% { transform: scale(1.05); }
        }

        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-fadeInScale { animation: fadeInScale 0.8s ease-out forwards; }
        .animate-fadeIn { animation: fadeIn 1s ease-out forwards; }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          background-size: 200px 100%;
          animation: shimmer 3s ease-in-out infinite;
        }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-heartbeat { animation: heartbeat 2s ease-in-out infinite; }
        .animate-float { animation: float var(--duration, 4s) ease-in-out infinite; }
        .animate-scan { animation: scan 2s linear infinite; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-1000 { animation-delay: 1s; }
        .hover\\:scale-102:hover { transform: scale(1.02); }
        .active\\:scale-95:active { transform: scale(0.95); }
        .active\\:scale-98:active { transform: scale(0.98); }
      `}</style>
    </div>
  );
};

export default OnboardingFlow;
```

##### **Onboarding Integration with App Router**
```typescript
// app/onboarding/page.tsx
import OnboardingFlow from '@/components/onboarding/onboarding-flow'

export default function OnboardingPage() {
  return <OnboardingFlow />
}
```

##### **First-time User Detection**
```typescript
// lib/onboarding.ts
export function shouldShowOnboarding(): boolean {
  if (typeof window === 'undefined') return false
  
  const hasSeenOnboarding = localStorage.getItem('tracceaqua-onboarding-completed')
  return !hasSeenOnboarding
}

export function markOnboardingComplete(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tracceaqua-onboarding-completed', 'true')
  }
}

// app/layout.tsx - Root layout check
'use client'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [showOnboarding, setShowOnboarding] = useState(false)
  
  useEffect(() => {
    setShowOnboarding(shouldShowOnboarding())
  }, [])
  
  if (showOnboarding) {
    return (
      <html lang="en">
        <body>
          <OnboardingFlow />
        </body>
      </html>
    )
  }
  
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
```

#### **3.2 Mobile-First Responsive Design**

##### **Progressive Web App Configuration**
```typescript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
})

module.exports = withPWA({
  // ... other config
})
```

```json
// public/manifest.json
{
  "name": "TracceAqua - Seafood Traceability",
  "short_name": "TracceAqua",
  "description": "Blockchain Seafood Traceability & Transparency System",
  "theme_color": "#0891b2",
  "background_color": "#0c4a6e",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/",
  "icons": [
    {
      "src": "icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### **3.3 Role-Based Routing**
```typescript
// components/auth/role-guard.tsx
interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { user } = useAuthStore()
  
  if (!user || !allowedRoles.includes(user.role) || user.status !== 'ACTIVE') {
    return fallback || <UnauthorizedMessage />
  }
  
  return <>{children}</>
}

// components/auth/professional-guard.tsx
export function ProfessionalGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  
  // Allow all professional roles but not consumer or pending upgrade
  const professionalRoles = [
    UserRole.ADMIN,
    UserRole.RESEARCHER,
    UserRole.FARMER,
    UserRole.FISHERMAN,
    UserRole.PROCESSOR,
    UserRole.TRADER,
    UserRole.RETAILER
  ]
  
  if (!user || !professionalRoles.includes(user.role)) {
    return <RoleApplicationPrompt />
  }
  
  return <>{children}</>
}

// app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  
  // Allow all authenticated users, but show different content based on role
  if (!user) {
    return <redirect to="/login" />
  }
  
  return (
    <DashboardShell>
      {user.role === UserRole.CONSUMER ? (
        <ConsumerDashboard />
      ) : user.role === UserRole.PENDING_UPGRADE ? (
        <ApplicationStatusDashboard />
      ) : (
        <ProfessionalDashboard>{children}</ProfessionalDashboard>
      )}
    </DashboardShell>
  )
}
```

#### **3.2 Admin Dashboard**
```typescript
// app/(dashboard)/admin/page.tsx
export default function AdminDashboard() {
  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard title="Pending Users" value={pendingUsers} />
          <StatsCard title="Active Users" value={activeUsers} />
          <StatsCard title="Total Records" value={totalRecords} />
          <StatsCard title="System Health" value="Healthy" />
        </div>
        
        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <UserManagementTable />
          </TabsContent>
          
          <TabsContent value="analytics">
            <SystemAnalytics />
          </TabsContent>
          
          <TabsContent value="settings">
            <SystemSettings />
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  )
}
```

**Testing Checkpoint 3:** ✅ Test onboarding flow with animations, touch gestures, sound effects, and PWA installation; verify consumer dashboard access, role application flow, admin approval system, and professional role-based features

### **Phase 4: Conservation Module (Week 7-8)**

#### **4.1 Conservation Data Models**
```prisma
// Add to schema.prisma
model ConservationRecord {
  id                    String   @id @default(cuid())
  samplingId           String   @unique
  userId               String
  waterBodyType        String
  gpsCoordinates       Json
  samplingDate         DateTime
  weatherConditions    String?
  siteImages           String[] // IPFS hashes
  
  // Organism data
  aquaticCategory      String
  speciesName          String
  numberOfSamples      Int
  organismImages       String[]
  
  // Water parameters
  waterParameters      Json
  parameterImages      String[]
  
  // Sediment data
  sedimentData         Json?
  sedimentImages       String[]
  
  // Lab results
  labResults           Json?
  labReportFiles       String[]
  
  status               String   @default("DRAFT")
  blockchainHash       String?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id])
  
  @@map("conservation_records")
}
```

#### **4.2 Conservation Forms**
```typescript
// components/conservation/sampling-form.tsx
interface SamplingFormData {
  siteInfo: SiteInfoData
  organismData: OrganismData
  waterParameters: WaterParametersData
  sedimentData: SedimentData
  labResults: LabResultsData
}

export function SamplingForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<SamplingFormData>>({})
  
  const form = useForm<SamplingFormData>({
    resolver: zodResolver(samplingSchema)
  })

  const steps = [
    { title: "Site & Sampling Info", component: SiteInfoStep },
    { title: "Organism Category", component: OrganismStep },
    { title: "Water Parameters", component: WaterParametersStep },
    { title: "Sediment Collection", component: SedimentStep },
    { title: "Lab Results", component: LabResultsStep }
  ]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <StepIndicator currentStep={currentStep} totalSteps={steps.length} />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {steps.map((step, index) => (
            currentStep === index + 1 && (
              <step.component 
                key={index}
                form={form}
                onNext={() => setCurrentStep(prev => prev + 1)}
                onPrev={() => setCurrentStep(prev => prev - 1)}
              />
            )
          ))}
        </form>
      </Form>
    </div>
  )
}
```

**Testing Checkpoint 4:** ✅ Test conservation data entry, file uploads to IPFS, and data validation

### **Phase 5: Supply Chain Module (Week 9-10)**

#### **5.1 Supply Chain Data Models**
```prisma
model SupplyChainRecord {
  id               String   @id @default(cuid())
  productId        String   @unique
  userId           String
  batchNumber      String
  sourceType       SourceType
  aquaticCategory  String
  speciesName      String
  productImages    String[]
  
  // Journey stages
  hatcheryData     Json?
  growOutData      Json?
  harvestData      Json?
  fishingData      Json?
  processingData   Json?
  distributionData Json?
  retailData       Json?
  
  currentStage     String
  qrCode           String?
  blockchainHash   String?
  status           String   @default("ACTIVE")
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id])
  
  @@map("supply_chain_records")
}

enum SourceType {
  FARMED
  WILD_CAPTURE
}
```

#### **5.2 Supply Chain Workflow**
```typescript
// components/supply-chain/product-journey.tsx
export function ProductJourney() {
  const [sourceType, setSourceType] = useState<SourceType>()
  const [currentStage, setCurrentStage] = useState<string>()
  
  const farmedStages = [
    { key: 'hatchery', title: 'Hatchery Operations', component: HatcheryForm },
    { key: 'growout', title: 'Grow-out & Rearing', component: GrowOutForm },
    { key: 'harvest', title: 'Harvest Operations', component: HarvestForm },
    { key: 'processing', title: 'Processing', component: ProcessingForm },
    { key: 'distribution', title: 'Distribution', component: DistributionForm },
    { key: 'retail', title: 'Retail', component: RetailForm }
  ]
  
  const wildCaptureStages = [
    { key: 'fishing', title: 'Fishing Operations', component: FishingForm },
    { key: 'processing', title: 'Processing', component: ProcessingForm },
    { key: 'distribution', title: 'Distribution', component: DistributionForm },
    { key: 'retail', title: 'Retail', component: RetailForm }
  ]

  return (
    <div className="space-y-6">
      <SourceTypeSelector onSelect={setSourceType} />
      
      {sourceType && (
        <StageFlow 
          stages={sourceType === 'FARMED' ? farmedStages : wildCaptureStages}
          currentStage={currentStage}
          onStageChange={setCurrentStage}
        />
      )}
    </div>
  )
}
```

**Testing Checkpoint 5:** ✅ Test supply chain workflows for both farmed and wild-capture seafood

### **Phase 6: QR Code & Traceability (Week 11)**

#### **6.1 QR Code Generation**
```typescript
// components/qr-code/qr-generator.tsx
import QRCode from 'react-qr-code'

interface QRGeneratorProps {
  productId: string
  data: TraceabilityData
}

export function QRGenerator({ productId, data }: QRGeneratorProps) {
  const traceUrl = `${process.env.NEXT_PUBLIC_APP_URL}/trace/${productId}`
  
  const downloadQR = () => {
    const svg = document.getElementById('qr-code')
    const svgData = new XMLSerializer().serializeToString(svg!)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `tracceaqua-${productId}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  return (
    <div className="space-y-4">
      <QRCode
        id="qr-code"
        value={traceUrl}
        size={256}
        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
      />
      
      <Button onClick={downloadQR}>
        Download QR Code
      </Button>
    </div>
  )
}
```

#### **6.2 Consumer Tracing Interface**
```typescript
// app/trace/[productId]/page.tsx
export default async function TracePage({ params }: { params: { productId: string } }) {
  const traceData = await getTraceabilityData(params.productId)
  
  if (!traceData) {
    return <ProductNotFound />
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ProductHeader product={traceData.product} />
      
      <Tabs defaultValue="journey">
        <TabsList>
          <TabsTrigger value="journey">Product Journey</TabsTrigger>
          <TabsTrigger value="tests">Test Results</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="journey">
          <JourneyTimeline stages={traceData.stages} />
        </TabsContent>
        
        <TabsContent value="tests">
          <TestResults results={traceData.labResults} />
        </TabsContent>
        
        <TabsContent value="certifications">
          <CertificationsList certs={traceData.certifications} />
        </TabsContent>
      </Tabs>
      
      <ConsumerFeedback productId={params.productId} />
    </div>
  )
}
```

**Testing Checkpoint 6:** ✅ Test QR code generation, scanning, and consumer tracing interface

### **Phase 7: Blockchain Integration (Week 12)**

#### **7.1 Smart Contracts**
```solidity
// contracts/TracceAqua.sol
pragma solidity ^0.8.20;

contract TracceAqua {
    struct ConservationRecord {
        string samplingId;
        string dataHash;
        address researcher;
        uint256 timestamp;
        bool verified;
    }
    
    struct SupplyChainRecord {
        string productId;
        string dataHash;
        address[] stakeholders;
        uint256 timestamp;
        string currentStage;
    }
    
    mapping(string => ConservationRecord) public conservationRecords;
    mapping(string => SupplyChainRecord) public supplyChainRecords;
    mapping(address => bool) public authorizedUsers;
    
    address public admin;
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier onlyAuthorized() {
        require(authorizedUsers[msg.sender], "Not authorized");
        _;
    }
    
    constructor() {
        admin = msg.sender;
        authorizedUsers[msg.sender] = true;
    }
    
    function addConservationRecord(
        string memory _samplingId,
        string memory _dataHash
    ) external onlyAuthorized {
        conservationRecords[_samplingId] = ConservationRecord({
            samplingId: _samplingId,
            dataHash: _dataHash,
            researcher: msg.sender,
            timestamp: block.timestamp,
            verified: false
        });
    }
    
    function addSupplyChainRecord(
        string memory _productId,
        string memory _dataHash,
        string memory _currentStage
    ) external onlyAuthorized {
        SupplyChainRecord storage record = supplyChainRecords[_productId];
        record.productId = _productId;
        record.dataHash = _dataHash;
        record.currentStage = _currentStage;
        record.timestamp = block.timestamp;
        record.stakeholders.push(msg.sender);
    }
    
    function verifyConservationRecord(string memory _samplingId) external onlyAdmin {
        conservationRecords[_samplingId].verified = true;
    }
    
    function authorizeUser(address _user) external onlyAdmin {
        authorizedUsers[_user] = true;
    }
    
    function getConservationRecord(string memory _samplingId) 
        external view returns (ConservationRecord memory) {
        return conservationRecords[_samplingId];
    }
    
    function getSupplyChainRecord(string memory _productId) 
        external view returns (SupplyChainRecord memory) {
        return supplyChainRecords[_productId];
    }
}
```

#### **7.2 Blockchain Service**
```typescript
// lib/blockchain.ts
import { ethers } from 'ethers'
import TracceAquaABI from '../contracts/TracceAqua.json'

class BlockchainService {
  private contract: ethers.Contract
  private provider: ethers.Provider
  
  constructor() {
    this.provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL
    )
    
    this.contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
      TracceAquaABI.abi,
      this.provider
    )
  }
  
  async recordConservationData(samplingId: string, dataHash: string, signer: ethers.Signer) {
    const contractWithSigner = this.contract.connect(signer)
    const tx = await contractWithSigner.addConservationRecord(samplingId, dataHash)
    return await tx.wait()
  }
  
  async recordSupplyChainData(
    productId: string, 
    dataHash: string, 
    currentStage: string,
    signer: ethers.Signer
  ) {
    const contractWithSigner = this.contract.connect(signer)
    const tx = await contractWithSigner.addSupplyChainRecord(productId, dataHash, currentStage)
    return await tx.wait()
  }
  
  async getConservationRecord(samplingId: string) {
    return await this.contract.getConservationRecord(samplingId)
  }
  
  async getSupplyChainRecord(productId: string) {
    return await this.contract.getSupplyChainRecord(productId)
  }
}

export const blockchainService = new BlockchainService()
```

**Testing Checkpoint 7:** ✅ Test smart contract deployment and blockchain data recording

### **Phase 8: Testing & Deployment (Week 13-14)**

#### **8.1 Testing Strategy**

##### **Frontend Testing (Next.js)**
```bash
# Install testing dependencies
pnpm add -D @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
pnpm add -D @playwright/test
```

```typescript
// __tests__/auth.test.tsx
import { render, screen } from '@testing-library/react'
import { AuthProvider } from '../components/auth/auth-provider'
import LoginPage from '../app/(auth)/login/page'

describe('Authentication', () => {
  test('renders login page', () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    )
    
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
  })
})
```

##### **Backend Testing (NestJS)**
```typescript
// test/auth.e2e-spec.ts
describe('AuthController (e2e)', () => {
  let app: INestApplication
  
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()
    
    app = moduleFixture.createNestApplication()
    await app.init()
  })
  
  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ address: '0x...', signature: '0x...' })
      .expect(201)
  })
})
```

#### **8.2 Deployment Configuration**

##### **Frontend Deployment (Vercel)**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    NEXT_PUBLIC_SEPOLIA_RPC_URL: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL,
  },
  images: {
    domains: ['gateway.pinata.cloud'],
  },
}

module.exports = nextConfig
```

##### **Backend Deployment (Railway)**
```dockerfile
# packages/backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm prisma generate
RUN pnpm build

EXPOSE 3001

CMD ["pnpm", "start:prod"]
```

**Testing Checkpoint 8:** ✅ Run full test suites and deploy to production environments

---

## 📋 **ENVIRONMENT VARIABLES**

### **Frontend (.env.local)**
```bash
# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Blockchain
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# API
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# IPFS
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud
```

### **Backend (.env)**
```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/tracceaqua

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=7d

# IPFS/Pinata
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key
PINATA_JWT=your_pinata_jwt

# Blockchain
PRIVATE_KEY=your_deployer_private_key
CONTRACT_ADDRESS=0x...
```

---

## 🧾 **DEVELOPMENT CHECKLIST**

### **Setup Phase**
- [ ] Monorepo with Turborepo configured
- [ ] Next.js frontend setup with TypeScript
- [ ] NestJS backend setup with TypeScript
- [ ] Smart contracts with Hardhat
- [ ] Database with PostgreSQL + Prisma
- [ ] All dependencies installed

### **Authentication Phase**
- [ ] WalletConnect integration with Google social login
- [ ] JWT authentication in backend
- [ ] Role-based access control implemented
- [ ] Admin user management interface
- [ ] User registration flow with approval process

### **Core Features Phase**
- [ ] Advanced onboarding flow with animations and gestures
- [ ] PWA configuration for mobile installation
- [ ] Conservation module with 5-step sampling forms
- [ ] Supply chain module with farmed/wild-capture workflows
- [ ] File upload to IPFS via Pinata
- [ ] QR code generation and scanning
- [ ] Consumer tracing interface

### **Blockchain Phase**
- [ ] Smart contracts deployed to Sepolia
- [ ] Blockchain integration for data recording
- [ ] Transaction verification and monitoring
- [ ] Gas optimization

### **Testing Phase**
- [ ] Unit tests for frontend components
- [ ] Integration tests for API endpoints
- [ ] E2E tests for user workflows
- [ ] Smart contract tests
- [ ] Performance testing

### **Deployment Phase**
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway
- [ ] Database hosted and secured
- [ ] Environment variables configured
- [ ] Monitoring and logging setup

---

## 🎯 **SUCCESS METRICS**

### **Technical Metrics**
- **Performance:** Page load times < 2 seconds
- **Availability:** 99.9% uptime
- **Scalability:** Support for 50,000+ records
- **Security:** Zero critical vulnerabilities

### **Business Metrics**
- **User Adoption:** Active users across all roles
- **Data Quality:** Accuracy and completeness of records
- **Traceability Coverage:** Percentage of products tracked
- **Stakeholder Satisfaction:** User feedback scores

---

## 🔒 **SECURITY BEST PRACTICES**

### **Frontend Security**
- Input validation with Zod schemas
- XSS protection with content security policy
- Secure token storage
- HTTPS enforcement

### **Backend Security**
- Input validation with class-validator
- SQL injection prevention with Prisma
- Rate limiting on API endpoints
- Secure file upload validation

### **Blockchain Security**
- Smart contract auditing
- Private key management
- Transaction verification
- Gas optimization and monitoring

### **Data Security**
- IPFS content addressing for immutability
- End-to-end encryption for sensitive data
- Regular backups and disaster recovery
- Compliance with data protection regulations

---

*This comprehensive guide provides a complete roadmap for building the TracceAqua blockchain seafood traceability system using modern technologies and best practices. Each phase includes detailed implementation steps, testing checkpoints, and security considerations.*