-- AlterTable
ALTER TABLE "invoices" ADD COLUMN "description" TEXT;
ALTER TABLE "invoices" ADD COLUMN "filePath" TEXT;

-- AlterTable
ALTER TABLE "purchase_orders" ADD COLUMN "confirmationNotes" TEXT;
ALTER TABLE "purchase_orders" ADD COLUMN "deliveryNotes" TEXT;
ALTER TABLE "purchase_orders" ADD COLUMN "deliveryProofPath" TEXT;

-- AlterTable
ALTER TABLE "rfq_responses" ADD COLUMN "deliveryTime" TEXT;
ALTER TABLE "rfq_responses" ADD COLUMN "notes" TEXT;
ALTER TABLE "rfq_responses" ADD COLUMN "price" REAL;
ALTER TABLE "rfq_responses" ADD COLUMN "terms" TEXT;

-- AlterTable
ALTER TABLE "vendor_profiles" ADD COLUMN "address" TEXT;
ALTER TABLE "vendor_profiles" ADD COLUMN "city" TEXT;
ALTER TABLE "vendor_profiles" ADD COLUMN "contactPerson" TEXT;
ALTER TABLE "vendor_profiles" ADD COLUMN "country" TEXT;
ALTER TABLE "vendor_profiles" ADD COLUMN "description" TEXT;
ALTER TABLE "vendor_profiles" ADD COLUMN "phone" TEXT;
ALTER TABLE "vendor_profiles" ADD COLUMN "postalCode" TEXT;
ALTER TABLE "vendor_profiles" ADD COLUMN "terms" TEXT;
ALTER TABLE "vendor_profiles" ADD COLUMN "website" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_rfqs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "supplierId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "rfqs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "rfqs_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_rfqs" ("createdAt", "description", "dueDate", "id", "projectId", "status", "title", "updatedAt") SELECT "createdAt", "description", "dueDate", "id", "projectId", "status", "title", "updatedAt" FROM "rfqs";
DROP TABLE "rfqs";
ALTER TABLE "new_rfqs" RENAME TO "rfqs";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
