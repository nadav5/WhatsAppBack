import { IsString, IsNotEmpty } from 'class-validator';

export class AddContactDto {
  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsNotEmpty()
  contactUserName: string;
}
