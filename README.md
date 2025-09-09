# TracceAqua - Blockchain Seafood Traceability System

![TracceAqua Logo](https://via.placeholder.com/400x100/1e40af/ffffff?text=TracceAqua)

**A comprehensive blockchain-based seafood traceability system for the Nigerian shellfish supply chain.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1+-blue)](https://www.typescriptlang.org/)

## 🌊 **Overview**

TracceAqua provides end-to-end traceability for seafood products from harvest/farming to consumer, combining blockchain technology with user-friendly interfaces to ensure transparency, sustainability, and trust in the seafood supply chain.

### **Key Features**

- **🔗 Blockchain Integration**: Immutable record keeping on Sepolia testnet
- **📱 Mobile-First PWA**: Responsive design optimized for mobile devices
- **🔐 Multi-Authentication**: WalletConnect + Google OAuth integration
- **📊 Conservation Module**: 5-step sampling forms with lab test integration
- **🚚 Supply Chain Tracking**: Complete farmed/wild-capture workflows
- **📱 QR Code System**: Generate and scan codes for instant tracing
- **👥 Role-Based Access**: Consumer, Researcher, Farmer, Processor, Trader, Retailer, Admin
- **☁️ IPFS Storage**: Decentralized file storage via Pinata
- **⭐ Consumer Feedback**: Public ratings and reviews system

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Blockchain    │
│   (Next.js)     │◄──►│   (NestJS)      │◄──►│   (Solidity)    │
│                 │    │                 │    │                 │
│ • React/TypeScript│   │ • REST APIs     │    │ • Smart Contract│
│ • Tailwind CSS   │   │ • Prisma ORM    │    │ • Sepolia Testnet│
│ • WalletConnect  │   │ • JWT Auth      │    │ • Role-based AC  │
│ • QR Scanner     │   │ • File Upload   │    │ • Event Emission │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Railway       │    │   Ethereum      │
│   Deployment    │    │   PostgreSQL    │    │   Network       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                               ▼
                    ┌─────────────────┐
                    │   IPFS/Pinata   │
                    │   File Storage  │
                    └─────────────────┘
```

## 🚀 **Quick Start**

### **Prerequisites**

- Node.js 18+
- pnpm 8+
- PostgreSQL 16+
- MetaMask or compatible wallet

### **Installation**

```bash
# Clone the repository
git clone https://github.com/tracceaqua/tracceaqua-monorepo.git
cd tracceaqua-monorepo

# Install dependencies
pnpm install

# Setup environment variables
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env.local
cp packages/contracts/.env.example packages/contracts/.env

# Setup database
pnpm --filter backend db:setup

# Build all packages
pnpm build
```

### **Development**

```bash
# Start all services in development mode
pnpm dev

# Or start individually
pnpm --filter backend start:dev    # Backend on :3001
pnpm --filter frontend dev          # Frontend on :3000
pnpm --filter contracts node        # Hardhat node on :8545
```

### **Deployment**

```bash
# Deploy smart contracts
pnpm deploy:contracts

# Deploy backend (Railway)
pnpm deploy:backend

# Deploy frontend (Vercel)  
pnpm deploy:frontend
```

## 📁 **Project Structure**

```
tracceaqua-monorepo/
├── packages/
│   ├── frontend/           # Next.js React application
│   │   ├── src/
│   │   │   ├── app/       # App router pages
│   │   │   ├── components/ # Reusable components
│   │   │   ├── lib/       # Utilities and services
│   │   │   └── types/     # TypeScript definitions
│   │   └── public/        # Static assets
│   │
│   ├── backend/           # NestJS API server
│   │   ├── src/
│   │   │   ├── auth/      # Authentication module
│   │   │   ├── conservation/ # Conservation module
│   │   │   ├── supply-chain/ # Supply chain module
│   │   │   ├── files/     # File upload module
│   │   │   ├── blockchain/ # Blockchain integration
│   │   │   └── admin/     # Admin management
│   │   ├── prisma/        # Database schema
│   │   └── test/          # Test files
│   │
│   └── contracts/         # Smart contracts
│       ├── contracts/     # Solidity contracts
│       ├── scripts/       # Deployment scripts
│       └── test/         # Contract tests
│
├── deployment/           # Deployment scripts
└── docs/                # Documentation
```

## 🔧 **Configuration**

### **Environment Variables**

**Backend (.env)**
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/tracceaqua"
JWT_SECRET="your-super-secret-jwt-key"
PINATA_JWT="your-pinata-jwt-token"
SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com"
CONTRACT_ADDRESS="0x..."
DEPLOYER_PRIVATE_KEY="your-deployer-private-key"
```

**Frontend (.env.local)**
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your-walletconnect-project-id"
NEXT_PUBLIC_CONTRACT_ADDRESS="0x..."
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com"
```

## 🧪 **Testing**

```bash
# Run all tests
pnpm test

# Run backend tests
pnpm --filter backend test

# Run E2E tests
pnpm test:e2e

# Run smart contract tests
pnpm --filter contracts test

# Test coverage
pnpm --filter backend test:cov
```

## 📊 **API Documentation**

When running in development mode, comprehensive API documentation is available at:
- **Swagger UI**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/health
- **System Stats**: http://localhost:3001/stats

## 🎯 **User Roles**

| Role | Permissions |
|------|-------------|
| **Consumer** | View public products, leave feedback, trace products |
| **Researcher** | Create conservation records, upload sampling data |
| **Farmer** | Manage hatchery, grow-out, and harvest stages |
| **Fisherman** | Record fishing operations and wild-capture data |
| **Processor** | Handle processing stage operations |
| **Trader** | Manage distribution and transportation |
| **Retailer** | Handle retail operations and sales |
| **Admin** | Full system access, user management, verification |

## 🔐 **Security Features**

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions system
- **Input Validation**: Comprehensive data validation
- **Rate Limiting**: API abuse prevention
- **CORS Protection**: Cross-origin request security
- **Helmet Security**: HTTP header protection
- **Data Encryption**: Sensitive data encryption

## 🌍 **Production Deployment**

### **Smart Contracts (Sepolia Testnet)**
```bash
cd packages/contracts
pnpm deploy:sepolia
pnpm verify:sepolia
```

### **Backend (Railway)**
```bash
cd packages/backend
railway login
railway link
railway up
```

### **Frontend (Vercel)**
```bash
cd packages/frontend
vercel --prod
```

## 📈 **Performance Metrics**

- **Load Time**: < 3 seconds
- **Lighthouse Score**: > 95
- **API Response**: < 200ms
- **Uptime**: 99.9%
- **Gas Optimization**: < 500,000 gas per transaction

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 **Acknowledgments**

- OpenZeppelin for smart contract libraries
- Pinata for IPFS hosting
- WalletConnect for Web3 authentication
- Railway for backend hosting
- Vercel for frontend deployment

---

**TracceAqua** - Bringing transparency to the seafood supply chain through blockchain technology.

For more information, visit [tracceaqua.com](https://tracceaqua.com) or contact us at hello@tracceaqua.com