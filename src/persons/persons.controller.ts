import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PaginationDto } from 'src/common';
import { NATS_SERVICE } from 'src/config';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { catchError } from 'rxjs';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('persons') 
@Controller('persons')
export class PersonsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Mostrar todos los afiliados' })
  findAllPersons(@Query() paginationDto: PaginationDto) {
    return this.client.send(
      'person.findAll',
      paginationDto,
    );
  }

  @Get(':id')
  async findOnePersons(@Param('id') id: string) {
    return this.client.send(
      'person.findOne',
      { id },
    );
  }

  @Post()
  createProduct(@Body() CreatePersonDto: CreatePersonDto) {
    return this.client.send(
      'person.create',
      CreatePersonDto,
    );
  }

  @Patch(':id')
  patchProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() UpdatePersonDto: UpdatePersonDto,
  ) {
    return this.client
      .send(
        'person.update',
        {
          id,
          ...UpdatePersonDto,
        },
      )
      .pipe(
        catchError((err) => {
          throw new RpcException(err);
        }),
      );
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    return this.client.send('person.delete', { id }).pipe(
      catchError((err) => {
        throw new RpcException(err);
      }),
    );
  }
}
