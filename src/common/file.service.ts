import Axios from 'axios';
import * as fs from 'fs';
import { extname, join } from 'path';

export class FileService {
  async downloadFile(fileUrl: string, filePath: string): Promise<boolean> {
    const writer = fs.createWriteStream(filePath);
    return Axios({
      method: 'get',
      url: fileUrl,
      responseType: 'stream',
    }).then((response) => {
      return new Promise((resolve, reject) => {
        response.data.pipe(writer);
        let error = null;
        writer.on('error', (err) => {
          error = err;
          writer.close();
          reject(err);
        });
        writer.on('close', () => {
          if (!error) {
            resolve(true);
          }
        });
      });
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
