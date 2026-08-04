import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AcademicYearsModule } from './academic-years/academic-years.module';
import { SubjectsModule } from './subjects/subjects.module';
import { ClassesModule } from './classes/classes.module';

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    AcademicYearsModule,
    SubjectsModule,
    ClassesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}