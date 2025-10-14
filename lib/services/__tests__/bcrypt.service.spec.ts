import { Test, TestingModule } from '@nestjs/testing';
import { BcryptService } from '../bcrypt.service';
import { ValidationError } from '../../errors';

describe('BcryptService', () => {
  let service: BcryptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BcryptService],
    }).compile();
    service = module.get<BcryptService>(BcryptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hash', () => {
    it('should hash a string successfully', async () => {
      const data = 'myPassword123';
      const hash = await service.hash(data, 12);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).toMatch(/^\$2[aby]\$\d{2}\$.{53}$/);
    });

    it('should throw ValidationError for empty string', async () => {
      await expect(service.hash('', 12)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid salt rounds', async () => {
      await expect(service.hash('test', 3)).rejects.toThrow(ValidationError);
      await expect(service.hash('test', 32)).rejects.toThrow(ValidationError);
    });
  });

  describe('compare', () => {
    it('should return true for matching password', async () => {
      const password = 'test123';
      const hash = await service.hash(password, 12);
      const result = await service.compare(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const hash = await service.hash('password', 12);
      const result = await service.compare('wrong', hash);
      expect(result).toBe(false);
    });

    it('should throw ValidationError for invalid hash', async () => {
      await expect(service.compare('test', 'invalid')).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe('genSalt', () => {
    it('should generate a salt', async () => {
      const salt = await service.genSalt(10);
      expect(salt).toBeDefined();
      expect(salt).toMatch(/^\$2[aby]\$/);
    });
  });

  describe('getSaltRounds', () => {
    it('should extract salt rounds from hash', async () => {
      const hash = await service.hash('test', 10);
      const rounds = await service.getSaltRounds(hash);
      expect(rounds).toBe(10);
    });
  });
});
