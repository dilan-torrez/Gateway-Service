import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileRequiredPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(`El archivo "document_pdf" es obligatorio`);
    }
    return file;
  }
}
