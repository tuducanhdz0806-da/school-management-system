import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSubjectDto) {
    const existing = await this.prisma.subject.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Môn học "${dto.name}" đã tồn tại`);
    }
    return this.prisma.subject.create({ data: dto });
  }

  findAll() {
    return this.prisma.subject.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: number) {
    const subject = await this.prisma.subject.findUnique({ where: { id } });
    if (!subject) {
      throw new NotFoundException(`Không tìm thấy môn học id=${id}`);
    }
    return subject;
  }

  async update(id: number, dto: UpdateSubjectDto) {
    await this.findOne(id);
    return this.prisma.subject.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.subject.delete({ where: { id } });
  }
}