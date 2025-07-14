import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { MessageService } from './message.service';
import { Message } from './message.schema';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}


  
  @Post()
  async createMessage(
    @Body() createMessageDto: CreateMessageDto
  ): Promise<Message> {
    return this.messageService.createMessage(createMessageDto.chatId, createMessageDto.senderUserName, createMessageDto.content);
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
