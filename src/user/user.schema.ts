import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  userName: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [String], default: [] })
  groups: string[];

  @Prop({ type: [String], default: [] })
  contacts: string[];
//ffedfweewfew

}

export const UserSchema = SchemaFactory.createForClass(User);
