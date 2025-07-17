import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { UserRO } from './ro/user.ro';
import { Chat, ChatDocument } from '../chat/chat.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Chat.name)
    private chatModel: Model<ChatDocument>,
  ) {}

  public async createUser(userName: string, password: string): Promise<User> {
    const existingUser = await this.userModel.findOne({ userName });
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const saltRounds: number = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new this.userModel({
      userName,
      password: hashedPassword,
      contacts: [],
      groups: [],
    });

    return newUser.save();
  }

  async getAllUsers(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async getUserByUserName(userName: string): Promise<User> {
    const user = await this.userModel
      .findOne({ userName }, { password: 0 })
      .select('-password')
      .exec();
    if (!user) {
      throw new NotFoundException('Not found user');
    }
    return user;
  }

  async addContactToUser(
    userName: string,
    contactUserName: string,
  ): Promise<User> {
    const user = await this.userModel.findOne({ userName }).exec();
    const contact = await this.userModel
      .findOne({ userName: contactUserName })
      .exec();

    if (!user || !contact) {
      throw new NotFoundException('User or contact not found');
    }

    if (user.contacts.includes(contact.userName)) {
      throw new ConflictException('Contact already added');
    }

    user.contacts.push(contact.userName);
    return user.save();
  }

  async removeContactFromUser(
    userName: string,
    contactUserName: string,
  ): Promise<User> {
    const user = await this.userModel.findOne({ userName }).exec();
    const contact = await this.userModel
      .findOne({ userName: contactUserName })
      .exec();

    if (!user || !contact) {
      throw new NotFoundException('User or contact not found');
    }

    if (!user.contacts.includes(contact.userName)) {
      throw new NotFoundException('User not in contact');
    }

    user.contacts = user.contacts.filter((c) => c !== contact.userName);
    return user.save();
  }

  async updateUserPassword(
    userName: string,
    newPassword: string,
  ): Promise<User> {
    const user = await this.userModel.findOne({ userName }).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    return user.save();
  }

  async deleteUser(userName: string): Promise<{ deleted: boolean }> {
    const result = await this.userModel.deleteOne({ userName }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('User not found or already deleted');
    }

    return { deleted: true };
  }

  public async login(userName: string, password: string): Promise<UserRO> {
    const user = await this.userModel.findOne({ userName }).exec();

    if (!user) {
      return { success: false };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false };
    }

    return { success: true, user: user.userName };
  }

  public async getAvailableUsers(userName: string): Promise<User[]> {
    const currentUser = await this.userModel.findOne({ userName }).exec();
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const allUsers = await this.userModel
      .find({ userName: { $ne: userName } })
      .exec();
    const availableUsers = allUsers.filter(
      (user) => !currentUser.contacts.includes(user.userName),
    );
    return availableUsers;
  }
}
