# File Encryption Example

This example demonstrates how to encrypt and decrypt files using the AES service in NestJS.

## Use Case

Encrypt sensitive files before storing them on disk or in cloud storage (S3, Azure Blob, etc.) to ensure data at rest is protected.

## Implementation

### 1. File Encryption Service

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { AesService } from 'nestjs-crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { createCipheriv, createDecipheriv } from 'crypto';

interface EncryptedFileMetadata {
  originalName: string;
  encryptedPath: string;
  iv: string;
  keyVersion: number;
  size: number;
  mimeType: string;
  encryptedAt: Date;
}

@Injectable()
export class FileEncryptionService {
  private readonly logger = new Logger(FileEncryptionService.name);

  constructor(private readonly aesService: AesService) {}

  /**
   * Encrypt a file (for small files)
   */
  async encryptFile(filePath: string): Promise<EncryptedFileMetadata> {
    try {
      // Read file content
      const content = await fs.readFile(filePath);
      const contentString = content.toString('base64');

      // Encrypt
      const key = this.getEncryptionKey();
      const iv = this.aesService.generateIv();
      const result = this.aesService.encrypt(contentString, key, iv);

      // Generate encrypted file path
      const encryptedPath = `${filePath}.encrypted`;

      // Save encrypted content
      await fs.writeFile(encryptedPath, result.encrypted);

      // Get file stats
      const stats = await fs.stat(filePath);

      return {
        originalName: path.basename(filePath),
        encryptedPath,
        iv: result.iv,
        keyVersion: 1,
        size: stats.size,
        mimeType: this.getMimeType(filePath),
        encryptedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to encrypt file: ${error.message}`);
      throw error;
    }
  }

  /**
   * Decrypt a file (for small files)
   */
  async decryptFile(
    encryptedPath: string,
    iv: string,
    outputPath?: string,
  ): Promise<string> {
    try {
      // Read encrypted content
      const encryptedContent = await fs.readFile(encryptedPath, 'utf8');

      // Decrypt
      const key = this.getEncryptionKey();
      const decrypted = this.aesService.decrypt(encryptedContent, key, iv);

      // Convert from base64
      const content = Buffer.from(decrypted, 'base64');

      // Determine output path
      const finalPath = outputPath || encryptedPath.replace('.encrypted', '');

      // Save decrypted file
      await fs.writeFile(finalPath, content);

      return finalPath;
    } catch (error) {
      this.logger.error(`Failed to decrypt file: ${error.message}`);
      throw error;
    }
  }

  /**
   * Encrypt large file using streams
   */
  async encryptLargeFile(
    inputPath: string,
    outputPath?: string,
  ): Promise<EncryptedFileMetadata> {
    const encryptedPath = outputPath || `${inputPath}.encrypted`;

    // Generate key and IV
    const key = Buffer.from(this.getEncryptionKey(), 'hex');
    const iv = this.aesService.generateIv();

    // Create cipher
    const cipher = createCipheriv('aes-256-cbc', key, iv);

    // Stream encryption
    const input = createReadStream(inputPath);
    const output = createWriteStream(encryptedPath);

    await pipeline(input, cipher, output);

    const stats = await fs.stat(inputPath);

    return {
      originalName: path.basename(inputPath),
      encryptedPath,
      iv: iv.toString('hex'),
      keyVersion: 1,
      size: stats.size,
      mimeType: this.getMimeType(inputPath),
      encryptedAt: new Date(),
    };
  }

  /**
   * Decrypt large file using streams
   */
  async decryptLargeFile(
    encryptedPath: string,
    iv: string,
    outputPath?: string,
  ): Promise<string> {
    const finalPath = outputPath || encryptedPath.replace('.encrypted', '');

    // Get key
    const key = Buffer.from(this.getEncryptionKey(), 'hex');
    const ivBuffer = Buffer.from(iv, 'hex');

    // Create decipher
    const decipher = createDecipheriv('aes-256-cbc', key, ivBuffer);

    // Stream decryption
    const input = createReadStream(encryptedPath);
    const output = createWriteStream(finalPath);

    await pipeline(input, decipher, output);

    return finalPath;
  }

  /**
   * Get encryption key from environment or KMS
   */
  private getEncryptionKey(): string {
    const key = process.env.FILE_ENCRYPTION_KEY;

    if (!key) {
      throw new Error('FILE_ENCRYPTION_KEY not configured');
    }

    if (key.length !== 64) {
      throw new Error('FILE_ENCRYPTION_KEY must be 64 hex characters');
    }

    return key;
  }

  /**
   * Determine MIME type from file extension
   */
  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.txt': 'text/plain',
      '.json': 'application/json',
      '.xml': 'application/xml',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }
}
```

### 2. File Storage Entity

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class EncryptedFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  originalName: string;

  @Column()
  encryptedPath: string;

  @Column()
  iv: string;

  @Column()
  keyVersion: number;

  @Column()
  size: number;

  @Column()
  mimeType: string;

  @CreateDateColumn()
  uploadedAt: Date;

  @Column({ nullable: true })
  expiresAt?: Date;
}
```

### 3. File Upload Controller

```typescript
import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FileController {
  constructor(
    private readonly fileEncryptionService: FileEncryptionService,
    private readonly fileService: FileService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename = `${uuid()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    // Encrypt file
    const metadata = await this.fileEncryptionService.encryptFile(file.path);

    // Save metadata to database
    const record = await this.fileService.create({
      userId: req.user.id,
      ...metadata,
    });

    // Delete original file
    await fs.unlink(file.path);

    return {
      id: record.id,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  @Get(':id/download')
  async downloadFile(@Param('id') id: string, @Request() req, @Res() res: Response) {
    // Get file metadata
    const file = await this.fileService.findOne(id, req.user.id);

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Decrypt to temporary location
    const tempPath = `./temp/${uuid()}-${file.originalName}`;
    await this.fileEncryptionService.decryptFile(
      file.encryptedPath,
      file.iv,
      tempPath,
    );

    // Send file
    res.download(tempPath, file.originalName, async (err) => {
      // Clean up temp file
      await fs.unlink(tempPath);

      if (err) {
        this.logger.error(`Download failed: ${err.message}`);
      }
    });
  }
}
```

### 4. File Service

```typescript
@Injectable()
export class FileService {
  constructor(
    @InjectRepository(EncryptedFile)
    private readonly fileRepository: Repository<EncryptedFile>,
  ) {}

  async create(data: Partial<EncryptedFile>): Promise<EncryptedFile> {
    const file = this.fileRepository.create(data);
    return this.fileRepository.save(file);
  }

  async findOne(id: string, userId: string): Promise<EncryptedFile> {
    return this.fileRepository.findOne({
      where: { id, userId },
    });
  }

  async findAllByUser(userId: string): Promise<EncryptedFile[]> {
    return this.fileRepository.find({
      where: { userId },
      order: { uploadedAt: 'DESC' },
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    const file = await this.findOne(id, userId);

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Delete encrypted file
    await fs.unlink(file.encryptedPath);

    // Delete database record
    await this.fileRepository.remove(file);
  }
}
```

### 5. Module Configuration

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { CryptoModule } from 'nestjs-crypto';
import { FileEncryptionService } from './file-encryption.service';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { EncryptedFile } from './entities/encrypted-file.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EncryptedFile]),
    MulterModule.register({
      dest: './uploads',
    }),
    CryptoModule.forRoot(),
  ],
  controllers: [FileController],
  providers: [FileEncryptionService, FileService],
  exports: [FileEncryptionService, FileService],
})
export class FileEncryptionModule {}
```

## Usage Examples

### Upload and Encrypt

```bash
curl -X POST http://localhost:3000/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf"
```

### Download and Decrypt

```bash
curl -X GET http://localhost:3000/files/FILE_ID/download \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o decrypted-document.pdf
```

## Environment Configuration

```bash
# .env
FILE_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

## Best Practices

### ✅ Do

- Use streams for large files (>10MB)
- Delete unencrypted files after encryption
- Implement file size limits
- Validate file types
- Use temporary files for decryption
- Clean up temporary files
- Store IV with file metadata
- Implement access control
- Log file access

### ❌ Don't

- Keep unencrypted files on disk
- Encrypt files in memory for large files
- Store encryption keys in database
- Expose file paths to clients
- Allow unlimited file sizes
- Skip virus scanning
- Log file contents

## Security Considerations

1. **Virus Scanning:** Scan files before encryption
2. **File Validation:** Validate file types and content
3. **Access Control:** Verify user owns the file
4. **Audit Logging:** Log all file access
5. **Temporary Files:** Clean up after operations
6. **Key Rotation:** Support re-encrypting with new keys

## See Also

- [AES Service Guide](/guide/aes)
- [AesService API](/api/aes-service)
- [Security Best Practices](/guide/security)
- [Data Encryption Example](/examples/data-encryption)
