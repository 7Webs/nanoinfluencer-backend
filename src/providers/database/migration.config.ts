import { DataSource } from 'typeorm';
import { Migration1732026557745 } from './migrations/1732026557745-migration';
import { Migration1732248419082 } from './migrations/1732248419082-migration';
import { Migration1732340897135 } from './migrations/1732340897135-migration';
import { Migration1732608562214 } from './migrations/1732608562214-migration';
import { Migration1732800981738 } from './migrations/1732800981738-migration';
import { Migration1733142016366 } from './migrations/1733142016366-migration';
import { Migration1733144312282 } from './migrations/1733144312282-migration';
import { Migration1734273669304 } from './migrations/1734273669304-migration';
import { Migration1735125560116 } from './migrations/1735125560116-migration';

/**
 * TypeORM DataSource configuration for migrations.
 *
 * @remarks
 * This is the configuration for TypeORM's DataSource that is used for running migrations.
 * The DataSource is configured to connect to the PostgreSQL, or any other database specified by the
 * environment variables DB_HOST, DB_PASSWORD, DB_USERNAME, DB_NAME, and DB_PORT.
 * The migrations are stored in the migrations directory, and the entities are stored in the
 * entities directory.
 *
 * @see {@link https://typeorm.io/docs/data-source}
 */
export const datasource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  username: process.env.DB_USERNAME,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT),
  synchronize: false,
  ssl: {
    rejectUnauthorized: false,
  },

  migrations: [Migration1735125560116],
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  logging: ['error', 'warn', 'info'],
});
