import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { Chat } from './chat.schema';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateMembersDto } from './dto/update-members.dto';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getAllChats(): Promise<Chat[]> {
    return this.chatService.getAllChats();
  }

  @Post()
  async createChat(@Body() createChatDto: CreateChatDto): Promise<Chat> {
    const { name, description, isGroup, members } = createChatDto;
    return this.chatService.createChat(name, description, isGroup, members);
  }

  @Get('by-user/:userName')
  async getAllChatsForUser(
    @Param('userName') userName: string,
  ): Promise<Chat[]> {
    return this.chatService.getAllChatsForUser(userName);
  }
  @Post('add-member')
  async addMemberToChat(
    @Body() updateMembersDto: UpdateMembersDto,
  ): Promise<Chat> {
    const { chatId, userName } = updateMembersDto;
    return this.chatService.addMemberToChat(chatId, userName);
  }

  @Put('remove-member')
  async removeMemberFromChat(
    @Body() updateMembersDto: UpdateMembersDto,
  ): Promise<Chat> {
    return this.chatService.removeMemberFromChat(
      updateMembersDto.chatId,
      updateMembersDto.userName,
    );
  }

  @Delete(':chatId')
  async deleteChat(
    @Param('chatId') chatId: string,
  ): Promise<{ deleted: boolean }> {
    return this.chatService.deleteChat(chatId);
  }

  @Get(':chatId')
  async getChatById(@Param('chatId') chatId: string): Promise<Chat> {
    return this.chatService.getChatById(chatId);
  }

  @Post('private')
  public async getOrCreatePrivateChat(
    @Body() body: { user1: string; user2: string },
  ): Promise<Chat> {
    return this.chatService.findOrCreatePrivateChat(body.user1, body.user2);
  }
}
