import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { NatsService } from 'src/common';
import { ReportsSalesService } from 'src/reports/services/reports.sales.service';

@ApiTags('sales')
@Controller('sales')
export class SalesController {
  constructor(
    private readonly nats: NatsService,
    private readonly reportsSalesService: ReportsSalesService,
  ) {}

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

  @Get('receipt/:saleId')
  @ApiOperation({ summary: 'Generar recibo oficial de venta en PDF' })
  @ApiParam({ name: 'saleId', type: Number, example: 1 })
  @ApiQuery({
    name: 'template',
    required: false,
    enum: ['reciboPrueba', 'reciboFormal'],
    example: 'reciboFormal',
  })
  @ApiProduces('application/pdf')
  @ApiResponse({
    status: 200,
    description: 'PDF del recibo oficial',
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  async saleReceipt(
    @Param('saleId', ParseIntPipe) saleId: number,
    @Query('template') template: string,
    @Res() res: Response,
  ) {
    const dataSale = (await this.nats.firstValue('sales.personSaleDetails', {
      saleId,
    }));

    const receipt = await this.reportsSalesService.renderSaleReceipt(
      dataSale.data,
      template,
    );

    res.set({
      'Content-Type': receipt.contentType,
      'Content-Disposition': `${receipt.disposition}; filename="${receipt.fileName}"`,
      'Content-Length': receipt.buffer.length,
    });

    res.send(receipt.buffer);
  }
}
