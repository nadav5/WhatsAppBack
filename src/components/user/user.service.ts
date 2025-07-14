import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { UserRO } from './ro/user.ro';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  public async createUser(userName: string, password: string): Promise<User> {
    const existingUser = await this.userModel.findOne({ userName });
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const newUser = new this.userModel({
      userName,
      password,
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

    user.password = newPassword;
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

    if (user.password !== password) {
      return { success: false };
    }

    return { success: true, user: user.userName };
  }

  async addGroupToUser(userName: string, chatId: string): Promise<User> {
    const user = await this.userModel.findOne({ userName }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const groupObjectId = new mongoose.Types.ObjectId(chatId);

    if (user.chats.some((g) => g.equals(groupObjectId))) {
      throw new ConflictException('Group already added');
    }
    user.chats.push(groupObjectId);
    return user.save();
  }



  async removeGroupFromUser(userName: string, chatId: string): Promise<User> {
    const user = await this.userModel.findOne({ userName }).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const groupObjectId = new mongoose.Types.ObjectId(chatId);
    const exists = user.chats.some(
      (g) => g.toString() === groupObjectId.toString(),
    );

    if (!exists) {
      throw new NotFoundException('Group not found in user groups');
    }
    user.chats = user.chats.filter(
      (g) => g.toString() !== groupObjectId.toString(),
    );
    return user.save();
  }
}
