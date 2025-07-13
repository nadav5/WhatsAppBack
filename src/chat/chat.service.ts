import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, ChatDocument } from './chat.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name)
    private chatModel: Model<ChatDocument>,
  ) {}

  public async createChat(
    name: string,
    isGroup: boolean,
    members: string[],
  ): Promise<Chat> {
    const newChat = new this.chatModel({
      name,
      isGroup,
      members,
      createdAt: new Date(),
    });

    return newChat.save();
  }

  public async getAllChatsForUser(userName: string): Promise<Chat[]> {
    return this.chatModel.find({ members: userName }).exec();
  }

  public async addMemberToGroup(chatId: string, userName: string): Promise<Chat> {
    const chat = await this.chatModel.findById(chatId).exec();
    if (!chat) {
      throw new Error('Chat not found');
    }

    if (!chat.isGroup) {
      throw new Error('Cannot add members to a private chat');
    }

    if (chat.members.includes(userName)) {
      throw new Error('User is already a member of this group');
    }

    chat.members.push(userName);
    return chat.save();
  }

  public async removeMemberFromGroup(chatId: string, userName: string): Promise<Chat> {
    const chat = await this.chatModel.findById(chatId).exec();
    if (!chat) {
      throw new Error('Chat not found');
    }

    if (!chat.isGroup) {
      throw new Error('Cannot add members to a private chat');
    }

    if (!chat.members.includes(userName)) {
      throw new Error('User is not a member of this group');
    }

    chat.members = chat.members.filter((c) => c !== userName);
    return chat.save();
  }

  public async deleteChat(chatId: string): Promise<{ deleted: boolean }> {
    const result = await this.chatModel.deleteOne({ _id: chatId }).exec();
    if (result.deletedCount === 0) {
      throw new Error('Chat not found or already deleted');
    }
    return { deleted: true };
  }

  public async getChatById(chatId: string): Promise<Chat>{
    const chat= await this.chatModel.findById(chatId).exec();
    if(!chat){
        throw new Error('Chat not found');
    }
    return chat;
  }

}
