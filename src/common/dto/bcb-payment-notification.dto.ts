import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

const BCB_QR_STATUSES = ['PROCESADO', 'RECHAZADO', 'NO PROCESADO'] as const;

export class BcbPaymentNotificationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  idQR: string;

  @ValidateIf((notification) => notification.estado === 'PROCESADO')
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  idOrdenDestinatario?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  eif: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  ciNitOriginante?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombreOriginante?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(3)
  codMoneda: string;

  @ValidateIf((notification) => notification.estado === 'PROCESADO')
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  importe?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  cuentaOrigen?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  eifOrigen?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  tipoNotificacion?: string;

  @IsString()
  @IsIn(BCB_QR_STATUSES)
  estado: (typeof BCB_QR_STATUSES)[number];

  @IsObject()
  metaData: Record<string, unknown>;
}
