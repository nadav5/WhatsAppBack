import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.schema';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(
    @Body('userName') userName: string,
    @Body('password') password: string,
  ): Promise<User> {
    return this.userService.createUser(userName, password);
  }

  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @Get(':userName')
  async getUserByUserName(
    @Param('userName') userName: string,
  ): Promise<User> {
    return this.userService.getUserByUserName(userName);
  }

  @Put('add-contact')
  async addContactToUser(
    @Body('userName') userName: string,
    @Body('contactUserName') contactUserName: string,
  ): Promise<User> {
    return this.userService.addContactToUser(userName, contactUserName);
  }

  @Put('remove-contact')
  async removeContactFromUser(
    @Body('userName') userName: string,
    @Body('contactUserName') contactUserName: string,
  ): Promise<User> {
    return this.userService.removeContactFromUser(userName, contactUserName);
  }

  @Put('update-password')
  async updateUserPassword(
    @Body('userName') userName: string,
    @Body('newPassword') newPassword: string,
  ): Promise<User> {
    return this.userService.updateUserPassword(userName, newPassword);
  }

  @Delete(':userName')
  async deleteUser(
    @Param('userName') userName: string,
  ): Promise<{ deleted: boolean }> {
    return this.userService.deleteUser(userName);
  }
}
