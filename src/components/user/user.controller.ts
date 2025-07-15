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
import { UserRO } from './ro/user.ro';
import { ChatInUser } from './dto/chat-in-user.dto';


@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  public async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createUser(
      createUserDto.userName,
      createUserDto.password,
    );
  }

  @Get()
  public async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @Get(':userName')
  public async getUserByUserName(@Param('userName') userName: string): Promise<User> {
    return this.userService.getUserByUserName(userName);
  }

  @Put('add-contact')
  public async addContactToUser(@Body() addContactDto: AddContactDto): Promise<User> {
    return this.userService.addContactToUser(
      addContactDto.userName,
      addContactDto.contactUserName,
    );
  }

  @Put('remove-contact')
  public async removeContactFromUser(
    @Body() addContactDto: AddContactDto,
  ): Promise<User> {
    return this.userService.removeContactFromUser(
      addContactDto.userName,
      addContactDto.contactUserName,
    );
  }

  @Put('update-password')
  public async updateUserPassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<User> {
    return this.userService.updateUserPassword(
      updatePasswordDto.userName,
      updatePasswordDto.newPassword,
    );
  }

  @Delete(':userName')
  public async deleteUser(
    @Param('userName') userName: string,
  ): Promise<{ deleted: boolean }> {
    return this.userService.deleteUser(userName);
  }

  @Post('login')
  public async login(
    @Body() loginDto: CreateUserDto,
  ): Promise<UserRO> {
    return this.userService.login(loginDto.userName, loginDto.password);
  }

  @Post('add-group-to-user')
  public async addGroupToUser(@Body() chatInUser:ChatInUser): Promise<User>{
    return this.userService.addGroupToUser(chatInUser.userName,chatInUser.chatId);
  }

  @Delete('remove-group-to-user')
  public async removeGroupFromUser(@Body() chatInUser:ChatInUser): Promise<User>{
    return this.userService.removeGroupFromUser(chatInUser.userName,chatInUser.chatId);
  }

  @Get('available/:userName')
  public async getAvailableUsers(@Param('userName') userName: string){
    return this.userService.getAvailableUsers(userName);
  }
}
