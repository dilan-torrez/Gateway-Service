import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LdapUserDto {
  @ApiProperty({ description: 'Nombre de usuario' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Nombre del usuario' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Apellido del usuario' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Cargo o posición del usuario' })
  @IsString()
  position: string;
}
