import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { UserOutputDto } from './dto/user-output.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserOutputDto> {
    return await this.usersService.create(createUserDto);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserOutputDto> {
    return await this.usersService.getSimpleUserById(id);
  }

  @Get(':userId/avatar')
  async getAvatrByUserId(@Param('userId') userId: string): Promise<string> {
    const user = await this.usersService.getUserById(userId);
    return user.avatar;
  }

  @Delete(':userId')
  async deleteUserById(@Param('userId') userId: string): Promise<void> {
    await this.usersService.deleteUserById(userId);
  }
}
