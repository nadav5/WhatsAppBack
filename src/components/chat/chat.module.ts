import { Module } from '@nestjs/common';
import { ChatService } from '../../common/services/chat/chat.service';
import { ChatController } from './chat.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from '../../common/schema/chat/chat.schema';
import { ChatGateway } from './chat.gateway';
import { Message, MessageSchema } from '../../common/schema/message/message.schema';
import { ChatGatewayService } from 'src/common/services/chat/chat-gateway.service';

@Module({
  imports: [
MongooseModule.forFeature([
  { name: Chat.name, schema: ChatSchema },
  { name: Message.name, schema: MessageSchema },
])  ],
  providers: [ChatService, ChatGateway ,ChatGatewayService],
  controllers: [ChatController],
  exports: [MongooseModule]
})
export class ChatModule {}
