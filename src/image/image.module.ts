import { BadRequestException, Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { diskStorage } from 'multer';
import { MulterModule } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';


@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: process.env.UPLOAD_DIR || './uploads',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${uuidv4()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
      // Filter here cause didn't succedd to add multiple file types using fileTypeValidator in controller
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Invalid file type, must be an image'), false);
        }
      },
    }),
  ],
  controllers: [ImageController],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule { }
