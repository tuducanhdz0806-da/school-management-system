BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[users] (
    [id] INT NOT NULL IDENTITY(1,1),
    [email] NVARCHAR(1000) NOT NULL,
    [passwordHash] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL,
    [refreshToken] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [deletedAt] DATETIME2,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[admins] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [fullName] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [admins_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [admins_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[teachers] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [fullName] NVARCHAR(1000) NOT NULL,
    [phone] NVARCHAR(1000),
    CONSTRAINT [teachers_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [teachers_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[students] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [fullName] NVARCHAR(1000) NOT NULL,
    [dateOfBirth] DATETIME2,
    [parentId] INT,
    CONSTRAINT [students_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [students_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[academic_years] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [startDate] DATETIME2 NOT NULL,
    [endDate] DATETIME2 NOT NULL,
    CONSTRAINT [academic_years_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [academic_years_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[classes] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [academicYearId] INT NOT NULL,
    [homeroomTeacherId] INT,
    CONSTRAINT [classes_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [classes_name_academicYearId_key] UNIQUE NONCLUSTERED ([name],[academicYearId])
);

-- CreateTable
CREATE TABLE [dbo].[subjects] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [credit] INT NOT NULL CONSTRAINT [subjects_credit_df] DEFAULT 1,
    CONSTRAINT [subjects_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [subjects_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[class_students] (
    [id] INT NOT NULL IDENTITY(1,1),
    [classId] INT NOT NULL,
    [studentId] INT NOT NULL,
    [joinedAt] DATETIME2 NOT NULL CONSTRAINT [class_students_joinedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [class_students_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [class_students_classId_studentId_key] UNIQUE NONCLUSTERED ([classId],[studentId])
);

-- CreateTable
CREATE TABLE [dbo].[teaching_assignments] (
    [id] INT NOT NULL IDENTITY(1,1),
    [teacherId] INT NOT NULL,
    [subjectId] INT NOT NULL,
    [classId] INT NOT NULL,
    CONSTRAINT [teaching_assignments_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [teaching_assignments_teacherId_subjectId_classId_key] UNIQUE NONCLUSTERED ([teacherId],[subjectId],[classId])
);

-- CreateTable
CREATE TABLE [dbo].[schedules] (
    [id] INT NOT NULL IDENTITY(1,1),
    [classId] INT NOT NULL,
    [subjectId] INT NOT NULL,
    [teacherId] INT NOT NULL,
    [dayOfWeek] NVARCHAR(1000) NOT NULL,
    [period] INT NOT NULL,
    [room] NVARCHAR(1000),
    CONSTRAINT [schedules_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [schedules_classId_dayOfWeek_period_key] UNIQUE NONCLUSTERED ([classId],[dayOfWeek],[period])
);

-- CreateTable
CREATE TABLE [dbo].[attendances] (
    [id] INT NOT NULL IDENTITY(1,1),
    [studentId] INT NOT NULL,
    [scheduleId] INT NOT NULL,
    [date] DATE NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [attendances_status_df] DEFAULT 'PRESENT',
    [checkedByQr] BIT NOT NULL CONSTRAINT [attendances_checkedByQr_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [attendances_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [attendances_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [attendances_studentId_scheduleId_date_key] UNIQUE NONCLUSTERED ([studentId],[scheduleId],[date])
);

-- CreateTable
CREATE TABLE [dbo].[scores] (
    [id] INT NOT NULL IDENTITY(1,1),
    [studentId] INT NOT NULL,
    [subjectId] INT NOT NULL,
    [scoreType] NVARCHAR(1000) NOT NULL,
    [value] FLOAT(53) NOT NULL,
    [weight] INT NOT NULL CONSTRAINT [scores_weight_df] DEFAULT 1,
    [semester] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [scores_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [scores_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[notifications] (
    [id] INT NOT NULL IDENTITY(1,1),
    [title] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(max) NOT NULL,
    [targetRole] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [notifications_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [notifications_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [users_email_idx] ON [dbo].[users]([email]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [attendances_studentId_date_idx] ON [dbo].[attendances]([studentId], [date]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [scores_studentId_semester_idx] ON [dbo].[scores]([studentId], [semester]);

-- AddForeignKey
ALTER TABLE [dbo].[admins] ADD CONSTRAINT [admins_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[teachers] ADD CONSTRAINT [teachers_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[students] ADD CONSTRAINT [students_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[students] ADD CONSTRAINT [students_parentId_fkey] FOREIGN KEY ([parentId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[classes] ADD CONSTRAINT [classes_academicYearId_fkey] FOREIGN KEY ([academicYearId]) REFERENCES [dbo].[academic_years]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[classes] ADD CONSTRAINT [classes_homeroomTeacherId_fkey] FOREIGN KEY ([homeroomTeacherId]) REFERENCES [dbo].[teachers]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[class_students] ADD CONSTRAINT [class_students_classId_fkey] FOREIGN KEY ([classId]) REFERENCES [dbo].[classes]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[class_students] ADD CONSTRAINT [class_students_studentId_fkey] FOREIGN KEY ([studentId]) REFERENCES [dbo].[students]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[teaching_assignments] ADD CONSTRAINT [teaching_assignments_teacherId_fkey] FOREIGN KEY ([teacherId]) REFERENCES [dbo].[teachers]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[teaching_assignments] ADD CONSTRAINT [teaching_assignments_subjectId_fkey] FOREIGN KEY ([subjectId]) REFERENCES [dbo].[subjects]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[teaching_assignments] ADD CONSTRAINT [teaching_assignments_classId_fkey] FOREIGN KEY ([classId]) REFERENCES [dbo].[classes]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[schedules] ADD CONSTRAINT [schedules_classId_fkey] FOREIGN KEY ([classId]) REFERENCES [dbo].[classes]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[schedules] ADD CONSTRAINT [schedules_subjectId_fkey] FOREIGN KEY ([subjectId]) REFERENCES [dbo].[subjects]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[schedules] ADD CONSTRAINT [schedules_teacherId_fkey] FOREIGN KEY ([teacherId]) REFERENCES [dbo].[teachers]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[attendances] ADD CONSTRAINT [attendances_studentId_fkey] FOREIGN KEY ([studentId]) REFERENCES [dbo].[students]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[attendances] ADD CONSTRAINT [attendances_scheduleId_fkey] FOREIGN KEY ([scheduleId]) REFERENCES [dbo].[schedules]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[scores] ADD CONSTRAINT [scores_studentId_fkey] FOREIGN KEY ([studentId]) REFERENCES [dbo].[students]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[scores] ADD CONSTRAINT [scores_subjectId_fkey] FOREIGN KEY ([subjectId]) REFERENCES [dbo].[subjects]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
