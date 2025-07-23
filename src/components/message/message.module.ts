import { Module } from '@nestjs/common';
import { MessageService } from './../../common/services/message/message.service';
import { MessageController } from './message.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from '../../common/schema/message/message.schema';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    ChatModule  
  ],
  providers: [MessageService],
  controllers: [MessageController],
})
export class MessageModule {}
