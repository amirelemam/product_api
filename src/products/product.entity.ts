import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum Currency {
  USD = 'USD',
}

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  sku: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  name: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  brand: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  model: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  category: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  color: string | null;

  @Column({ type: 'float', nullable: true, default: null })
  price: number | null;

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.USD,
  })
  currency!: Currency;

  @Column({ type: 'integer', nullable: true, default: null })
  stock: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
