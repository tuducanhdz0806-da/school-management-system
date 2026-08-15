import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

@Injectable()
export class AcademicYearsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAcademicYearDto) {
    const existing = await this.prisma.academicYear.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Năm học "${dto.name}" đã tồn tại`);
    }

    return this.prisma.academicYear.create({
      data: {
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
    });
  }

  findAll() {
    return this.prisma.academicYear.findMany({
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(id: number) {
    const year = await this.prisma.academicYear.findUnique({ where: { id } });
    if (!year) {
      throw new NotFoundException(`Không tìm thấy năm học id=${id}`);
    }
    return year;
  }

  async update(id: number, dto: UpdateAcademicYearDto) {
    await this.findOne(id);
    return this.prisma.academicYear.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate && { endDate: new Date(dto.endDate) }),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.academicYear.delete({ where: { id } });
  }
}
