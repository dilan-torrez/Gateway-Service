import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { NatsService } from 'src/common';

@ApiTags('sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly nats: NatsService) {
  }

  @Get('search/:value/:type')
  @ApiResponse({
    status: 200,
    description: 'Buscar un afiliado',
  })
  async searchPerson(@Param('value') value: string, @Param('type') type: string) {
    return this.nats.send('sales.searchPerson', { value, type });
  }

  @Get('groups')
  @ApiResponse({
    status: 200,
    description: 'Obtener grupos de ventas',
  })
  async groups() {
    return this.nats.send('sales.groups', {});
  }

  @Get('groups/:groupId/products')
  @ApiResponse({
    status: 200,
    description: 'Obtener los productos de un grupo de ventas',
  })
  async groupProducts(@Param('groupId') groupId: number) {
    return this.nats.send('sales.groupProducts', { groupId });
  }
}
