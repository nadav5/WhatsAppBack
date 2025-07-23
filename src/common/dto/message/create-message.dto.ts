import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  chatId: string;

  @IsNotEmpty()
  @IsString()
  senderUserName: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}
