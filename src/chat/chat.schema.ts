import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema()
export class Chat {

  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  isGroup: boolean;

  @Prop({ type: [{ type: [String], ref: 'User' }], required: true })
  members: string[];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
