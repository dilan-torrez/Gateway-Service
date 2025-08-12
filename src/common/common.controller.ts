import { Controller, Post, UploadedFile, UseInterceptors, Body } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { FtpService } from './';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('common')
@Controller('common')
export class CommonController {
  constructor(private readonly ftp: FtpService) {}

  @MessagePattern('ftp.listFiles')
  async listFiles(data: { path: string; key?: boolean }) {
    return this.ftp.listFiles(data.path, data.key);
  }

  @MessagePattern('ftp.renameFile')
  async renameFile(data: { oldPath: string; newPath: string }) {
    return this.ftp.renameFile(data.oldPath, data.newPath);
  }

  @MessagePattern('ftp.connectSwitch')
  async connectSwitch(data: { value: string }) {
    return this.ftp.connectSwitch(data.value);
  }

  @Post('uploadChunk')
  @ApiOperation({ summary: 'Subir por chunks' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Chunk del archivo (máx. 5MB)',
    type: 'multipart/form-data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        chunk: {
          type: 'string',
          format: 'binary',
          description: 'Chunk del archivo',
        },
        openFtp: { type: 'string' },
        closeFtp: { type: 'string' },
        numberChunk: { type: 'string' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('chunk'))
  async uploadChunk(
    @UploadedFile() chunk: Express.Multer.File,
    @Body() body: any,
  ) {
    const { nameChunk } = body;
    await this.ftp.uploadChunk(chunk, nameChunk);

    return {
      message: 'Chunk subido exitosamente',
      serviceStatus: true,
    };
  }
}
