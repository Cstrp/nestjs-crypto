import { BcryptService } from '../services/bcrypt.service';
import { AesService } from '../services/aes.service';
import { logger } from './logger';

const bcryptService = new BcryptService();
const aesService = new AesService();

const testData =
  'The quick brown fox jumps over the lazy dog. 1234567890 !@#$%^&*()_+-=[]{}|;:\'",.<>?/`~';
const saltRounds = 10;

async function benchmarkBcrypt() {
  logger.info('Benchmarking Bcrypt...');

  // Hash benchmark
  const startHash = Date.now();

  for (let i = 0; i < 1000; i++) {
    await bcryptService.hash(testData, saltRounds);
  }

  const endHash = Date.now();
  logger.info(`Bcrypt hash (1000 iterations): ${endHash - startHash}ms`);

  // Compare benchmark
  const hash = await bcryptService.hash(testData, saltRounds);
  const startCompare = Date.now();

  for (let i = 0; i < 1000; i++) {
    await bcryptService.compare(testData, hash);
  }

  const endCompare = Date.now();

  logger.info(
    `Bcrypt compare (1000 iterations): ${endCompare - startCompare}ms`,
  );
}

function benchmarkAes() {
  logger.info('Benchmarking AES...');

  // Encrypt benchmark
  const startEncrypt = Date.now();

  for (let i = 0; i < 1000; i++) {
    aesService.encryptSync(testData);
  }

  const endEncrypt = Date.now();
  logger.info(`AES encrypt (1000 iterations): ${endEncrypt - startEncrypt}ms`);

  // Decrypt benchmark
  const { encrypted, key, iv } = aesService.encryptSync(testData);
  const startDecrypt = Date.now();

  for (let i = 0; i < 1000; i++) {
    aesService.decryptSync(encrypted, key, iv);
  }

  const endDecrypt = Date.now();
  logger.info(`AES decrypt (1000 iterations): ${endDecrypt - startDecrypt}ms`);
}

async function runBenchmarks() {
  logger.info('Starting encryption benchmarks...\n');

  await benchmarkBcrypt();
  logger.info('');
  benchmarkAes();

  logger.info('Benchmarks completed.');
}

runBenchmarks().catch(console.error);
