import {
  CryptoModuleAsyncOptions,
  CryptoModuleFeatureOptions,
  CryptoModuleOptions,
} from './types';
import { DynamicModule, Module } from '@nestjs/common';
import { CryptoCoreModule } from './crypto-core.module';

@Module({})
export class CryptoModule {
  public static forRoot(options: CryptoModuleOptions): DynamicModule {
    return {
      module: CryptoModule,
      imports: [CryptoCoreModule.forRoot(options)],
      exports: [CryptoCoreModule],
    };
  }

  public static forRootAsync(options: CryptoModuleAsyncOptions): DynamicModule {
    return {
      module: CryptoModule,
      imports: [CryptoCoreModule.forRootAsync(options)],
      exports: [CryptoCoreModule],
    };
  }

  public static forFeature(options: CryptoModuleFeatureOptions): DynamicModule {
    return {
      module: CryptoModule,
      imports: [CryptoCoreModule.forFeature(options)],
      exports: [CryptoCoreModule],
    };
  }
}
