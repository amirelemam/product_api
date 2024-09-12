import { DataSource } from 'typeorm';
import { Product } from './src/products/product.entity';
import { ConfigService } from '@nestjs/config';
const configService: ConfigService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('POSTGRES_HOST'),
  port: Number(configService.get('POSTGRES_PORT')),
  username: configService.get('POSTGRES_USER'),
  password: configService.get('POSTGRES_PASSWORD'),
  database: configService.get('POSTGRES_DB'),
  entities: [Product],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  extra: {
    max: 20, // Maximum number of connections
  },
});
