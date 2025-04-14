import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UpdateTourDto } from '../tour/dto/update-tour.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/users')
  getUsers(@Query('q') query: string) {
    return this.usersService.users(query);
  }

  @Get('/users/:id')
  getUser(@Param('id') id: string) {
    return this.usersService.user(id);
  }

  @Post('/users')
  createUser(@Body() data: CreateUserDto) {
    return this.usersService.createUser(data);
  }

  @Put('/users/:id')
  updateUser(@Param('id') id: string, @Body() data: UpdateTourDto) {
    return this.usersService.updateUser(id, data);
  }

  @Delete('/users/:id')
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
