import { ApiProperty } from '@nestjs/swagger';

export class UserListDto {
  @ApiProperty({ description: 'ID del usuario' })
  id: number;

  @ApiProperty({ description: 'Nombre de usuario' })
  username: string;

  @ApiProperty({ description: 'Nombre completo del usuario' })
  name: string;
}
