import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileRequiredPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('El archivo PDF es obligatorio');
    }
    console.log('validación');

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('El archivo debe ser PDF');
    }

    return file;
  }
}
