import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import {
  CreatePersonDto,
  UpdatePersonDto,
  CreatePersonFingerprintDto,
  FilteredPaginationDto,
} from './dto';
import { catchError } from 'rxjs';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@ApiTags('persons')
@Controller('persons')
export class PersonsController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Get('showListFingerprint')
  @ApiResponse({
    status: 200,
    description: 'Mostrar el listado de huellas digitales',
  })
  async showListFingerprint() {
    return this.client.send('person.showListFingerprint', {}).pipe(
      catchError((err) => {
        throw new HttpException(err, err.statusCode);
      }),
    );
  }
  @UseGuards(AuthGuard)
  @Get()
  @ApiResponse({ status: 200, description: 'Mostrar todas las personas' })
  findAllPersons(@Query() filterDto: FilteredPaginationDto) {
    return this.client.send('person.findAll', filterDto).pipe(
      catchError((err) => {
        throw new HttpException(err, err.statusCode);
      }),
    );
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Mostrar una persona' })
  async findOnePersons(@Param('id') id: string) {
    return this.client.send('person.findOne', { id }).pipe(
      catchError((err) => {
        throw new HttpException(err, err.statusCode);
      }),
    );
  }

  @Post()
  @ApiResponse({ status: 200, description: 'Añadir una persona' })
  createProduct(@Body() createPersonDto: CreatePersonDto) {
    return this.client.send('person.create', createPersonDto).pipe(
      catchError((err) => {
        throw new HttpException(err, err.statusCode);
      }),
    );
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Editar una persona' })
  patchProduct(@Param('id', ParseIntPipe) id: number, @Body() updatePersonDto: UpdatePersonDto) {
    return this.client
      .send('person.update', {
        id,
        ...updatePersonDto,
      })
      .pipe(
        catchError((err) => {
          throw new HttpException(err, 400);
        }),
      );
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Eliminar una persona' })
  deleteProduct(@Param('id') id: string) {
    return this.client.send('person.delete', { id }).pipe(
      catchError((err) => {
        throw new HttpException(err, err.statusCode);
      }),
    );
  }

  @Get('findPersonAffiliatesWithDetails/:id')
  @ApiResponse({
    status: 200,
    description: 'Mostrar una persona con su relación de personAffiliate',
  })
  async findPersonAffiliate(@Param('id') id: string) {
    return this.client.send('person.findPersonAffiliatesWithDetails', { id }).pipe(
      catchError((err) => {
        throw new HttpException(err, err.statusCode);
      }),
    );
  }

  @Get('showPersonsRelatedToAffiliate/:id')
  @ApiResponse({
    status: 200,
    description: 'Mostrar listado de personas relacionadas a un afiliado',
  })
  @ApiResponse({
    status: 404,
    description: 'Person with the specified ID not found',
  })
  async showPersonsRelatedToAffiliate(@Param('id') id: string) {
    return this.client.send('person.showPersonsRelatedToAffiliate', { id }).pipe(
      catchError((err) => {
        throw new HttpException(err, err.code);
      }),
    );
  }

  @Get('findAffiliteRelatedWithPerson/:id')
  @ApiResponse({
    status: 200,
    description: 'Mostrar una persona con su relación de personAffiliate',
  })
  async findAffiliteRelatedWithPerson(@Param('id') id: string) {
    return this.client.send('person.findAffiliteRelatedWithPerson', { id }).pipe(
      catchError((err) => {
        throw new HttpException(err, err.statusCode);
      }),
    );
  }

  @Post('createPersonFingerprint')
  @ApiBody({ type: CreatePersonFingerprintDto }) // Esto especifica que el cuerpo de la solicitud debe ser del tipo CreatePersonFingerprintDto
  @ApiResponse({
    status: 200,
    description: 'Crear una huella digital de una persona',
  })
  @ApiResponse({
    status: 400,
    description: 'Error de validación de entrada',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  @ApiResponse({
    status: 200,
    description: 'Crear una huella digital de una persona',
  })
  async createPersonFingerprint(
    @Body()
    createPersonFingerprintDto: CreatePersonFingerprintDto,
  ) {
    const result = await this.client
      .send('person.createPersonFingerprint', createPersonFingerprintDto)
      .pipe(
        catchError((err) => {
          throw new HttpException(err, err.statusCode);
        }),
      );
    return result;
  }

  @Get('showPersonFingerprint/:id')
  @ApiResponse({
    status: 200,
    description: 'Mostrar el listado de huellas digitales de una persona',
  })
  async showFingerprintRegistered(@Param('id') id: string) {
    return this.client.send('person.showFingerprintRegistered', { id }).pipe(
      catchError((err) => {
        throw new HttpException(err, err.statusCode);
      }),
    );
  }
}
