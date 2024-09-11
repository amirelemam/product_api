import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Product } from './product.entity';
import { IProduct } from './product.interfaces';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private readonly configService: ConfigService,
  ) {}

  spaceId = this.configService.get('CONTENTFUL_SPACE_ID');
  accessToken = this.configService.get('CONTENTFUL_ACCESS_TOKEN');
  env = this.configService.get('CONTENTFUL_ENVIRONMENT');
  contentType = this.configService.get('CONTENTFUL_CONTENT_TYPE');

  // @Cron(CronExpression.EVERY_HOUR)
  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    try {
      if (
        !this.spaceId ||
        !this.accessToken ||
        !this.env ||
        !this.contentType
      ) {
        const errorMsg = 'Missing Contentful environment variables';
        Logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      const res = await axios.get(
        `https://cdn.contentful.com/spaces/${this.spaceId}/environments/${this.env}/entries?access_token=${this.accessToken}&content_type=${this.contentType}`,
      );

      if (res.data && res.data.items) {
        Logger.log('Product data fetched successfully');
      } else {
        const errorMsg = 'Error fetching product data';
        Logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      const products: IProduct[] = res.data.items.map((item: any) => {
        const newProduct = new Product();

        newProduct.sku = item.fields.sku;
        newProduct.name = item.fields.name;
        newProduct.brand = item.fields.brand;
        newProduct.model = item.fields.model;
        newProduct.category = item.fields.category;
        newProduct.color = item.fields.color;
        newProduct.price = item.fields.price;
        newProduct.currency = item.fields.currency;
        newProduct.stock = item.fields.stock;

        return newProduct;
      });

      await this.productsRepository.upsert(products, ['sku']);
      Logger.log('Product data saved successfully');
    } catch (error: any) {
      Logger.error(
        `Error fetching product data\n${error.message}`,
        error.stack,
      );
    }
  }

  findAll(
    name: string,
    category: string,
    minPrice: string,
    maxPrice: string,
  ): Promise<Product[]> {
    let where = {};
    if (name) where = { ...where, name: name };
    if (category) where = { ...where, category: category };
    if (minPrice) where = { ...where, price: MoreThanOrEqual(minPrice) };
    if (maxPrice) where = { ...where, price: LessThanOrEqual(maxPrice) };

    return this.productsRepository.find({
      where,
      take: 5,
    });
  }

  getCountDeletedProducts() {
    return this.productsRepository
      .createQueryBuilder('product')
      .withDeleted()
      .where('product.deletedAt IS NOT NULL')
      .getCount();
  }

  getCountNonDeletedProducts() {
    return this.productsRepository
      .createQueryBuilder('product')
      .withDeleted()
      .where('product.deletedAt IS NULL')
      .getCount();
  }

  getCountProductsWithPrice() {
    return this.productsRepository
      .createQueryBuilder('product')
      .where('product.price IS NOT NULL')
      .getCount();
  }

  getCountProductsWithoutPrice() {
    return this.productsRepository
      .createQueryBuilder('product')
      .where('product.price IS NULL')
      .getCount();
  }

  getCountProductsByCategory() {
    return this.productsRepository
      .createQueryBuilder('product')
      .select('product.category AS category')
      .addSelect('COUNT(*)', 'qty')
      .groupBy('product.category')
      .getRawMany();
  }

  async findStats() {
    const [
      countDeletedProducts,
      countNonDeletedProducts,
      countProductsWithPrice,
      countProductsWithoutPrice,
      countProductsByCategory,
    ] = await Promise.all([
      this.getCountDeletedProducts(),
      this.getCountNonDeletedProducts(),
      this.getCountProductsWithPrice(),
      this.getCountProductsWithoutPrice(),
      this.getCountProductsByCategory(),
    ]);

    const total = countNonDeletedProducts + countDeletedProducts;
    const percentageDeleted = (countDeletedProducts / total) * 100;
    const percentageWithoutPrice = (countProductsWithoutPrice / total) * 100;
    const percentageWithPrice = (countProductsWithPrice / total) * 100;

    return {
      percentageDeleted: `${percentageDeleted.toFixed(2)}%`,
      qtyWithPrice: `${percentageWithPrice.toFixed(2)}%`,
      qtyWithoutPrice: `${percentageWithoutPrice.toFixed(2)}%`,
      qtyByCategory: countProductsByCategory,
    };
  }

  async deleteById(id: string): Promise<void> {
    await this.productsRepository.softDelete(id);
  }
}
