import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Product } from './product.entity';
import { IProduct } from './product.interfaces';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import 'dotenv/config';

const spaceId = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
const env = process.env.CONTENTFUL_ENVIRONMENT;
const contentType = process.env.CONTENTFUL_CONTENT_TYPE;

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  // @Cron(CronExpression.EVERY_HOUR)
  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    try {
      if (!spaceId || !accessToken || !env || !contentType) {
        const errorMsg = 'Missing Contentful environment variables';
        Logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      const res = await axios.get(
        `https://cdn.contentful.com/spaces/${spaceId}/environments/${env}/entries?access_token=${accessToken}&content_type=${contentType}`,
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

  findStats(): Promise<Product[]> {
    return this.productsRepository.find();
  }

  async deleteById(id: string): Promise<void> {
    await this.productsRepository.softDelete(id);
  }
}
