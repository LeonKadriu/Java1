-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "attributeSchema" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRequest" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "city" TEXT,
    "country" TEXT,
    "address" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "budgetAmount" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" "RequestStatus" NOT NULL DEFAULT 'OPEN',
    "attributes" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex
CREATE INDEX "Category_isActive_idx" ON "Category"("isActive");

-- CreateIndex
CREATE INDEX "ServiceRequest_requesterId_idx" ON "ServiceRequest"("requesterId");

-- CreateIndex
CREATE INDEX "ServiceRequest_categoryId_idx" ON "ServiceRequest"("categoryId");

-- CreateIndex
CREATE INDEX "ServiceRequest_status_idx" ON "ServiceRequest"("status");

-- CreateIndex
CREATE INDEX "ServiceRequest_city_idx" ON "ServiceRequest"("city");

-- CreateIndex
CREATE INDEX "ServiceRequest_createdAt_idx" ON "ServiceRequest"("createdAt");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
