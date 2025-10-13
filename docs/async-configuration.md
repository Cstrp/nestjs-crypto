# Async Configuration

For dynamic configuration, you can use async options to load settings from external sources like environment variables or configuration services.

## Using Factory Function

```typescript
import { CryptoModule } from 'nestjs-crypto';

@Module({
  imports: [
    CryptoModule.forRootAsync({
      useFactory: async () => ({
        secret: process.env.CRYPTO_SECRET,
        useBcrypt: true,
        bcryptSaltRounds: 12,
        useAes: true,
      }),
    }),
  ],
})
export class AppModule {}
```

## Using Class Provider

```typescript
import { Injectable } from '@nestjs/common';
import { CryptoModule, CryptoModuleOptions, CryptoModuleOptionsFactory } from 'nestjs-crypto';

@Injectable()
export class CryptoConfigService implements CryptoModuleOptionsFactory {
  createCryptoOptions(): CryptoModuleOptions {
    return {
      secret: this.getSecretFromConfig(),
      useBcrypt: true,
      bcryptSaltRounds: 10,
    };
  }

  private getSecretFromConfig(): string {
    // Load from config service, database, etc.
    return process.env.CRYPTO_SECRET || 'default-secret';
  }
}

@Module({
  imports: [
    CryptoModule.forRootAsync({
      useClass: CryptoConfigService,
    }),
  ],
})
export class AppModule {}
```

## Using Existing Provider

```typescript
@Module({
  imports: [
    CryptoModule.forRootAsync({
      useExisting: ConfigService,
    }),
  ],
})
export class AppModule {}
```
