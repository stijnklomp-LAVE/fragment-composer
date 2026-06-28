-- Idempotent migration: creates tables if they don't exist, adds columns if missing.
-- Handles any run order between client and fragment-composer migrations.

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum (idempotent via DO block — IF NOT EXISTS is unsupported for CREATE TYPE)
DO $$ BEGIN
    CREATE TYPE "TransferRequestStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'DELETED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TransferDirection" AS ENUM ('SEND', 'RECEIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ParticipantRole" AS ENUM ('SOURCE', 'TARGET');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ParticipantStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable (idempotent)
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Device" (
    "deviceId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Device_pkey" PRIMARY KEY ("deviceId")
);

CREATE TABLE IF NOT EXISTS "VideoProject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VideoProject_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Fragment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "duration" DOUBLE PRECISION,
    "projectId" TEXT NOT NULL,
    "creatorDeviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Fragment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "DeviceFragment" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "fragmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updaterDeviceId" TEXT,
    CONSTRAINT "DeviceFragment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TransferRequest" (
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

CREATE TABLE IF NOT EXISTS "TransferRequestParticipant" (
    "id" TEXT NOT NULL,
    "transferRequestId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "role" "ParticipantRole" NOT NULL,
    "status" "ParticipantStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TransferRequestParticipant_pkey" PRIMARY KEY ("id")
);

-- Add columns in case the table already existed from another service's migration
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "markedForDeletionAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deletionScheduledAt" TIMESTAMP(3);
ALTER TABLE "Fragment" ADD COLUMN IF NOT EXISTS "creatorDeviceId" TEXT;

-- CreateIndex (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS "DeviceFragment_deviceId_fragmentId_key" ON "DeviceFragment"("deviceId", "fragmentId");

-- AddForeignKey (idempotent via DO block)
DO $$ BEGIN
    ALTER TABLE "Device" ADD CONSTRAINT "Device_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "VideoProject" ADD CONSTRAINT "VideoProject_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Fragment" ADD CONSTRAINT "Fragment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "VideoProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "DeviceFragment" ADD CONSTRAINT "DeviceFragment_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("deviceId") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "DeviceFragment" ADD CONSTRAINT "DeviceFragment_fragmentId_fkey" FOREIGN KEY ("fragmentId") REFERENCES "Fragment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "TransferRequestParticipant" ADD CONSTRAINT "TransferRequestParticipant_transferRequestId_fkey" FOREIGN KEY ("transferRequestId") REFERENCES "TransferRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "TransferRequestParticipant" ADD CONSTRAINT "TransferRequestParticipant_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("deviceId") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable (idempotent) -- TimelineLayer and TimelineSegment for timeline editing
CREATE TABLE IF NOT EXISTS "TimelineLayer" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TimelineLayer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TimelineSegment" (
    "id" TEXT NOT NULL,
    "layerId" TEXT NOT NULL,
    "fragmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "inPoint" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "outPoint" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TimelineSegment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS "TimelineLayer_projectId_zIndex_key" ON "TimelineLayer"("projectId", "zIndex");
CREATE INDEX IF NOT EXISTS "TimelineSegment_layerId_order_idx" ON "TimelineSegment"("layerId", "order");

-- AddForeignKey (idempotent via DO block)
DO $$ BEGIN
    ALTER TABLE "TimelineLayer" ADD CONSTRAINT "TimelineLayer_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "VideoProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "TimelineSegment" ADD CONSTRAINT "TimelineSegment_layerId_fkey" FOREIGN KEY ("layerId") REFERENCES "TimelineLayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "TimelineSegment" ADD CONSTRAINT "TimelineSegment_fragmentId_fkey" FOREIGN KEY ("fragmentId") REFERENCES "Fragment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
