import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateMembersDto {
  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsNotEmpty()
  chatId: string;
}
