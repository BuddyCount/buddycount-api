import { Test, TestingModule } from '@nestjs/testing';
import { ImageService } from './image.service';
import {
  BadRequestException,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { existsSync, createReadStream } from 'fs';
import { join } from 'path';

jest.mock('fs');
jest.mock('path');

describe('ImageService', () => {
  let service: ImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageService],
    }).compile();

    service = module.get(ImageService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getImage', () => {
    it('should return a StreamableFile if file exists and filename is safe', () => {
      const filename = 'test.jpg';
      (existsSync as jest.Mock).mockReturnValue(true);
      const fakeStream = {} as any;
      (createReadStream as jest.Mock).mockReturnValue(fakeStream);
      (join as jest.Mock).mockReturnValue(`/uploads/${filename}`);

      const result = service.getImage(filename);

      expect(existsSync).toHaveBeenCalledWith(`/uploads/${filename}`);
      expect(createReadStream).toHaveBeenCalledWith(`/uploads/${filename}`);
      expect(result).toBeInstanceOf(StreamableFile);
    });

    it('should throw NotFoundException if file does not exist', () => {
      const filename = 'file.jpg';
      (existsSync as jest.Mock).mockReturnValue(false);
      (join as jest.Mock).mockReturnValue(`/uploads/${filename}`);

      expect(() => service.getImage(filename)).toThrow(NotFoundException);
      expect(existsSync).toHaveBeenCalledWith(`/uploads/${filename}`);
    });

    it('should call isSafeFilename when getting an image', () => {
      const filename = 'test.jpg';
      const isSafeSpy = jest.spyOn(service as any, 'isSafeFilename');

      (existsSync as jest.Mock).mockReturnValue(true);
      const fakeStream = {} as any;
      (createReadStream as jest.Mock).mockReturnValue(fakeStream);
      (join as jest.Mock).mockReturnValue(`/uploads/${filename}`);

      service.getImage(filename);

      expect(isSafeSpy).toHaveBeenCalledWith(filename);
    });

    it('should throw BadRequestException if filename is unsafe', () => {
      const filename = '../file.jpg';
      const isSafeSpy = jest
        .spyOn(service as any, 'isSafeFilename')
        .mockReturnValue(false);

      expect(() => service.getImage(filename)).toThrow(BadRequestException);
      expect(isSafeSpy).toHaveBeenCalledWith(filename);
    });
  });

  describe('isSafeFilename', () => {
    it('should allow valid filenames', () => {
      const filenames = [
        'test.jpg',
        'file-1.png',
        'my_file.txt',
        'a.b_c-123.jpeg',
      ];
      filenames.forEach((name) => {
        expect((service as any).isSafeFilename(name)).toBe(true);
      });
    });

    it('should reject unsafe filenames', () => {
      const filenames = [
        '../file.jpg',
        '/etc/passwd',
        'file\\name.jpg',
        'file/name.png',
      ];
      filenames.forEach((name) => {
        expect((service as any).isSafeFilename(name)).toBe(false);
      });
    });
  });
});
