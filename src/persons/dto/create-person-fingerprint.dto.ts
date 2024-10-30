import { IsInt, IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class FingerprintData {
  @ApiProperty({ description: 'ID del tipo de huella', example: 1 })
  @IsInt()
  @IsNotEmpty()
  fingerprintTypeId: number;

  @ApiProperty({ description: 'Huella digital en formato WSQ', example: '...' })
  @IsNotEmpty()
  @IsString()
  wsq: string;

  @ApiProperty({ description: 'Calidad de la huella', example: 80 })
  @IsInt()
  @IsNotEmpty()
  quality: number;
}

export class CreatePersonFingerprintDto {
  @ApiProperty({ description: 'ID de la persona', example: 1243 })
  @IsInt()
  @IsNotEmpty()
  personId: number;

  @ApiProperty({
    type: [FingerprintData], // Aquí se especifica que es un array de FingerprintData
    description: 'Lista de huellas digitales',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FingerprintData)
  fingerprints: FingerprintData[];
}
