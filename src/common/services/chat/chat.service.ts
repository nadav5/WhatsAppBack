import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, ChatDocument } from '../../schema/chat/chat.schema';
import { Message, MessageDocument } from '../../schema/message/message.schema';
@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name)
    private chatModel: Model<ChatDocument>,
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
  ) {}

  public async createChat(
    name: string,
    description: string,
    isGroup: boolean,
    members: string[],
  ): Promise<ChatDocument> {
    const newChat: ChatDocument = new this.chatModel({
      name,
      description,
      isGroup,
      members,
      createdAt: new Date(),
    });

    return newChat.save();
  }

  public async getAllChatsForUser(userName: string): Promise<ChatDocument[]> {
    return this.chatModel.find({ members: userName }).exec();
  }

  public async addMemberToChat(
    chatId: string,
    userName: string,
  ): Promise<ChatDocument> {
    const chat: ChatDocument | null = await this.chatModel.findById(chatId).exec();
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (!chat.isGroup) {
      throw new BadRequestException('Cannot add members to a private chat');
    }

    if (chat.members.includes(userName)) {
      throw new ConflictException('User is already a member of this group');
    }

    chat.members.push(userName);
    return chat.save();
  }

  public async removeMemberFromChat(
    chatId: string,
    userName: string,
  ): Promise<ChatDocument> {
    const chat: ChatDocument | null = await this.chatModel.findById(chatId).exec();
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (!chat.isGroup) {
      throw new BadRequestException(
        'Cannot remove members from a private chat',
      );
    }

    if (!chat.members.includes(userName)) {
      throw new NotFoundException('User is not a member of this group');
    }

    chat.members = chat.members.filter((c) => c !== userName);
    return chat.save();
  }

  public async deleteChat(chatId: string): Promise<{ deleted: boolean }> {
    const result: { deletedCount?: number } = await this.chatModel.deleteOne({ _id: chatId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Chat not found or already deleted');
    }

    await this.messageModel.deleteMany({ chatId }).exec();

    return { deleted: true };
  }

  public async getChatById(chatId: string): Promise<ChatDocument> {
    const chat: ChatDocument | null = await this.chatModel.findById(chatId).exec();
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    return chat;
  }

  public async getAllChats(): Promise<ChatDocument[]> {
    return this.chatModel.find().exec();
  }

  public async findOrCreatePrivateChat(
    user1: string,
    user2: string,
  ): Promise<ChatDocument> {
    let chat: ChatDocument | null = await this.chatModel.findOne({
      isGroup: false,
      members: { $all: [user1, user2], $size: 2 },
    }).exec();

    if (!chat) {
      chat = new this.chatModel({
        // name: '',
        // description: '',
        isGroup: false,
        members: [user1, user2],
        createdAt: new Date(),
      });
      await chat.save();
    }
    return chat;
  }
}
