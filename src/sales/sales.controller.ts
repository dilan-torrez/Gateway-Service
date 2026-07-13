import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
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
import { SalesListResponse } from 'src/reports/interfaces/sales/sales-list-data.interface';
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
    const dataSale = await this.nats.firstValue('sales.personSaleDetails', {
      saleId,
    });

    const receipt = await this.reportsSalesService.renderSaleReceipt(dataSale.data, template);

    res.set({
      'Content-Type': receipt.contentType,
      'Content-Disposition': `${receipt.disposition}; filename="${receipt.fileName}"`,
      'Content-Length': receipt.buffer.length,
    });

    res.send(receipt.buffer);
  }

  @Get('reports/sales-list') // recibiremos dos entradas obligatorias q son las fechas
  @ApiOperation({ summary: 'Generar lista de ventas en PDF' })
  @ApiQuery({
    name: 'dateFrom',
    required: true,
    example: '2026-07-01',
  })
  @ApiQuery({
    name: 'dateTo',
    required: true,
    example: '2026-07-13',
  })
  @ApiQuery({
    name: 'template',
    required: false,
    enum: ['ventasFormal'],
    example: 'ventasFormal',
  })
  @ApiProduces('application/pdf')
  @ApiResponse({
    status: 200,
    description: 'PDF de la lista de ventas',
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  async salesList(
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @Query('template') template: string,
    @Res() res: Response,
  ) {
    if (!dateFrom || !dateTo) {
      throw new BadRequestException({
        error: true,
        message: 'Debe enviar dateFrom y dateTo para generar el reporte.',
      });
    }

    const dataSale = (await this.nats.firstValue('sales.list', {
      dateFrom,
      dateTo,
    })) as SalesListResponse;

    if (dataSale?.error) {
      throw new BadRequestException({
        error: true,
        message: dataSale.message,
      });
    }

    if (!dataSale?.data) {
      throw new NotFoundException({
        error: true,
        message: 'No se encontraron datos para generar el reporte de ventas.',
      });
    }

    const receipt = await this.reportsSalesService.renderSalesList(dataSale.data, template);

    res.set({
      'Content-Type': receipt.contentType,
      'Content-Disposition': `${receipt.disposition}; filename="${receipt.fileName}"`,
      'Content-Length': receipt.buffer.length,
    });

    
    res.send(receipt.buffer);
  }
}
