import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { extname, join } from 'path';

@Injectable()
export class FileService {
  constructor(private readonly httpService: HttpService) {}

  async downloadFile(fileUrl: string, filePath: string): Promise<boolean> {
    const writer = fs.createWriteStream(filePath);
    const response = await this.httpService.axiosRef({
      url: fileUrl,
      method: 'GET',
      responseType: 'stream',
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  toBase64(filePath: string): string {
    const extention = extname(filePath).replace('.', '');
    const data = fs.readFileSync(filePath);
    return `data:application/${extention};base64,${Buffer.from(data).toString(
      'base64',
    )}`;
  }

  deleteFile(filePath: string): void {
    fs.unlinkSync(filePath);
  }

  getFilePath(fileName: string): string {
    const appRoot = process.cwd();
    return join(appRoot, 'public', fileName);
  }
}
