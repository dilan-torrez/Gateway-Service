import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileRequiredPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('El archivo PDF es obligatorio');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('El archivo debe ser PDF');
    }

    return file;
  }
}

@Injectable()
export class FileChunkRequiredPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('El archivo es obligatorio');
    }

    if (file.mimetype !== 'application/octet-stream') {
      throw new BadRequestException('El archivo debe ser binario - chunk');
    }

    return file;
  }
}
