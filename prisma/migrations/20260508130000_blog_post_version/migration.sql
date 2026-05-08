-- CreateTable
CREATE TABLE "BlogPostVersion" (
    "id" TEXT NOT NULL,
    "blogPostId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogPostVersion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BlogPostVersion" ADD CONSTRAINT "BlogPostVersion_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostVersion" ADD CONSTRAINT "BlogPostVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "BlogPostVersion_blogPostId_version_idx" ON "BlogPostVersion"("blogPostId", "version");
