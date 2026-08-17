import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  Res,
  UseGuards,
  Post,
  ParseUUIDPipe,
  Body
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';

import { NatsService } from 'src/common';
import { AuthGuard } from 'src/auth/guards';

@ApiTags('collections')
@ApiBearerAuth('msp')
@UseGuards(AuthGuard)
@Controller('collections')
export class CollectionsController {
  constructor(
    private readonly nats: NatsService,
  ) {}

  @Get('search/:value/:type')
  @ApiResponse({
    status: 200,
    description: 'Buscar un afiliado',
  })
  async searchPerson(@Param('value') value: string, @Param('type') type: string) {
    return this.nats.send('sales.searchPerson', { value, type });
  }

  @Get('findAll')
  @ApiResponse({
    status: 200,
    description: 'Obtener todas las transacciones',
  })
  async findAll() {
    return this.nats.send('collections.findAll', {});
  }

  

}






