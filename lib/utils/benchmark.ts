import { BcryptService } from '../services/bcrypt.service';
import { AesService } from '../services/aes.service';

const bcryptService = new BcryptService();
const aesService = new AesService();

const testData =
  'This is a test string for benchmarking encryption performance.';
const saltRounds = 10;

async function benchmarkBcrypt() {
  console.log('Benchmarking Bcrypt...');

  // Hash benchmark
  const startHash = Date.now();
  for (let i = 0; i < 100; i++) {
    await bcryptService.hash(testData, saltRounds);
  }
  const endHash = Date.now();
  console.log(`Bcrypt hash (100 iterations): ${endHash - startHash}ms`);

  // Compare benchmark
  const hash = await bcryptService.hash(testData, saltRounds);
  const startCompare = Date.now();
  for (let i = 0; i < 100; i++) {
    await bcryptService.compare(testData, hash);
  }
  const endCompare = Date.now();
  console.log(
    `Bcrypt compare (100 iterations): ${endCompare - startCompare}ms`,
  );
}

function benchmarkAes() {
  console.log('Benchmarking AES...');

  // Encrypt benchmark
  const startEncrypt = Date.now();
  for (let i = 0; i < 1000; i++) {
    aesService.encryptSync(testData);
  }
  const endEncrypt = Date.now();
  console.log(`AES encrypt (1000 iterations): ${endEncrypt - startEncrypt}ms`);

  // Decrypt benchmark
  const { encrypted, key, iv } = aesService.encryptSync(testData);
  const startDecrypt = Date.now();
  for (let i = 0; i < 1000; i++) {
    aesService.decryptSync(encrypted, key, iv);
  }
  const endDecrypt = Date.now();
  console.log(`AES decrypt (1000 iterations): ${endDecrypt - startDecrypt}ms`);
}

async function runBenchmarks() {
  console.log('Starting encryption benchmarks...\n');

  await benchmarkBcrypt();
  console.log('');
  benchmarkAes();

  console.log('\nBenchmarks completed.');
}

runBenchmarks().catch(console.error);
