import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum Currency {
  USD = 'USD',
}

@Entity()
export class Product {
  @ApiProperty({ example: '6af7781e-eb86-4cde-80e2-5ec8f9f2f0c7' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: 'S853O500' })
  @Column({ type: 'varchar', nullable: false, unique: true })
  sku: string;

  @ApiProperty({ example: 'Apple Galaxy Watch 4' })
  @Column({ type: 'varchar', nullable: true, default: null })
  name: string | null;

  @ApiProperty({ example: 'Lenovo' })
  @Column({ type: 'varchar', nullable: true, default: null })
  brand: string | null;

  @ApiProperty({ example: 'Galaxy Watch 4' })
  @Column({ type: 'varchar', nullable: true, default: null })
  model: string | null;

  @ApiProperty({ example: 'Camera' })
  @Column({ type: 'varchar', nullable: true, default: null })
  category: string | null;

  @ApiProperty({ example: 'White' })
  @Column({ type: 'varchar', nullable: true, default: null })
  color: string | null;

  @ApiProperty({ example: 340.16 })
  @Column({ type: 'float', nullable: true, default: null })
  price: number | null;

  @ApiProperty({ example: 'USD' })
  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.USD,
  })
  currency!: Currency;

  @ApiProperty({ example: 58 })
  @Column({ type: 'integer', nullable: true, default: null })
  stock: number | null;

  @ApiProperty({ example: '2024-01-23T21:46:31.566Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2024-01-23T21:46:31.566Z' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ example: '2024-01-23T21:46:31.566Z' })
  @DeleteDateColumn()
  deletedAt?: Date;
}

export class ProductStats {
  @ApiProperty({ example: '100%' })
  percentageDeleted: string;

  @ApiProperty({ example: '1%' })
  qtyWithPrice: string;

  @ApiProperty({ example: '0%' })
  qtyWithoutPrice: string;

  @ApiProperty({ example: 'From 23/12/2023 to 23/01/2024: 40%' })
  percentageByDateRange: string;

  @ApiProperty({
    example: [
      {
        category: 'Headphones',
        qty: '16',
      },
      {
        category: 'Camera',
        qty: '20',
      },
    ],
  })
  qtyByCategory: { category: string; qty: string }[];
}
