import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Product } from './product.entity';
import { IProduct, IProductFilter } from './product.interfaces';
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

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    try {
      Logger.log('#### Fetching product data');
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
        newProduct.createdAt = new Date(item.sys.createdAt);
        newProduct.updatedAt = new Date(item.sys.updatedAt);

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

  findAll(params: IProductFilter): Promise<Product[]> {
    const {
      name,
      category,
      start_price: minPrice,
      end_price: maxPrice,
    } = params;

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

  getCountProductsByCategory() {
    return this.productsRepository
      .createQueryBuilder('product')
      .select('product.category AS category')
      .addSelect('COUNT(*)', 'qty')
      .groupBy('product.category')
      .getRawMany();
  }

  getCountProductsByDateRange(startDate: Date, endDate: Date) {
    return this.productsRepository
      .createQueryBuilder('product')
      .where('product.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getCount();
  }

  getProductStatistics() {
    return this.productsRepository
      .createQueryBuilder('product')
      .withDeleted()
      .select('COUNT(*)', 'totalProducts')
      .addSelect(
        'SUM(CASE WHEN product.deletedAt IS NOT NULL THEN 1 ELSE 0 END)',
        'countDeletedProducts',
      )
      .addSelect(
        'SUM(CASE WHEN product.deletedAt IS NULL THEN 1 ELSE 0 END)',
        'countNonDeletedProducts',
      )
      .addSelect(
        'SUM(CASE WHEN product.price IS NOT NULL THEN 1 ELSE 0 END)',
        'countProductsWithPrice',
      )
      .addSelect(
        'SUM(CASE WHEN product.price IS NULL THEN 1 ELSE 0 END)',
        'countProductsWithoutPrice',
      )
      .getRawOne();
  }

  async findStats() {
    const endDate = new Date('2024-01-23T18:45:00');
    const startDate = new Date('2023-12-23T18:45:00');

    const [countStats, countProductsByCategory, countProductsByDateRange] =
      await Promise.all([
        this.getProductStatistics(),
        this.getCountProductsByCategory(),
        this.getCountProductsByDateRange(startDate, endDate),
      ]);

    const total =
      Number(countStats.countNonDeletedProducts) +
      Number(countStats.countDeletedProducts);

    const percentageDeleted =
      (Number(countStats.countDeletedProducts) / total) * 100;

    const percentageWithoutPrice =
      (Number(countStats.countProductsWithoutPrice) / total) * 100;

    const percentageWithPrice =
      (Number(countStats.countProductsWithPrice) / total) * 100;

    const percentageByDateRange =
      (Number(countProductsByDateRange) / total) * 100;

    const formattedStartDate = `${('0' + startDate.getDate()).slice(-2)}/${('0' + (startDate.getMonth() + 1)).slice(-2)}/${startDate.getFullYear()}`;
    const formattedEndDate = `${('0' + endDate.getDate()).slice(-2)}/${('0' + (endDate.getMonth() + 1)).slice(-2)}/${endDate.getFullYear()}`;

    return {
      percentageDeleted: `${percentageDeleted.toFixed(0)}%`,
      qtyWithPrice: `${percentageWithPrice.toFixed(0)}%`,
      qtyWithoutPrice: `${percentageWithoutPrice.toFixed(0)}%`,
      percentageByDateRange: `From ${formattedStartDate} to ${formattedEndDate}: ${percentageByDateRange.toFixed(0)}%`,
      qtyByCategory: countProductsByCategory,
    };
  }

  async deleteById(id: string): Promise<void> {
    await this.productsRepository.softDelete(id);
  }
}
