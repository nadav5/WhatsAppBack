import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema()
export class Message {
  @Prop({ required: true })
  content: string;

  @Prop({ type: String, ref: 'User', required: true })
  sender: string;

  @Prop({ type: Types.ObjectId, ref: 'Chat', required: true })
  chatId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
