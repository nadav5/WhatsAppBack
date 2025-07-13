import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Chat } from './chat.schema';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateMembersDto } from './dto/update-members.dto';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async createChat(@Body() createChatDto: CreateChatDto): Promise<Chat> {
    const { name, isGroup, members } = createChatDto;
    return this.chatService.createChat(name, isGroup, members);
  }

  @Get('by-user/:userName')
  async getAllChatsForUser(@Param('userName') userName: string): Promise<Chat[]> {
    return this.chatService.getAllChatsForUser(userName);
  }

  @Put(':chatId/add-member')
  async addMemberToGroup(
    @Param('chatId') chatId: string,
    @Body() updateMembersDto: UpdateMembersDto,
  ): Promise<Chat> {
    return this.chatService.addMemberToGroup(chatId, updateMembersDto.userName);
  }

  @Put(':chatId/remove-member')
  async removeMemberFromGroup(
    @Param('chatId') chatId: string,
    @Body() updateMembersDto: UpdateMembersDto,
  ): Promise<Chat> {
    return this.chatService.removeMemberFromGroup(chatId, updateMembersDto.userName);
  }

  @Delete(':chatId')
  async deleteChat(@Param('chatId') chatId: string): Promise<{ deleted: boolean }> {
    return this.chatService.deleteChat(chatId);
  }

  @Get(':chatId')
  async getChatById(@Param('chatId') chatId: string): Promise<Chat> {
    return this.chatService.getChatById(chatId);
  }
}
