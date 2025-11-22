/*
  Warnings:

  - The primary key for the `alternative_values` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `alternativeId` on the `alternative_values` table. All the data in the column will be lost.
  - You are about to drop the column `criterionId` on the `alternative_values` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `alternative_values` table. All the data in the column will be lost.
  - The primary key for the `alternatives` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `alternatives` table. All the data in the column will be lost.
  - You are about to drop the column `spkId` on the `alternatives` table. All the data in the column will be lost.
  - The primary key for the `criteria` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `criteria` table. All the data in the column will be lost.
  - You are about to drop the column `spkId` on the `criteria` table. All the data in the column will be lost.
  - You are about to drop the column `templateCriterionId` on the `criteria` table. All the data in the column will be lost.
  - The primary key for the `refresh_tokens` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `refresh_tokens` table. All the data in the column will be lost.
  - The primary key for the `saw_results` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `alternativeId` on the `saw_results` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `saw_results` table. All the data in the column will be lost.
  - You are about to drop the column `spkId` on the `saw_results` table. All the data in the column will be lost.
  - The primary key for the `spk_records` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `spk_records` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `spk_records` table. All the data in the column will be lost.
  - You are about to drop the column `templateId` on the `spk_records` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `spk_records` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `spk_records` table. All the data in the column will be lost.
  - The primary key for the `spk_templates` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `spk_templates` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `spk_templates` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `spk_templates` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `spk_templates` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `spk_templates` table. All the data in the column will be lost.
  - The primary key for the `sub_criteria` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `criterionId` on the `sub_criteria` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `sub_criteria` table. All the data in the column will be lost.
  - The primary key for the `template_criteria` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `template_criteria` table. All the data in the column will be lost.
  - You are about to drop the column `templateId` on the `template_criteria` table. All the data in the column will be lost.
  - The primary key for the `template_sub_criteria` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `template_sub_criteria` table. All the data in the column will be lost.
  - You are about to drop the column `templateCriterionId` on the `template_sub_criteria` table. All the data in the column will be lost.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - The primary key for the `wp_results` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `alternativeId` on the `wp_results` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `wp_results` table. All the data in the column will be lost.
  - You are about to drop the column `spkId` on the `wp_results` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[alternative_id,criterion_id]` on the table `alternative_values` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[spk_id,alternative_id]` on the table `saw_results` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[criterion_id,value]` on the table `sub_criteria` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[template_criterion_id,value]` on the table `template_sub_criteria` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[spk_id,alternative_id]` on the table `wp_results` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `alternative_id` to the `alternative_values` table without a default value. This is not possible if the table is not empty.
  - The required column `alternative_value_id` was added to the `alternative_values` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `criterion_id` to the `alternative_values` table without a default value. This is not possible if the table is not empty.
  - The required column `alternative_id` was added to the `alternatives` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `spk_id` to the `alternatives` table without a default value. This is not possible if the table is not empty.
  - The required column `criterion_id` was added to the `criteria` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `spk_id` to the `criteria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.
  - The required column `refresh_token_id` was added to the `refresh_tokens` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `user_id` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `alternative_id` to the `saw_results` table without a default value. This is not possible if the table is not empty.
  - The required column `saw_result_id` was added to the `saw_results` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `spk_id` to the `saw_results` table without a default value. This is not possible if the table is not empty.
  - The required column `spk_id` was added to the `spk_records` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `updated_at` to the `spk_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `spk_records` table without a default value. This is not possible if the table is not empty.
  - The required column `template_id` was added to the `spk_templates` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `updated_at` to the `spk_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `spk_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `criterion_id` to the `sub_criteria` table without a default value. This is not possible if the table is not empty.
  - The required column `sub_criteria_id` was added to the `sub_criteria` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `template_criterion_id` was added to the `template_criteria` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `template_id` to the `template_criteria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `template_criterion_id` to the `template_sub_criteria` table without a default value. This is not possible if the table is not empty.
  - The required column `template_sub_criteria_id` was added to the `template_sub_criteria` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.
  - The required column `user_id` was added to the `users` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `alternative_id` to the `wp_results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spk_id` to the `wp_results` table without a default value. This is not possible if the table is not empty.
  - The required column `wp_result_id` was added to the `wp_results` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "alternative_values" DROP CONSTRAINT "alternative_values_alternativeId_fkey";

-- DropForeignKey
ALTER TABLE "alternative_values" DROP CONSTRAINT "alternative_values_criterionId_fkey";

-- DropForeignKey
ALTER TABLE "alternatives" DROP CONSTRAINT "alternatives_spkId_fkey";

-- DropForeignKey
ALTER TABLE "criteria" DROP CONSTRAINT "criteria_spkId_fkey";

-- DropForeignKey
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_userId_fkey";

-- DropForeignKey
ALTER TABLE "saw_results" DROP CONSTRAINT "saw_results_alternativeId_fkey";

-- DropForeignKey
ALTER TABLE "saw_results" DROP CONSTRAINT "saw_results_spkId_fkey";

-- DropForeignKey
ALTER TABLE "spk_records" DROP CONSTRAINT "spk_records_templateId_fkey";

-- DropForeignKey
ALTER TABLE "spk_records" DROP CONSTRAINT "spk_records_userId_fkey";

-- DropForeignKey
ALTER TABLE "spk_templates" DROP CONSTRAINT "spk_templates_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "sub_criteria" DROP CONSTRAINT "sub_criteria_criterionId_fkey";

-- DropForeignKey
ALTER TABLE "template_criteria" DROP CONSTRAINT "template_criteria_templateId_fkey";

-- DropForeignKey
ALTER TABLE "template_sub_criteria" DROP CONSTRAINT "template_sub_criteria_templateCriterionId_fkey";

-- DropForeignKey
ALTER TABLE "wp_results" DROP CONSTRAINT "wp_results_alternativeId_fkey";

-- DropForeignKey
ALTER TABLE "wp_results" DROP CONSTRAINT "wp_results_spkId_fkey";

-- DropIndex
DROP INDEX "alternative_values_alternativeId_criterionId_key";

-- DropIndex
DROP INDEX "saw_results_spkId_alternativeId_key";

-- DropIndex
DROP INDEX "sub_criteria_criterionId_value_key";

-- DropIndex
DROP INDEX "template_sub_criteria_templateCriterionId_value_key";

-- DropIndex
DROP INDEX "wp_results_spkId_alternativeId_key";

-- AlterTable
ALTER TABLE "alternative_values" DROP CONSTRAINT "alternative_values_pkey",
DROP COLUMN "alternativeId",
DROP COLUMN "criterionId",
DROP COLUMN "id",
ADD COLUMN     "alternative_id" TEXT NOT NULL,
ADD COLUMN     "alternative_value_id" TEXT NOT NULL,
ADD COLUMN     "criterion_id" TEXT NOT NULL,
ADD CONSTRAINT "alternative_values_pkey" PRIMARY KEY ("alternative_value_id");

-- AlterTable
ALTER TABLE "alternatives" DROP CONSTRAINT "alternatives_pkey",
DROP COLUMN "id",
DROP COLUMN "spkId",
ADD COLUMN     "alternative_id" TEXT NOT NULL,
ADD COLUMN     "spk_id" TEXT NOT NULL,
ADD CONSTRAINT "alternatives_pkey" PRIMARY KEY ("alternative_id");

-- AlterTable
ALTER TABLE "criteria" DROP CONSTRAINT "criteria_pkey",
DROP COLUMN "id",
DROP COLUMN "spkId",
DROP COLUMN "templateCriterionId",
ADD COLUMN     "criterion_id" TEXT NOT NULL,
ADD COLUMN     "spk_id" TEXT NOT NULL,
ADD COLUMN     "template_criterion_id" TEXT,
ADD CONSTRAINT "criteria_pkey" PRIMARY KEY ("criterion_id");

-- AlterTable
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
DROP COLUMN "id",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "refresh_token_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("refresh_token_id");

-- AlterTable
ALTER TABLE "saw_results" DROP CONSTRAINT "saw_results_pkey",
DROP COLUMN "alternativeId",
DROP COLUMN "id",
DROP COLUMN "spkId",
ADD COLUMN     "alternative_id" TEXT NOT NULL,
ADD COLUMN     "saw_result_id" TEXT NOT NULL,
ADD COLUMN     "spk_id" TEXT NOT NULL,
ADD CONSTRAINT "saw_results_pkey" PRIMARY KEY ("saw_result_id");

-- AlterTable
ALTER TABLE "spk_records" DROP CONSTRAINT "spk_records_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "id",
DROP COLUMN "templateId",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "spk_id" TEXT NOT NULL,
ADD COLUMN     "template_id" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD CONSTRAINT "spk_records_pkey" PRIMARY KEY ("spk_id");

-- AlterTable
ALTER TABLE "spk_templates" DROP CONSTRAINT "spk_templates_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "createdBy",
DROP COLUMN "id",
DROP COLUMN "isActive",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "template_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD CONSTRAINT "spk_templates_pkey" PRIMARY KEY ("template_id");

-- AlterTable
ALTER TABLE "sub_criteria" DROP CONSTRAINT "sub_criteria_pkey",
DROP COLUMN "criterionId",
DROP COLUMN "id",
ADD COLUMN     "criterion_id" TEXT NOT NULL,
ADD COLUMN     "sub_criteria_id" TEXT NOT NULL,
ADD CONSTRAINT "sub_criteria_pkey" PRIMARY KEY ("sub_criteria_id");

-- AlterTable
ALTER TABLE "template_criteria" DROP CONSTRAINT "template_criteria_pkey",
DROP COLUMN "id",
DROP COLUMN "templateId",
ADD COLUMN     "template_criterion_id" TEXT NOT NULL,
ADD COLUMN     "template_id" TEXT NOT NULL,
ADD CONSTRAINT "template_criteria_pkey" PRIMARY KEY ("template_criterion_id");

-- AlterTable
ALTER TABLE "template_sub_criteria" DROP CONSTRAINT "template_sub_criteria_pkey",
DROP COLUMN "id",
DROP COLUMN "templateCriterionId",
ADD COLUMN     "template_criterion_id" TEXT NOT NULL,
ADD COLUMN     "template_sub_criteria_id" TEXT NOT NULL,
ADD CONSTRAINT "template_sub_criteria_pkey" PRIMARY KEY ("template_sub_criteria_id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "id",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("user_id");

-- AlterTable
ALTER TABLE "wp_results" DROP CONSTRAINT "wp_results_pkey",
DROP COLUMN "alternativeId",
DROP COLUMN "id",
DROP COLUMN "spkId",
ADD COLUMN     "alternative_id" TEXT NOT NULL,
ADD COLUMN     "spk_id" TEXT NOT NULL,
ADD COLUMN     "wp_result_id" TEXT NOT NULL,
ADD CONSTRAINT "wp_results_pkey" PRIMARY KEY ("wp_result_id");

-- CreateIndex
CREATE UNIQUE INDEX "alternative_values_alternative_id_criterion_id_key" ON "alternative_values"("alternative_id", "criterion_id");

-- CreateIndex
CREATE UNIQUE INDEX "saw_results_spk_id_alternative_id_key" ON "saw_results"("spk_id", "alternative_id");

-- CreateIndex
CREATE UNIQUE INDEX "sub_criteria_criterion_id_value_key" ON "sub_criteria"("criterion_id", "value");

-- CreateIndex
CREATE UNIQUE INDEX "template_sub_criteria_template_criterion_id_value_key" ON "template_sub_criteria"("template_criterion_id", "value");

-- CreateIndex
CREATE UNIQUE INDEX "wp_results_spk_id_alternative_id_key" ON "wp_results"("spk_id", "alternative_id");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spk_templates" ADD CONSTRAINT "spk_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_criteria" ADD CONSTRAINT "template_criteria_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "spk_templates"("template_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_sub_criteria" ADD CONSTRAINT "template_sub_criteria_template_criterion_id_fkey" FOREIGN KEY ("template_criterion_id") REFERENCES "template_criteria"("template_criterion_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spk_records" ADD CONSTRAINT "spk_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spk_records" ADD CONSTRAINT "spk_records_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "spk_templates"("template_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criteria" ADD CONSTRAINT "criteria_spk_id_fkey" FOREIGN KEY ("spk_id") REFERENCES "spk_records"("spk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_criteria" ADD CONSTRAINT "sub_criteria_criterion_id_fkey" FOREIGN KEY ("criterion_id") REFERENCES "criteria"("criterion_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alternatives" ADD CONSTRAINT "alternatives_spk_id_fkey" FOREIGN KEY ("spk_id") REFERENCES "spk_records"("spk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alternative_values" ADD CONSTRAINT "alternative_values_alternative_id_fkey" FOREIGN KEY ("alternative_id") REFERENCES "alternatives"("alternative_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alternative_values" ADD CONSTRAINT "alternative_values_criterion_id_fkey" FOREIGN KEY ("criterion_id") REFERENCES "criteria"("criterion_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saw_results" ADD CONSTRAINT "saw_results_spk_id_fkey" FOREIGN KEY ("spk_id") REFERENCES "spk_records"("spk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saw_results" ADD CONSTRAINT "saw_results_alternative_id_fkey" FOREIGN KEY ("alternative_id") REFERENCES "alternatives"("alternative_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wp_results" ADD CONSTRAINT "wp_results_spk_id_fkey" FOREIGN KEY ("spk_id") REFERENCES "spk_records"("spk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wp_results" ADD CONSTRAINT "wp_results_alternative_id_fkey" FOREIGN KEY ("alternative_id") REFERENCES "alternatives"("alternative_id") ON DELETE CASCADE ON UPDATE CASCADE;
