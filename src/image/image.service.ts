import {
  BadRequestException,
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { createReadStream } from 'fs';

@Injectable()
export class ImageService {
  constructor() {}

  /*
    Get an image
    @param filename - The filename to get the image for
    @returns The image
  */
  getImage(filename: string): StreamableFile {
    if (!this.isSafeFilename(filename)) {
      throw new BadRequestException('Invalid filename');
    }

    const filePath = this.getFilePath(filename);

    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    const file = createReadStream(filePath);
    return new StreamableFile(file, {
      disposition: `attachment; filename="${filename}"`,
    });
  }

  /*
    Delete an image
    @param filename - The filename to delete the image for
    @returns A confirmation object
  */
  deleteImage(filename: string) {
    const filePath = this.getFilePath(filename);

    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    unlinkSync(filePath);
  }

  /* 
    Get the file path for a given filename using cwd, UPLOAD_DIR (default to uploads) and filename
    @param filename - The filename to get the path for
    @returns The file path
  */
  private getFilePath(filename: string) {
    return join(process.cwd(), process.env.UPLOAD_DIR || 'uploads', filename);
  }

  /*
    Check if a filename given by the user is safe
    @param filename - The filename to check
    @returns True if the filename is safe, false otherwise
  */
  private isSafeFilename(filename: string): boolean {
    // Only allow alphanumeric, dash, underscore, dot, no path separators
    return /^[a-zA-Z0-9._-]+$/.test(filename);
  }
}
