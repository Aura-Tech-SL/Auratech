-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN "translationKey" TEXT;

-- CreateIndex
CREATE INDEX "BlogPost_translationKey_idx" ON "BlogPost"("translationKey");
