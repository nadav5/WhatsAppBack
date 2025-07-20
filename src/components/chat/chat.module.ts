import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from './chat.schema';
import { ChatGateway } from './chat.gateway';
import { Message, MessageSchema } from '../message/message.schema';

@Module({
  imports: [
MongooseModule.forFeature([
  { name: Chat.name, schema: ChatSchema },
  { name: Message.name, schema: MessageSchema },
])  ],
  providers: [ChatService, ChatGateway],
  controllers: [ChatController],
  exports: [MongooseModule]
})
export class ChatModule {}
