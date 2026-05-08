-- AlterEnum
ALTER TYPE "PageStatus" ADD VALUE 'SCHEDULED';
ALTER TYPE "PostStatus" ADD VALUE 'SCHEDULED';

-- AlterTable
ALTER TABLE "Page" ADD COLUMN "publishAt" TIMESTAMP(3);
ALTER TABLE "BlogPost" ADD COLUMN "publishAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Page_publishAt_idx" ON "Page"("publishAt");
CREATE INDEX "BlogPost_publishAt_idx" ON "BlogPost"("publishAt");
