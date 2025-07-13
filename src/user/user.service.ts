import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}



  public async createUser(userName: string, password: string): Promise<User> {
    const existingUser = await this.userModel.findOne({ userName });
    if (existingUser) {
      throw new Error('Username already exists');
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
    const user = await this.userModel.findOne({ userName }).select('-password').exec();
    if (!user){
        throw new Error('Not found user')
    }
    return user;
  }



  async addContactToUser(userName: string, contactUserName: string): Promise<User> {
    const user = await this.userModel.findOne({ userName }).exec();
    const contact = await this.userModel.findOne({ userName: contactUserName }).exec();

    if (!user || !contact) {
      throw new Error('User or contact not found');
    }

    if (user.contacts.includes(contact.userName)) {
      throw new Error('Contact already added');
    }

    user.contacts.push(contact.userName);
    return user.save();
  }


  async removeContactFromUser(userName: string, contactUserName: string): Promise<User> {
    const user = await this.userModel.findOne({ userName }).exec();
    const contact = await this.userModel.findOne({ userName: contactUserName }).exec();

    if (!user || !contact) {
      throw new Error('User or contact not found');
    }

    if (!user.contacts.includes(contact.userName)) {
      throw new Error('User not in contact ');
    }

    user.contacts = user.contacts.filter(c => c !== contact.userName);
    return user.save();
  }

  async updateUserPassword(userName: string, newPassword: string): Promise<User> {
  const user = await this.userModel.findOne({ userName }).exec();

  if (!user) {
    throw new Error('User not found');
  }

  user.password = newPassword;
  return user.save();
}

async deleteUser(userName: string): Promise<{ deleted: boolean }> {
  const result = await this.userModel.deleteOne({ userName }).exec();

  if (result.deletedCount === 0) {
    throw new Error('User not found or already deleted');
  }

  return { deleted: true };
}


}
