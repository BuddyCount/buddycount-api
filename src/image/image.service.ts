import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';
import { createReadStream } from 'fs';

@Injectable()
export class ImageService {

  constructor() { }

  getImage(filename: string): StreamableFile {
    const filePath = join(process.cwd(), process.env.UPLOAD_DIR || "uploads", filename);

    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    const file = createReadStream(filePath);
    return new StreamableFile(file, {
      disposition: `attachment; filename="${filename}"`
    });
  }
}
