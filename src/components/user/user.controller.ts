import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UserService } from '../../common/services/user/user.service';
import { User } from '../../common/schema/user/user.schema';
import { CreateUserDto } from '../../common/dto/user/create-user.dto';
import { AddContactDto } from '../../common/dto/user/add-contact.dto';
import { UpdatePasswordDto } from '../../common/dto/user/update-password.dto';
import { UserRO } from '../../common/ro/user/user.ro';


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


  @Get('available/:userName')
  public async getAvailableUsers(@Param('userName') userName: string):Promise<User[]> {
    return this.userService.getAvailableUsers(userName);
  }
}
