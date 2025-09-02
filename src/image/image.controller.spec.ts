import { Test, TestingModule } from '@nestjs/testing';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { BadRequestException } from '@nestjs/common';
import { StreamableFile } from '@nestjs/common';

describe('ImageController', () => {
  let controller: ImageController;
  let imageService: Partial<ImageService>;

  beforeEach(async () => {
    imageService = {
      getImage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImageController],
      providers: [
        {
          provide: ImageService,
          useValue: imageService,
        },
      ],
    }).compile();

    controller = module.get(ImageController);
  });

  describe('uploadFile', () => {
    it('should return filename if file exists', () => {
      const file = { filename: 'test.jpg' } as Express.Multer.File;

      const result = controller.uploadFile(file);

      expect(result).toEqual({ filename: 'test.jpg' });
    });

    it('should throw BadRequestException if file is undefined', () => {
      expect(() => controller.uploadFile(undefined as any)).toThrow(BadRequestException);
    });
  });

  describe('getFile', () => {
    it('should call imageService.getImage and return result', () => {
      const streamableFile = new StreamableFile(Buffer.from('test'));
      (imageService.getImage as jest.Mock).mockReturnValue(streamableFile);

      const result = controller.getFile('test.jpg');

      expect(imageService.getImage).toHaveBeenCalledWith('test.jpg');
      expect(result).toBe(streamableFile);
    });
  });
});
