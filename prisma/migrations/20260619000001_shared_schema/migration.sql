-- Create enums
CREATE TYPE "TransferRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'COMPLETED');
CREATE TYPE "TransferDirection" AS ENUM ('SEND', 'RECEIVE');

-- User table — only id is needed because fragment-composer depends on User data
-- from the UI service and never reads other User columns.
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Device table
CREATE TABLE "Device" (
    "deviceId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Device_pkey" PRIMARY KEY ("deviceId"),
    CONSTRAINT "Device_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- VideoProject table
CREATE TABLE "VideoProject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VideoProject_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "VideoProject_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Fragment table
CREATE TABLE "Fragment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "duration" DOUBLE PRECISION,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Fragment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Fragment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "VideoProject"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- TransferRequest table
CREATE TABLE "TransferRequest" (
    "id" TEXT NOT NULL,
    "direction" "TransferDirection" NOT NULL,
    "status" "TransferRequestStatus" NOT NULL DEFAULT 'PENDING',
    "sourceDeviceId" TEXT NOT NULL,
    "targetDeviceId" TEXT NOT NULL,
    "projectId" TEXT,
    "projectName" TEXT,
    "fragmentIds" TEXT[],
    "fragmentNames" TEXT[],
    "message" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TransferRequest_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TransferRequest_sourceDeviceId_fkey" FOREIGN KEY ("sourceDeviceId") REFERENCES "Device"("deviceId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TransferRequest_targetDeviceId_fkey" FOREIGN KEY ("targetDeviceId") REFERENCES "Device"("deviceId") ON DELETE CASCADE ON UPDATE CASCADE
);
