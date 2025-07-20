import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './message.schema';
import { Chat, ChatDocument } from '../chat/chat.schema';
import { resolve } from 'path';
import { rejects } from 'assert';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
    @InjectModel(Chat.name)
    private chatModel: Model<ChatDocument>,
  ) {}

  public async createMessage(
    chatId: string,
    senderUserName: string,
    content: string,
  ): Promise<Message> {
    const chat = await this.chatModel.findById(chatId).exec();
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (!chat.members.includes(senderUserName)) {
      throw new ForbiddenException('User is not a member of this chat');
    }

    const newMessage = new this.messageModel({
      chatId,
      sender: senderUserName,
      content,
      timestamp: new Date(),
    });

    return newMessage.save();
  }

  public async getMessagesByChatId(chatId: string): Promise<Message[]> {
    const chat = await this.chatModel.findById(chatId).exec();
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    return this.messageModel.find({ chatId }).sort({ timestamp: 1 }).exec();
  }

  public async getMessageById(messageId: string): Promise<Message> {
    const message = await this.messageModel.findById(messageId).exec();
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    return message;
  }

  public async deleteMessage(
    messageId: string,
    senderUserName: string,
  ): Promise<{ deleted: boolean }> {
    const message = await this.messageModel.findById(messageId).exec();

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.sender !== senderUserName) {
      throw new ForbiddenException('You are not the sender of this message');
    }

    const result = await this.messageModel.deleteOne({ _id: messageId }).exec();

    if (result.deletedCount === 0) {
      throw new BadRequestException('Failed to delete message');
    }

    return { deleted: true };
  }

  async getLastMessageOfChat(chatId: string): Promise<Message> {
    const lastMessage = await this.messageModel
      .findOne({ chatId })
      .sort({ timestamp: -1 })
      .exec();

    if (!lastMessage) {
      throw new NotFoundException('No messages found in this chat');
    }
    return lastMessage;
  }
}
