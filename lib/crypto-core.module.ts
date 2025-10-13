import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';
import { BcryptService, AesService } from './services';
import { DiscoveryModule } from '@nestjs/core';

import {
  CryptoModuleAsyncOptions,
  CryptoModuleFeatureOptions,
  CryptoModuleOptions,
  CryptoModuleOptionsFactory,
} from './types';

@Global()
@Module({
  imports: [DiscoveryModule],
})
export class CryptoCoreModule {
  constructor() {}

  public static forRoot(options: CryptoModuleOptions): DynamicModule {
    const providers: Provider[] = [
      { provide: 'CRYPTO_MODULE_OPTIONS', useValue: options },
    ];

    if (options.useBcrypt !== false) {
      providers.push(BcryptService);
    }

    if (options.useAes !== false) {
      providers.push(AesService);
    }

    return {
      module: CryptoCoreModule,
      providers,
      exports: providers,
    };
  }

  public static forRootAsync(options: CryptoModuleAsyncOptions): DynamicModule {
    const providers = this.makeAsyncProviders(options);

    providers.push(BcryptService, AesService);

    return {
      module: CryptoCoreModule,
      imports: options.imports || [],
      providers: [...providers],
      exports: [...providers],
    };
  }

  public static forFeature(
    options?: CryptoModuleFeatureOptions,
  ): DynamicModule {
    const providers: Provider[] = [];

    if (options?.useBcrypt !== false) {
      providers.push(BcryptService);
    }

    if (options?.useAes !== false) {
      providers.push(AesService);
    }

    return {
      module: CryptoCoreModule,
      providers,
      exports: providers,
    };
  }

  private static makeAsyncOptionsProvider(
    options: CryptoModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: 'CRYPTO_MODULE_OPTIONS',
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const inject = [
      (options.useClass || options.useExisting) as Type<CryptoModuleOptions>,
    ];

    return {
      provide: 'CRYPTO_MODULE_OPTIONS',
      inject,
      useFactory: async (optionsFactory: CryptoModuleOptionsFactory) => {
        return optionsFactory.createCryptoOptions();
      },
    };
  }

  private static makeAsyncProviders(
    options: CryptoModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.makeAsyncOptionsProvider(options)];
    }

    const useClass = options.useClass as Type<CryptoModuleOptionsFactory>;

    return [
      this.makeAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }
}
