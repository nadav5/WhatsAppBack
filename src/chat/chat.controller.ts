import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Chat } from './chat.schema';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async createChat(
    @Body('name') name: string,
    @Body('isGroup') isGroup: boolean,
    @Body('members') members: string[],
  ): Promise<Chat> {
    return this.chatService.createChat(name, isGroup, members);
  }

  @Get('by-user/:userName')
  async getAllChatsForUser(
    @Param('userName') userName: string,
  ): Promise<Chat[]> {
    return this.chatService.getAllChatsForUser(userName);
  }

  @Put(':chatId/add-member')
  async addMemberToGroup(
    @Param('chatId') chatId: string,
    @Body('userName') userName: string,
  ): Promise<Chat> {
    return this.chatService.addMemberToGroup(chatId, userName);
  }

  @Put(':chatId/remove-member')
  async removeMemberFromGroup(
    @Param('chatId') chatId: string,
    @Body('userName') userName: string,
  ): Promise<Chat> {
    return this.chatService.removeMemberFromGroup(chatId, userName);
  }

  @Delete(':chatId')
  async deleteChat(
    @Param('chatId') chatId: string,
  ): Promise<{ deleted: boolean }> {
    return this.chatService.deleteChat(chatId);
  }

  @Get(':chatId')
  async getChatById(
    @Param('chatId') chatId: string,
  ): Promise<Chat> {
    return this.chatService.getChatById(chatId);
  }
}
