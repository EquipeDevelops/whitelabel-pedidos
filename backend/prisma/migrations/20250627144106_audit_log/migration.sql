-- CreateTable
CREATE TABLE "AuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "targetId" INTEGER NOT NULL,
    "targetType" TEXT NOT NULL DEFAULT 'GESTOR',
    "authorId" INTEGER,
    "authorName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "AuditLog_targetId_targetType_idx" ON "AuditLog"("targetId", "targetType");
