import { Readable, Transform } from 'stream';
import { createHash } from 'crypto';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { FtpService } from './ftp.service';
import { Logger } from '@nestjs/common';
import { join } from 'path';

const logger = new Logger('FtpStorage');
const TEMP_DIR = '/tmp/imports';

export function ftpStorage(ftpService: FtpService, target: string) {
  return {
    async _handleFile(
      req: any,
      file: { fieldname: string; originalname: string; encoding: string; mimetype: string; stream: Readable },
      cb: (error?: any, info?: any) => void,
    ) {
      const dateStr = new Date().toISOString().split('T')[0];
      const timestamp = Date.now();
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const ftpPath = `/imports/${target}/${dateStr}/${timestamp}_${safeName}`;
      const localDir = join(TEMP_DIR, target, dateStr);
      const localPath = join(localDir, `${timestamp}_${safeName}`);

      let fileSize = 0;
      const hash = createHash('sha256');

      // Ensure local temp directory exists
      await mkdir(localDir, { recursive: true });

      // Save to local temp file first
      const localFile = createWriteStream(localPath);
      const counter = new Transform({
        transform(chunk: Buffer, _encoding: string, callback: (error?: any, data?: any) => void) {
          fileSize += chunk.length;
          hash.update(chunk);
          callback(null, chunk);
        },
      });

      file.stream.pipe(counter);
      counter.pipe(localFile);

      file.stream.on('error', (err) => {
        counter.destroy(err);
        localFile.destroy();
        cb(err);
      });

      counter.on('error', (err) => {
        file.stream.unpipe(counter);
        counter.unpipe(localFile);
        localFile.destroy();
        cb(err);
      });

      localFile.on('error', (err) => {
        cb(err);
      });

      localFile.on('finish', async () => {
        const fileHash = hash.digest('hex');

        // Upload to FTP
        try {
          const { createReadStream } = await import('fs');
          const readStream = createReadStream(localPath);
          await ftpService.uploadStream(readStream, ftpPath);
          logger.log(`FTP upload successful: ${ftpPath}`);
        } catch (ftpErr) {
          cb(ftpErr);
          return;
        }

        cb(null, {
          ftpPath,
          originalname: file.originalname,
          encoding: file.encoding,
          mimetype: file.mimetype,
          size: fileSize,
          fileHash,
        });
      });
    },

    _removeFile(req: any, file: any, cb: (error?: any) => void) {
      if (file.ftpPath) {
        ftpService
          .removeFile([file.ftpPath])
          .then(() => cb(null))
          .catch((err: Error) => cb(err));
      } else {
        cb(null);
      }
    },
  };
}
