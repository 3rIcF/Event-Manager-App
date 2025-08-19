-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "location" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IDEA',
    "budget" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "responsibleId" TEXT NOT NULL,
    CONSTRAINT "projects_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "project_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "project_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "project_members_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "global_materials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "specs" TEXT,
    "portfolio" TEXT,
    "standardLeadTime" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "global_materials_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "project_materials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" INTEGER NOT NULL,
    "phase" TEXT NOT NULL DEFAULT 'SETUP',
    "location" TEXT,
    "deliveryTime" DATETIME,
    "pickupTime" DATETIME,
    "needs" TEXT,
    "specialPrice" REAL,
    "notes" TEXT,
    "hasOverride" BOOLEAN NOT NULL DEFAULT false,
    "overriddenFields" TEXT,
    "lastSyncVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "projectId" TEXT NOT NULL,
    "globalMaterialId" TEXT NOT NULL,
    CONSTRAINT "project_materials_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "project_materials_globalMaterialId_fkey" FOREIGN KEY ("globalMaterialId") REFERENCES "global_materials" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "global_suppliers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "portfolio" TEXT,
    "regions" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "qualityScore" REAL NOT NULL DEFAULT 0,
    "punctualityScore" REAL NOT NULL DEFAULT 0,
    "priceScore" REAL NOT NULL DEFAULT 0,
    "overallScore" REAL NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "project_suppliers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "arrivalTime" DATETIME,
    "setupTime" DATETIME,
    "operationTime" DATETIME,
    "teardownTime" DATETIME,
    "needs" TEXT,
    "personnel" INTEGER NOT NULL DEFAULT 0,
    "vehicles" TEXT,
    "onsiteContact" TEXT,
    "briefingGenerated" BOOLEAN NOT NULL DEFAULT false,
    "hasOverride" BOOLEAN NOT NULL DEFAULT false,
    "overriddenFields" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "projectId" TEXT NOT NULL,
    "globalSupplierId" TEXT NOT NULL,
    CONSTRAINT "project_suppliers_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "project_suppliers_globalSupplierId_fkey" FOREIGN KEY ("globalSupplierId") REFERENCES "global_suppliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    "projectId" TEXT,
    CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "comments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comments_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "global_materials" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "comments_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "project_materials" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "comments_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "global_suppliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "comments_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "project_suppliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "diff_notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "changes" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" TEXT NOT NULL,
    "globalEntityId" TEXT NOT NULL,
    CONSTRAINT "diff_notifications_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "diff_notifications_globalEntityId_fkey" FOREIGN KEY ("globalEntityId") REFERENCES "global_materials" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "diff_notifications_globalEntityId_fkey" FOREIGN KEY ("globalEntityId") REFERENCES "global_suppliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "project_members_userId_projectId_key" ON "project_members"("userId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "project_materials_projectId_globalMaterialId_key" ON "project_materials"("projectId", "globalMaterialId");

-- CreateIndex
CREATE UNIQUE INDEX "project_suppliers_projectId_globalSupplierId_key" ON "project_suppliers"("projectId", "globalSupplierId");
