import { ApiProperty } from '@nestjs/swagger';

export class UserDetailDto {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  cellphone: string;

  @ApiProperty()
  identityCard: string;

  @ApiProperty()
  position: string;
}
