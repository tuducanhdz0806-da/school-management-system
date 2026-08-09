BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[students] DROP CONSTRAINT [students_parentId_fkey];

-- CreateTable
CREATE TABLE [dbo].[parents] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [fullName] NVARCHAR(1000) NOT NULL,
    [phone] NVARCHAR(1000),
    CONSTRAINT [parents_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [parents_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- AddForeignKey
ALTER TABLE [dbo].[parents] ADD CONSTRAINT [parents_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[students] ADD CONSTRAINT [students_parentId_fkey] FOREIGN KEY ([parentId]) REFERENCES [dbo].[parents]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
