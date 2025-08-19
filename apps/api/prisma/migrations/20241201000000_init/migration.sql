-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ORGANIZER', 'ONSITE', 'EXTERNAL_VENDOR');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'APPROVAL_PENDING', 'APPROVED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'BLOCKED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW', 'ESCALATED');

-- CreateEnum
CREATE TYPE "BOMItemType" AS ENUM ('MATERIAL', 'EQUIPMENT', 'SERVICE', 'LABOR', 'OVERHEAD');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('EUR', 'USD', 'CHF', 'GBP');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "phone" TEXT,
    "department" TEXT,
    "position" TEXT,
    "avatar" TEXT,
    "lastLogin" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Berlin',
    "language" TEXT NOT NULL DEFAULT 'de',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offline_actions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "synced" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,

    CONSTRAINT "offline_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "dateFrom" TIMESTAMP(3) NOT NULL,
    "dateTo" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "locationName" TEXT NOT NULL,
    "address" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "ownerId" TEXT NOT NULL,
    "budgetEstimate" DOUBLE PRECISION,
    "budget" DOUBLE PRECISION,
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "priority" TEXT,
    "manager" TEXT,
    "client" TEXT,
    "notes" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "contactPerson" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "taxId" TEXT,
    "rating" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bom_items" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "BOMItemType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "cost" DOUBLE PRECISION,
    "supplierId" TEXT,
    "categoryId" TEXT,
    "sku" TEXT,
    "weight" DOUBLE PRECISION,
    "dimensions" JSONB,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bom_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bom_changes" (
    "id" TEXT NOT NULL,
    "bomItemId" TEXT NOT NULL,
    "changeType" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "reason" TEXT,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bom_changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_categories" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_ratings" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_availability" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "dateFrom" TIMESTAMP(3) NOT NULL,
    "dateTo" TIMESTAMP(3) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_suppliers" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" TEXT,
    "assigneeId" TEXT,
    "dueDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "estimatedHours" DOUBLE PRECISION,
    "actualHours" DOUBLE PRECISION,
    "dependencies" TEXT[],
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_comments" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_logs" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "duration" DOUBLE PRECISION,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slots" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dateFrom" TIMESTAMP(3) NOT NULL,
    "dateTo" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slot_reservations" (
    "id" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "userId" TEXT,
    "taskId" TEXT,
    "resource" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slot_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permits" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "type" TEXT NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "approvedDate" TIMESTAMP(3),
    "rejectedDate" TIMESTAMP(3),
    "requestorId" TEXT NOT NULL,
    "approverId" TEXT,
    "responsibleId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permit_docs" (
    "id" TEXT NOT NULL,
    "permitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "filepath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permit_docs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_expenses" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "date" TIMESTAMP(3) NOT NULL,
    "supplierId" TEXT,
    "invoiceNumber" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "approverId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "filepath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "projectId" TEXT,
    "tags" TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "permitId" TEXT,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT,
    "sku" TEXT,
    "unit" TEXT NOT NULL,
    "cost" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "dimensions" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RoleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PermissionToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ProjectMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_resource_action_key" ON "permissions"("resource", "action");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_email_key" ON "suppliers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_categories_supplierId_categoryId_key" ON "supplier_categories"("supplierId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_ratings_supplierId_userId_category_key" ON "supplier_ratings"("supplierId", "userId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "project_suppliers_projectId_supplierId_key" ON "project_suppliers"("projectId", "supplierId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs"("resource");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "offline_actions_userId_idx" ON "offline_actions"("userId");

-- CreateIndex
CREATE INDEX "offline_actions_synced_idx" ON "offline_actions"("synced");

-- CreateIndex
CREATE INDEX "offline_actions_timestamp_idx" ON "offline_actions"("timestamp");

-- CreateIndex
CREATE INDEX "categories_parentId_idx" ON "categories"("parentId");

-- CreateIndex
CREATE INDEX "categories_name_idx" ON "categories"("name");

-- CreateIndex
CREATE INDEX "projects_ownerId_idx" ON "projects"("ownerId");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_dateFrom_idx" ON "projects"("dateFrom");

-- CreateIndex
CREATE INDEX "projects_dateTo_idx" ON "projects"("dateTo");

-- CreateIndex
CREATE INDEX "projects_locationName_idx" ON "projects"("locationName");

-- CreateIndex
CREATE INDEX "projects_tags_idx" ON "projects"("tags");

-- CreateIndex
CREATE INDEX "suppliers_name_idx" ON "suppliers"("name");

-- CreateIndex
CREATE INDEX "suppliers_rating_idx" ON "suppliers"("rating");

-- CreateIndex
CREATE INDEX "suppliers_isActive_idx" ON "suppliers"("isActive");

-- CreateIndex
CREATE INDEX "bom_items_projectId_idx" ON "bom_items"("projectId");

-- CreateIndex
CREATE INDEX "bom_items_parentId_idx" ON "bom_items"("parentId");

-- CreateIndex
CREATE INDEX "bom_items_type_idx" ON "bom_items"("type");

-- CreateIndex
CREATE INDEX "bom_items_categoryId_idx" ON "bom_items"("categoryId");

-- CreateIndex
CREATE INDEX "bom_items_supplierId_idx" ON "bom_items"("supplierId");

-- CreateIndex
CREATE INDEX "bom_items_sku_idx" ON "bom_items"("sku");

-- CreateIndex
CREATE INDEX "bom_changes_bomItemId_idx" ON "bom_changes"("bomItemId");

-- CreateIndex
CREATE INDEX "bom_changes_changeType_idx" ON "bom_changes"("changeType");

-- CreateIndex
CREATE INDEX "bom_changes_timestamp_idx" ON "bom_changes"("timestamp");

-- CreateIndex
CREATE INDEX "supplier_categories_supplierId_idx" ON "supplier_categories"("supplierId");

-- CreateIndex
CREATE INDEX "supplier_categories_categoryId_idx" ON "supplier_categories"("categoryId");

-- CreateIndex
CREATE INDEX "supplier_ratings_supplierId_idx" ON "supplier_ratings"("supplierId");

-- CreateIndex
CREATE INDEX "supplier_ratings_rating_idx" ON "supplier_ratings"("rating");

-- CreateIndex
CREATE INDEX "supplier_ratings_category_idx" ON "supplier_ratings"("category");

-- CreateIndex
CREATE INDEX "supplier_availability_supplierId_idx" ON "supplier_availability"("supplierId");

-- CreateIndex
CREATE INDEX "supplier_availability_dateFrom_idx" ON "supplier_availability"("dateFrom");

-- CreateIndex
CREATE INDEX "supplier_availability_dateTo_idx" ON "supplier_availability"("dateTo");

-- CreateIndex
CREATE INDEX "project_suppliers_projectId_idx" ON "project_suppliers"("projectId");

-- CreateIndex
CREATE INDEX "project_suppliers_supplierId_idx" ON "project_suppliers"("supplierId");

-- CreateIndex
CREATE INDEX "tasks_projectId_idx" ON "tasks"("projectId");

-- CreateIndex
CREATE INDEX "tasks_assigneeId_idx" ON "tasks"("assigneeId");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "tasks_dueDate_idx" ON "tasks"("dueDate");

-- CreateIndex
CREATE INDEX "tasks_priority_idx" ON "tasks"("priority");

-- CreateIndex
CREATE INDEX "tasks_tags_idx" ON "tasks"("tags");

-- CreateIndex
CREATE INDEX "task_comments_taskId_idx" ON "task_comments"("taskId");

-- CreateIndex
CREATE INDEX "task_comments_userId_idx" ON "task_comments"("userId");

-- CreateIndex
CREATE INDEX "task_comments_createdAt_idx" ON "task_comments"("createdAt");

-- CreateIndex
CREATE INDEX "time_logs_taskId_idx" ON "time_logs"("taskId");

-- CreateIndex
CREATE INDEX "time_logs_userId_idx" ON "time_logs"("userId");

-- CreateIndex
CREATE INDEX "time_logs_startTime_idx" ON "time_logs"("startTime");

-- CreateIndex
CREATE INDEX "time_logs_endTime_idx" ON "time_logs"("endTime");

-- CreateIndex
CREATE INDEX "slots_projectId_idx" ON "slots"("projectId");

-- CreateIndex
CREATE INDEX "slots_type_idx" ON "slots"("type");

-- CreateIndex
CREATE INDEX "slots_dateFrom_idx" ON "slots"("dateFrom");

-- CreateIndex
CREATE INDEX "slots_dateTo_idx" ON "slots"("dateTo");

-- CreateIndex
CREATE INDEX "slot_reservations_slotId_idx" ON "slot_reservations"("slotId");

-- CreateIndex
CREATE INDEX "slot_reservations_userId_idx" ON "slot_reservations"("userId");

-- CreateIndex
CREATE INDEX "slot_reservations_taskId_idx" ON "slot_reservations"("taskId");

-- CreateIndex
CREATE INDEX "permits_projectId_idx" ON "permits"("projectId");

-- CreateIndex
CREATE INDEX "permits_status_idx" ON "permits"("status");

-- CreateIndex
CREATE INDEX "permits_type_idx" ON "permits"("type");

-- CreateIndex
CREATE INDEX "permits_requestorId_idx" ON "permits"("requestorId");

-- CreateIndex
CREATE INDEX "permits_approverId_idx" ON "permits"("approverId");

-- CreateIndex
CREATE INDEX "permits_dueDate_idx" ON "permits"("dueDate");

-- CreateIndex
CREATE INDEX "permit_docs_permitId_idx" ON "permit_docs"("permitId");

-- CreateIndex
CREATE INDEX "permit_docs_userId_idx" ON "permit_docs"("userId");

-- CreateIndex
CREATE INDEX "permit_docs_uploadedAt_idx" ON "permit_docs"("uploadedAt");

-- CreateIndex
CREATE INDEX "project_expenses_projectId_idx" ON "project_expenses"("projectId");

-- CreateIndex
CREATE INDEX "project_expenses_category_idx" ON "project_expenses"("category");

-- CreateIndex
CREATE INDEX "project_expenses_date_idx" ON "project_expenses"("date");

-- CreateIndex
CREATE INDEX "project_expenses_approved_idx" ON "project_expenses"("approved");

-- CreateIndex
CREATE INDEX "project_expenses_supplierId_idx" ON "project_expenses"("supplierId");

-- CreateIndex
CREATE INDEX "files_uploadedBy_idx" ON "files"("uploadedBy");

-- CreateIndex
CREATE INDEX "files_projectId_idx" ON "files"("projectId");

-- CreateIndex
CREATE INDEX "files_mimeType_idx" ON "files"("mimeType");

-- CreateIndex
CREATE INDEX "files_tags_idx" ON "files"("tags");

-- CreateIndex
CREATE INDEX "files_isPublic_idx" ON "files"("isPublic");

-- CreateIndex
CREATE INDEX "comments_projectId_idx" ON "comments"("projectId");

-- CreateIndex
CREATE INDEX "comments_permitId_idx" ON "comments"("permitId");

-- CreateIndex
CREATE INDEX "comments_userId_idx" ON "comments"("userId");

-- CreateIndex
CREATE INDEX "comments_parentId_idx" ON "comments"("parentId");

-- CreateIndex
CREATE INDEX "comments_createdAt_idx" ON "comments"("createdAt");

-- CreateIndex
CREATE INDEX "materials_name_idx" ON "materials"("name");

-- CreateIndex
CREATE INDEX "materials_sku_idx" ON "materials"("sku");

-- CreateIndex
CREATE INDEX "materials_categoryId_idx" ON "materials"("categoryId");

-- CreateIndex
CREATE INDEX "materials_isActive_idx" ON "materials"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "_RoleToUser_AB_unique" ON "_RoleToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "_RoleToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionToRole_AB_unique" ON "_PermissionToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectMembers_AB_unique" ON "_ProjectMembers"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectMembers_B_index" ON "_ProjectMembers"("B");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offline_actions" ADD CONSTRAINT "offline_actions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bom_items" ADD CONSTRAINT "bom_items_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bom_items" ADD CONSTRAINT "bom_items_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "bom_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bom_items" ADD CONSTRAINT "bom_items_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bom_items" ADD CONSTRAINT "bom_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bom_changes" ADD CONSTRAINT "bom_changes_bomItemId_fkey" FOREIGN KEY ("bomItemId") REFERENCES "bom_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bom_changes" ADD CONSTRAINT "bom_changes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_categories" ADD CONSTRAINT "supplier_categories_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_categories" ADD CONSTRAINT "supplier_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_ratings" ADD CONSTRAINT "supplier_ratings_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_ratings" ADD CONSTRAINT "supplier_ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_availability" ADD CONSTRAINT "supplier_availability_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_suppliers" ADD CONSTRAINT "project_suppliers_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_suppliers" ADD CONSTRAINT "project_suppliers_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_logs" ADD CONSTRAINT "time_logs_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_logs" ADD CONSTRAINT "time_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slots" ADD CONSTRAINT "slots_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slot_reservations" ADD CONSTRAINT "slot_reservations_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slot_reservations" ADD CONSTRAINT "slot_reservations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slot_reservations" ADD CONSTRAINT "slot_reservations_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permits" ADD CONSTRAINT "permits_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permits" ADD CONSTRAINT "permits_requestorId_fkey" FOREIGN KEY ("requestorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permits" ADD CONSTRAINT "permits_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permits" ADD CONSTRAINT "permits_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permit_docs" ADD CONSTRAINT "permit_docs_permitId_fkey" FOREIGN KEY ("permitId") REFERENCES "permits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permit_docs" ADD CONSTRAINT "permit_docs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_expenses" ADD CONSTRAINT "project_expenses_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_expenses" ADD CONSTRAINT "project_expenses_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_expenses" ADD CONSTRAINT "project_expenses_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_permitId_fkey" FOREIGN KEY ("permitId") REFERENCES "permits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectMembers" ADD CONSTRAINT "_ProjectMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectMembers" ADD CONSTRAINT "_ProjectMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
