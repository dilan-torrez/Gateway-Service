import { Controller, Get, Param, Inject, Query } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { PaginationDto } from 'src/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';

@ApiTags('Kinship')
@Controller('kinships')
export class KinshipsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}
  
  @Get()
  @ApiResponse({ status: 200, description: 'Obtener todos los parentescos' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.client.send(
      'kinships.findAll',
      paginationDto,
    );
  }
  
  @Get(':id')
  @ApiResponse({ status: 200, description: 'Obtener un parentesco' })
  async findOne(@Param('id') id: string) {
    return this.client.send(
      'kinships.findOne',
      { id },
    );
  }
}
