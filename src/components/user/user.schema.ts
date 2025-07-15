import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { Chat } from '../chat/chat.schema';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  userName: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [mongoose.Types.ObjectId], ref: 'Chat' })
  chats: mongoose.Types.ObjectId[];

  @Prop({ type: [String] , default: [] })
  contacts: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
