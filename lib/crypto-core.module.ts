import {
  DynamicModule,
  Global,
  Module,
  OnApplicationShutdown,
} from '@nestjs/common';
import { DiscoveryModule, ModuleRef } from '@nestjs/core';

@Global()
@Module({
  imports: [DiscoveryModule],
})
export class CryptoCoreModule implements OnApplicationShutdown {
  constructor(private readonly moduleRef: ModuleRef) {}

  public async onApplicationShutdown(): Promise<void> {}

  public static forRoot(): DynamicModule {}
  public static forRootAsync(): DynamicModule {}
  public static forFeature(): DynamicModule {}

  private static makeAsyncOptionsProvider() {}
  private static makeAsyncProviders() {}
}
