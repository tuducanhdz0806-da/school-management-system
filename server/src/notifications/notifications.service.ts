import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        title: dto.title,
        content: dto.content,
        targetRole: dto.targetRole ?? null,
      },
    });
  }

  // Trả về thông báo dành cho role của người gọi + thông báo chung (targetRole = null)
  findForRole(role: string) {
    return this.prisma.notification.findMany({
      where: {
        OR: [{ targetRole: null }, { targetRole: role }],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const noti = await this.prisma.notification.findUnique({ where: { id } });
    if (!noti) {
      throw new NotFoundException(`Không tìm thấy thông báo id=${id}`);
    }
    return noti;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.notification.delete({ where: { id } });
  }
}