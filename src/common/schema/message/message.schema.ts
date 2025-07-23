import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { STORAGE_KEYS } from '../../constants/constants';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema()
export class Message {
  @Prop({ required: true })
  content: string;

  @Prop({ type: String, required: true })
  sender: string;

  @Prop({ type: Types.ObjectId, ref: 'Chat', required: true })
  chatId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ timestamp: 1 }, { expireAfterSeconds: STORAGE_KEYS.HOURS_TO_SECONDS_12  });
