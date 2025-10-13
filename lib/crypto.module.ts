import { DynamicModule, Module } from '@nestjs/common';
import { CryptoCoreModule } from './crypto-core.module';

@Module({})
export class CryptoModule {
  public static forRoot(): DynamicModule {
    return {
      module: CryptoModule,
      imports: [CryptoCoreModule.forRoot()],
      exports: [CryptoCoreModule],
    };
  }

  public static forRootAsync(): DynamicModule {
    return {
      module: CryptoModule,
      imports: [CryptoCoreModule.forRoot()],
      exports: [CryptoCoreModule],
    };
  }

  public static forFeature(): DynamicModule {
    return {
      module: CryptoModule,
      imports: [CryptoCoreModule.forFeature()],
      exports: [CryptoCoreModule],
    };
  }
}
