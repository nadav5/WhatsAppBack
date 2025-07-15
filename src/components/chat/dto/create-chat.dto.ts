import { IsString, IsNotEmpty, IsBoolean, IsArray } from 'class-validator';

export class CreateChatDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;

  @IsBoolean()
  isGroup: boolean;

  @IsArray()
  @IsString({ each: true })
  members: string[];
}
