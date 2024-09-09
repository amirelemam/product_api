import { DataSource } from 'typeorm';
import { Product } from './src/products/product.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '',
  database: 'postgres',
  entities: [Product],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
