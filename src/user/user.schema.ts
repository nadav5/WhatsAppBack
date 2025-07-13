import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  userName: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [{ type: [String], ref: 'Chat' }], default: [] })
  groups: string[];

  @Prop({ type: [{ type: [String], ref: 'User' }], default: [] })
  contacts: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
