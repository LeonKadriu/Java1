-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReviewTarget" AS ENUM ('PROVIDER', 'REQUESTER');

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "estimatedDays" INTEGER,
    "status" "OfferStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" "JobStatus" NOT NULL DEFAULT 'ACTIVE',
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetType" "ReviewTarget" NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Offer_providerId_idx" ON "Offer"("providerId");

-- CreateIndex
CREATE INDEX "Offer_status_idx" ON "Offer"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_requestId_providerId_key" ON "Offer"("requestId", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_offerId_key" ON "Job"("offerId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_requestId_key" ON "Job"("requestId");

-- CreateIndex
CREATE INDEX "Job_requesterId_idx" ON "Job"("requesterId");

-- CreateIndex
CREATE INDEX "Job_providerId_idx" ON "Job"("providerId");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "Review_targetId_idx" ON "Review"("targetId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_jobId_reviewerId_key" ON "Review"("jobId", "reviewerId");

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
