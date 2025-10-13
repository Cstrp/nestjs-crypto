import {
  InjectionToken,
  ModuleMetadata,
  OptionalFactoryDependency,
  Type,
} from '@nestjs/common';

export interface CryptoModuleOptions {
  isGlobal?: boolean;

  secret?: string;
  showSecret?: boolean;

  useBcrypt?: boolean;
  bcryptSaltRounds?: number;

  useAes?: boolean;
  aesKey?: string;
  aesIv?: string;

  debug?: boolean;
}

export interface CryptoModuleOptionsFactory {
  createCryptoOptions(): Promise<CryptoModuleOptions> | CryptoModuleOptions;
}

export interface CryptoModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<CryptoModuleOptionsFactory>;
  useClass?: Type<CryptoModuleOptionsFactory>;
  useFactory: (
    ...args: unknown[]
  ) => Promise<CryptoModuleOptions> | CryptoModuleOptions;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
}

export interface CryptoModuleFeatureOptions extends CryptoModuleOptions {
  name?: string;
}
