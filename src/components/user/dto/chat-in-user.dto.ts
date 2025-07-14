import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ChatInUser {
  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  chatId: string;
}
