/*
  Warnings:

  - Added the required column `order` to the `criteria` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "criteria" ADD COLUMN     "order" INTEGER NOT NULL,
ADD COLUMN     "templateCriterionId" TEXT;

-- AlterTable
ALTER TABLE "spk_records" ADD COLUMN     "templateId" TEXT;

-- CreateTable
CREATE TABLE "spk_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spk_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_criteria" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "template_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_sub_criteria" (
    "id" TEXT NOT NULL,
    "templateCriterionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "template_sub_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "template_sub_criteria_templateCriterionId_value_key" ON "template_sub_criteria"("templateCriterionId", "value");

-- AddForeignKey
ALTER TABLE "spk_templates" ADD CONSTRAINT "spk_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_criteria" ADD CONSTRAINT "template_criteria_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "spk_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_sub_criteria" ADD CONSTRAINT "template_sub_criteria_templateCriterionId_fkey" FOREIGN KEY ("templateCriterionId") REFERENCES "template_criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spk_records" ADD CONSTRAINT "spk_records_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "spk_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
