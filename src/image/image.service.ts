import { BadRequestException, Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';
import { createReadStream } from 'fs';

@Injectable()
export class ImageService {

  constructor() { }

  getImage(filename: string): StreamableFile {
    if (!this.isSafeFilename(filename)) {
      throw new BadRequestException('Invalid filename');
    }

    const filePath = join(process.cwd(), process.env.UPLOAD_DIR || "uploads", filename);

    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    const file = createReadStream(filePath);
    return new StreamableFile(file, {
      disposition: `attachment; filename="${filename}"`
    });
  }

  private isSafeFilename(filename: string): boolean {
    // Only allow alphanumeric, dash, underscore, dot, no path separators
    return /^[a-zA-Z0-9._-]+$/.test(filename);
  }
}
