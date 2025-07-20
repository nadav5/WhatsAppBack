import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { Message } from './message.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { Observable, Subject } from 'rxjs';
import { subscribe } from 'diagnostics_channel';
import { setInterval, setTimeout } from 'timers/promises';
import { error, log } from 'console';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  public async createMessage(
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    return this.messageService.createMessage(
      createMessageDto.chatId,
      createMessageDto.senderUserName,
      createMessageDto.content,
    );
  }

  @Get('by-chat/:chatId')
  public async getMessagesByChatId(
    @Param('chatId') chatId: string,
  ): Promise<Message[]> {
    return this.messageService.getMessagesByChatId(chatId);
  }

  @Get(':messageId')
  public async getMessageById(
    @Param('messageId') messageId: string,
  ): Promise<Message> {
    return this.messageService.getMessageById(messageId);
  }

  @Delete(':messageId')
  public async deleteMessage(
    @Param('messageId') messageId: string,
    @Query('senderUserName') senderUserName: string,
  ): Promise<{ deleted: boolean }> {
    return this.messageService.deleteMessage(messageId, senderUserName);
  }

  @Get('last/:chatId')
  public async getLastMessageOfChat(
    @Param('chatId') chatId: string,
  ): Promise<Message> {
    return this.messageService.getLastMessageOfChat(chatId);
  }
}
