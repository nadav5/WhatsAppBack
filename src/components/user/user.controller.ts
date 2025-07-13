import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { AddContactDto } from './dto/add-contact.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createUser(
      createUserDto.userName,
      createUserDto.password,
    );
  }

  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @Get(':userName')
  async getUserByUserName(@Param('userName') userName: string): Promise<User> {
    return this.userService.getUserByUserName(userName);
  }

  @Put('add-contact')
  async addContactToUser(@Body() addContactDto: AddContactDto): Promise<User> {
    return this.userService.addContactToUser(
      addContactDto.userName,
      addContactDto.contactUserName,
    );
  }

  @Put('remove-contact')
  async removeContactFromUser(
    @Body() addContactDto: AddContactDto,
  ): Promise<User> {
    return this.userService.removeContactFromUser(
      addContactDto.userName,
      addContactDto.contactUserName,
    );
  }

  @Put('update-password')
  async updateUserPassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<User> {
    return this.userService.updateUserPassword(
      updatePasswordDto.userName,
      updatePasswordDto.newPassword,
    );
  }

  @Delete(':userName')
  async deleteUser(
    @Param('userName') userName: string,
  ): Promise<{ deleted: boolean }> {
    return this.userService.deleteUser(userName);
  }
}
