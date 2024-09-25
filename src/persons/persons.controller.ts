import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { catchError } from 'rxjs';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { FilterDto } from './dto/filter-person.dto';

@ApiTags('persons')
@Controller('persons')
export class PersonsController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Mostrar todas las personas' })
  findAllPersons(@Query() filterDto: FilterDto) {
    return this.client.send('person.findAll', filterDto);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Mostrar una persona' })
  async findOnePersons(@Param('id') id: string) {
    return this.client.send('person.findOne', { id });
  }

  @Post()
  @ApiResponse({ status: 200, description: 'Añadir una persona' })
  createProduct(@Body() createPersonDto: CreatePersonDto) {
    return this.client.send('person.create', createPersonDto);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Editar una persona' })
  patchProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePersonDto: UpdatePersonDto,
  ) {
    return this.client
      .send('person.update', {
        id,
        ...updatePersonDto,
      })
      .pipe(
        catchError((err) => {
          throw new RpcException(err);
        }),
      );
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Eliminar una persona' })
  deleteProduct(@Param('id') id: string) {
    return this.client.send('person.delete', { id }).pipe(
      catchError((err) => {
        throw new RpcException(err);
      }),
    );
  }
}
