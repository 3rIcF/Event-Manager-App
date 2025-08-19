-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dateFrom" DATETIME NOT NULL,
    "dateTo" DATETIME NOT NULL,
    "locationName" TEXT NOT NULL,
    "address" TEXT,
    "lat" REAL,
    "lng" REAL,
    "ownerId" TEXT NOT NULL,
    "budgetEstimate" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "projects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "materials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "sku" TEXT,
    "unit" TEXT NOT NULL,
    "specsJson" TEXT,
    "defaultLeadTime" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "materials_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "regionsJson" TEXT,
    "portfolioJson" TEXT,
    "contactsJson" TEXT,
    "ratingQuality" REAL,
    "ratingDelivery" REAL,
    "ratingPrice" REAL,
    "ratingOverall" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "project_materials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "notes" TEXT,
    "overridesJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "project_materials_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "project_materials_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "project_suppliers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "project_suppliers_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "project_suppliers_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "clusters" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "clusters_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "clusters_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bom_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "materialId" TEXT,
    "clusterId" TEXT,
    "categoryId" TEXT,
    "name" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "bom_items_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bom_items_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "bom_items_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "clusters" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "bom_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rfqs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "rfqs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rfq_recipients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rfqId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "rfq_recipients_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "rfqs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "rfq_recipients_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "rfq_recipients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wishlists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "rfqId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "wishlists_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "wishlists_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "rfqs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "wishlists_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wishlist_responses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wishlistId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "coverageJson" TEXT NOT NULL,
    "validUntil" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "wishlist_responses_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "wishlists" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "wishlist_responses_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "offers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "rfqId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "lineItemsJson" TEXT NOT NULL,
    "transportCost" REAL,
    "total" REAL NOT NULL,
    "validUntil" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "offers_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "offers_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "rfqs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "offers_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "awards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "rfqId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "deciderId" TEXT NOT NULL,
    "awardsJson" TEXT NOT NULL,
    "rationale" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "awards_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "awards_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "rfqs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "awards_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "awards_deciderId_fkey" FOREIGN KEY ("deciderId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "poNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "contactOnsite" TEXT,
    "itemsJson" TEXT NOT NULL,
    "total" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "purchase_orders_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "purchase_orders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dl_slots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "dateFrom" DATETIME NOT NULL,
    "dateTo" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "persons" INTEGER,
    "vehiclesJson" TEXT,
    "needsJson" TEXT,
    "onsiteContact" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "dl_slots_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "slots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "dateFrom" DATETIME NOT NULL,
    "dateTo" DATETIME NOT NULL,
    "bufferMin" INTEGER,
    "resourcesJson" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "slots_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "bomItemId" TEXT,
    "dateFrom" DATETIME NOT NULL,
    "dateTo" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reservations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reservations_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reservations_bomItemId_fkey" FOREIGN KEY ("bomItemId") REFERENCES "bom_items" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inventory_skus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "materialId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "inventory_skus_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "inventory_skus_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "permits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "assignee" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "permits_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "permits_assignee_fkey" FOREIGN KEY ("assignee") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "permit_docs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "permitId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "permit_docs_permitId_fkey" FOREIGN KEY ("permitId") REFERENCES "permits" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "permit_docs_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "acceptances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    "checklistItemsJson" TEXT NOT NULL,
    "acceptedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "acceptances_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "acceptances_acceptedBy_fkey" FOREIGN KEY ("acceptedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "accommodations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "nightsDateArray" TEXT NOT NULL,
    "roomType" TEXT,
    "assignedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "accommodations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "accommodations_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meal_plans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "mealType" TEXT NOT NULL,
    "persons" INTEGER NOT NULL,
    "allergiesJson" TEXT,
    "deliveryTime" DATETIME,
    "assignedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "meal_plans_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "meal_plans_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" TEXT NOT NULL,
    "area" TEXT,
    "photosJson" TEXT,
    "assignee" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "incidents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "incidents_assignee_fkey" FOREIGN KEY ("assignee") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "service_acceptances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "poId" TEXT NOT NULL,
    "linesJson" TEXT NOT NULL,
    "acceptedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "service_acceptances_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "service_acceptances_acceptedBy_fkey" FOREIGN KEY ("acceptedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cost_summaries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "budgetTotal" REAL NOT NULL,
    "actualTotal" REAL NOT NULL,
    "byCategoryJson" TEXT NOT NULL,
    "variancePct" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cost_summaries_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT,
    "name" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "files_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "files_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT,
    "text" TEXT NOT NULL,
    "attachmentsJson" TEXT,
    "createdBy" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "comments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "comments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diffJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "scan_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "scan_logs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "scan_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "return_lines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "return_lines_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "materials_sku_key" ON "materials"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_skus_sku_key" ON "inventory_skus"("sku");
