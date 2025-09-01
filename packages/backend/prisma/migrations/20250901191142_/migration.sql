-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'RESEARCHER', 'FARMER', 'FISHERMAN', 'PROCESSOR', 'TRADER', 'RETAILER', 'CONSUMER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "email" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CONSUMER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "organization" TEXT,
    "licenseNumber" TEXT,
    "phoneNumber" TEXT,
    "profileImage" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestedRole" "UserRole" NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "organization" TEXT,
    "licenseNumber" TEXT,
    "businessType" TEXT,
    "experience" TEXT,
    "motivation" TEXT,
    "documents" TEXT[],
    "reviewedBy" TEXT,
    "adminFeedback" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_actions" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conservation_records" (
    "id" TEXT NOT NULL,
    "samplingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "locationData" JSONB NOT NULL,
    "speciesData" JSONB NOT NULL,
    "samplingData" JSONB NOT NULL,
    "labTests" JSONB,
    "fileHashes" TEXT[],
    "researcherNotes" TEXT,
    "weatherConditions" TEXT,
    "tidalConditions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "dataHash" TEXT,
    "blockchainHash" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "verificationNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conservation_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supply_chain_records" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "batchId" TEXT,
    "sourceType" TEXT NOT NULL,
    "speciesName" TEXT NOT NULL,
    "productName" TEXT,
    "productDescription" TEXT,
    "hatcheryData" JSONB,
    "growOutData" JSONB,
    "harvestData" JSONB,
    "fishingData" JSONB,
    "processingData" JSONB,
    "distributionData" JSONB,
    "retailData" JSONB,
    "currentStage" TEXT NOT NULL,
    "qrCodeData" TEXT,
    "fileHashes" TEXT[],
    "dataHash" TEXT,
    "blockchainHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "qualityGrade" TEXT,
    "certifications" TEXT[],
    "testResults" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supply_chain_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_address_key" ON "users"("address");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "conservation_records_samplingId_key" ON "conservation_records"("samplingId");

-- CreateIndex
CREATE INDEX "conservation_records_userId_idx" ON "conservation_records"("userId");

-- CreateIndex
CREATE INDEX "conservation_records_status_idx" ON "conservation_records"("status");

-- CreateIndex
CREATE INDEX "conservation_records_samplingId_idx" ON "conservation_records"("samplingId");

-- CreateIndex
CREATE INDEX "conservation_records_createdAt_idx" ON "conservation_records"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "supply_chain_records_productId_key" ON "supply_chain_records"("productId");

-- CreateIndex
CREATE INDEX "supply_chain_records_userId_idx" ON "supply_chain_records"("userId");

-- CreateIndex
CREATE INDEX "supply_chain_records_productId_idx" ON "supply_chain_records"("productId");

-- CreateIndex
CREATE INDEX "supply_chain_records_batchId_idx" ON "supply_chain_records"("batchId");

-- CreateIndex
CREATE INDEX "supply_chain_records_currentStage_idx" ON "supply_chain_records"("currentStage");

-- CreateIndex
CREATE INDEX "supply_chain_records_sourceType_idx" ON "supply_chain_records"("sourceType");

-- CreateIndex
CREATE INDEX "supply_chain_records_isPublic_idx" ON "supply_chain_records"("isPublic");

-- CreateIndex
CREATE INDEX "supply_chain_records_createdAt_idx" ON "supply_chain_records"("createdAt");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_applications" ADD CONSTRAINT "role_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_applications" ADD CONSTRAINT "role_applications_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conservation_records" ADD CONSTRAINT "conservation_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_chain_records" ADD CONSTRAINT "supply_chain_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
