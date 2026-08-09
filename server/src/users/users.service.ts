import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryUserDto) {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null, // luôn lọc bỏ user đã soft-delete
        ...(query.role && { role: query.role }),
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        // Không bao giờ trả passwordHash ra ngoài API
        teacher: true,
        student: true,
        admin: true,
	parent: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        teacher: true,
        student: true,
        admin: true,
	parent: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Không tìm thấy user với id=${id}`);
    }

    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id); // ném lỗi 404 nếu không tồn tại/đã xóa

    const data: any = {};
    if (dto.email) data.email = dto.email;
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, role: true },
    });
  }

  async softDelete(id: number) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: { id: true, email: true, deletedAt: true },
    });
  }
}