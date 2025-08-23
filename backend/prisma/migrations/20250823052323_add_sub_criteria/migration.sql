-- CreateTable
CREATE TABLE "sub_criteria" (
    "id" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "sub_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sub_criteria_criterionId_value_key" ON "sub_criteria"("criterionId", "value");

-- AddForeignKey
ALTER TABLE "sub_criteria" ADD CONSTRAINT "sub_criteria_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
