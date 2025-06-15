import { Injectable } from '@nestjs/common';

@Injectable()
export class FileUploadService {
  handleFileUpload(file: Express.Multer.File) : string {
    return file.path;
  }
}