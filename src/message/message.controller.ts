import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { MessageService } from './message.service';
import { Message } from './message.schema';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async createMessage(
    @Body('chatId') chatId: string,
    @Body('senderUserName') senderUserName: string,
    @Body('content') content: string,
  ): Promise<Message> {
    return this.messageService.createMessage(chatId, senderUserName, content);
  }

  @Get('by-chat/:chatId')
  async getMessagesByChatId(
    @Param('chatId') chatId: string,
  ): Promise<Message[]> {
    return this.messageService.getMessagesByChatId(chatId);
  }

  @Get(':messageId')
  async getMessageById(
    @Param('messageId') messageId: string,
  ): Promise<Message> {
    return this.messageService.getMessageById(messageId);
  }

  @Delete(':messageId')
  async deleteMessage(
    @Param('messageId') messageId: string,
    @Query('senderUserName') senderUserName: string,
  ): Promise<{ deleted: boolean }> {
    return this.messageService.deleteMessage(messageId, senderUserName);
  }

  @Get('last/:chatId')
  async getLastMessageOfChat(
    @Param('chatId') chatId: string,
  ): Promise<Message> {
    return this.messageService.getLastMessageOfChat(chatId);
  }
}
