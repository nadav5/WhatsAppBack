import { Module } from '@nestjs/common';
import { UserService } from '../../common/services/user/user.service';
import { UserController } from './user.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../common/schema/user/user.schema';
import { ChatModule } from '../chat/chat.module';

@Module({
  providers: [UserService],
  controllers: [UserController],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ChatModule,
  ],
  exports: [MongooseModule]
})
export class UserModule {}
