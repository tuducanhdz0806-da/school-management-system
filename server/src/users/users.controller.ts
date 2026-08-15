import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { Auth } from '../auth/decorators/auth.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Auth('ADMIN')
  findAll(@Query() query: QueryUserDto) {
    return this.usersService.findAll(query);
  }

  @Get('my-child')
  @Auth('PARENT')
  getMyChild(@Req() req: any) {
    return this.usersService.findMyChild(req.user.userId);
  }

  @Get(':id')
  @Auth('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    // ADMIN xem được ai cũng được, còn lại chỉ xem được chính mình
    if (req.user.role !== 'ADMIN' && req.user.userId !== id) {
      throw new ForbiddenException('Bạn chỉ được xem thông tin của chính mình');
    }
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Auth('ADMIN')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @Auth('ADMIN')
  softDelete(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.softDelete(id);
  }
}