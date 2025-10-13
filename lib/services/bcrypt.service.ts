import { Injectable } from '@nestjs/common';
import { logger } from '../utils';
import { Logger } from 'pino';

@Injectable()
export class BcryptService {
  private readonly logger: Logger = logger;

  public async hash(data: string, saltRounds: number): Promise<string> {
    const bcrypt = await import('bcrypt');
    const hash = await bcrypt.hash(data, saltRounds);

    this.logger.debug({ hash }, 'Generated bcrypt hash');

    return hash;
  }

  public async hashSync(data: string, saltRounds: number): Promise<string> {
    const bcrypt = await import('bcrypt');

    const hash = bcrypt.hashSync(data, saltRounds);

    this.logger.debug({ hash }, 'Generated bcrypt hash (sync)');

    return hash;
  }

  public async compare(data: string, encrypted: string): Promise<boolean> {
    const bcrypt = await import('bcrypt');

    const isMatch = await bcrypt.compare(data, encrypted);

    this.logger.debug({ isMatch }, 'Bcrypt compare result');

    return isMatch;
  }

  public async compareSync(data: string, encrypted: string): Promise<boolean> {
    const bcrypt = await import('bcrypt');
    const isMatch = bcrypt.compareSync(data, encrypted);

    this.logger.debug({ isMatch }, 'Bcrypt compare result (sync)');

    return isMatch;
  }

  public async genSalt(saltRounds: number): Promise<string> {
    const bcrypt = await import('bcrypt');

    const salt = await bcrypt.genSalt(saltRounds);

    this.logger.debug({ salt }, 'Generated bcrypt salt');

    return salt;
  }

  public async getSaltRounds(encrypted: string): Promise<number> {
    const bcrypt = await import('bcrypt');

    const saltRounds = bcrypt.getRounds(encrypted);

    this.logger.debug({ saltRounds }, 'Bcrypt salt rounds');

    return saltRounds;
  }
}
