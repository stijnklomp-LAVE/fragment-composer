-- Create new enums
CREATE TYPE "ParticipantRole" AS ENUM ('SOURCE', 'TARGET');
CREATE TYPE "ParticipantStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED');

-- Add new values to TransferRequestStatus
ALTER TYPE "TransferRequestStatus" ADD VALUE IF NOT EXISTS 'ACTIVE';
ALTER TYPE "TransferRequestStatus" ADD VALUE IF NOT EXISTS 'DELETED';

-- Drop old TransferRequest foreign keys and recreate the table
DROP TABLE IF EXISTS "TransferRequest" CASCADE;

CREATE TABLE "TransferRequest" (
    "id" TEXT NOT NULL,
    "direction" "TransferDirection" NOT NULL,
    "status" "TransferRequestStatus" NOT NULL DEFAULT 'PENDING',
    "projectId" TEXT,
    "projectName" TEXT,
    "fragmentIds" TEXT[],
    "fragmentNames" TEXT[],
    "message" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TransferRequest_pkey" PRIMARY KEY ("id")
);

-- Create TransferRequestParticipant table
CREATE TABLE "TransferRequestParticipant" (
    "id" TEXT NOT NULL,
    "transferRequestId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "role" "ParticipantRole" NOT NULL,
    "status" "ParticipantStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TransferRequestParticipant_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TransferRequestParticipant_transferRequestId_fkey" FOREIGN KEY ("transferRequestId") REFERENCES "TransferRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TransferRequestParticipant_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("deviceId") ON DELETE CASCADE ON UPDATE CASCADE
);
