import {
  Controller,
  Get,
  Post,
  Param,
  UseInterceptors,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ImageService } from './image.service';
import { ApiBody, ApiConsumes, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParseFilePipe, UploadedFile } from '@nestjs/common';
import { MaxFileSizeValidator } from '@nestjs/common';
import { StreamableFile } from '@nestjs/common';
import { MAX_IMAGE_SIZE } from 'src/utils/constants';
import { AuthGuard } from '@nestjs/passport';

@ApiBearerAuth()
@ApiTags('Images')
@UseGuards(AuthGuard('jwt'))
@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  /**
   * Upload an image
   * @param file
   * @returns filename on disk
   */
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: MAX_IMAGE_SIZE })],
      }),
    )
    file: Express.Multer.File,
  ) {
    if (file == undefined) {
      throw new BadRequestException('File not found');
    }

    return { filename: file.filename };
  }

  @Get(':filename')
  getFile(@Param('filename') filename: string): StreamableFile {
    return this.imageService.getImage(filename);
  }
}
