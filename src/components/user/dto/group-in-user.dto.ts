import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class GroupInUser {
  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  groupId: string;
}
