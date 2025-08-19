/*
  Warnings:

  - Added the required column `refType` to the `acceptances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `acceptances` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "purchase_orders" ADD COLUMN "confirmedAt" DATETIME;
ALTER TABLE "purchase_orders" ADD COLUMN "deliveredAt" DATETIME;
ALTER TABLE "purchase_orders" ADD COLUMN "statusNotes" TEXT;

-- AlterTable
ALTER TABLE "suppliers" ADD COLUMN "ratingPunctuality" REAL;

-- CreateTable
CREATE TABLE "offline_actions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "actionData" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME,
    "errorMessage" TEXT,
    CONSTRAINT "offline_actions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "offline_actions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vendor_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "companyName" TEXT,
    "logoPath" TEXT,
    "categories" TEXT,
    "regions" TEXT,
    "portfolio" TEXT,
    "contacts" TEXT,
    "ratingQuality" REAL,
    "ratingDelivery" REAL,
    "ratingPrice" REAL,
    "ratingOverall" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "vendor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rfq_responses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rfqId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "responseData" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "submittedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "rfq_responses_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "rfqs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "rfq_responses_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "invoices_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "invoices_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "supplier_ratings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ratingQuality" REAL NOT NULL,
    "ratingDelivery" REAL NOT NULL,
    "ratingPrice" REAL NOT NULL,
    "ratingOverall" REAL NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "supplier_ratings_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "supplier_ratings_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "supplier_ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_acceptances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    "refType" TEXT NOT NULL,
    "checklistItemsJson" TEXT NOT NULL,
    "acceptedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "acceptedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "acceptances_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "acceptances_acceptedBy_fkey" FOREIGN KEY ("acceptedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_acceptances" ("acceptedBy", "checklistItemsJson", "createdAt", "id", "projectId", "refId", "updatedAt") SELECT "acceptedBy", "checklistItemsJson", "createdAt", "id", "projectId", "refId", "updatedAt" FROM "acceptances";
DROP TABLE "acceptances";
ALTER TABLE "new_acceptances" RENAME TO "acceptances";
CREATE TABLE "new_scan_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refType" TEXT,
    "photoFileId" TEXT,
    "scannedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "scan_logs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "scan_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_scan_logs" ("data", "id", "projectId", "timestamp", "type", "userId") SELECT "data", "id", "projectId", "timestamp", "type", "userId" FROM "scan_logs";
DROP TABLE "scan_logs";
ALTER TABLE "new_scan_logs" RENAME TO "scan_logs";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "vendor_profiles_userId_key" ON "vendor_profiles"("userId");
