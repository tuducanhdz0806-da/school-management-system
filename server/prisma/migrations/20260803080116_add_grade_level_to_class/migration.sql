/*
  Warnings:

  - A unique constraint covering the columns `[name,gradeLevel,academicYearId]` on the table `classes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gradeLevel` to the `classes` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropIndex
ALTER TABLE [dbo].[classes] DROP CONSTRAINT [classes_name_academicYearId_key];

-- AlterTable
ALTER TABLE [dbo].[classes] ADD [gradeLevel] INT NOT NULL DEFAULT 10;

-- CreateIndex
ALTER TABLE [dbo].[classes] ADD CONSTRAINT [classes_name_gradeLevel_academicYearId_key] UNIQUE NONCLUSTERED ([name], [gradeLevel], [academicYearId]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
