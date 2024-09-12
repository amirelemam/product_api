import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../product.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../product.entity';
import { ConfigService } from '@nestjs/config';
import {
  mockProductLenovoThinkPadX1,
  mockAllProductsLimit5,
  mockProductCategoryHeadphones,
  mockProductsMinPrice1000MaxPrice2000,
  mockProductStatsQueryResult,
  mockProductStats,
} from './mock';

describe('ProductsService', () => {
  let productService: ProductService;
  let productRepository: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            find: jest.fn().mockImplementation((args) => {
              const { where } = args;
              const { name, category, price } = where;
              if (name) {
                return [mockProductLenovoThinkPadX1];
              } else if (category) {
                return [mockProductCategoryHeadphones];
              } else if (price && price.lte && price.gte) {
                return mockProductsMinPrice1000MaxPrice2000;
              } else {
                return mockAllProductsLimit5;
              }
            }),
            createQueryBuilder: jest.fn(() => ({
              withDeleted: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockResolvedValue({
                totalProducts: 100,
                countDeletedProducts: 1,
                countNonDeletedProducts: 99,
                countProductsWithPrice: 100,
                countProductsWithoutPrice: 0,
              }),
              getCount: jest.fn().mockResolvedValue(40),
              groupBy: jest.fn().mockReturnThis(),
              getRawMany: jest.fn().mockResolvedValue([
                {
                  category: 'Headphones',
                  qty: '16',
                },
                {
                  category: 'Camera',
                  qty: '20',
                },
                {
                  category: 'Smartphone',
                  qty: '14',
                },
                {
                  category: 'Laptop',
                  qty: '13',
                },
                {
                  category: 'Tablet',
                  qty: '18',
                },
                {
                  category: 'Smartwatch',
                  qty: '18',
                },
              ]),
            })),
            upsert: jest.fn(),
            softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            // Mock any necessary methods or values from ConfigService
            get: jest.fn((key: string) => {
              if (key === 'SOME_ENV_VARIABLE') {
                return 'some_value';
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
  });

  it('should be defined', () => {
    expect(productService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array with 5 products if no args are passed', () => {
      expect(productService.findAll({})).toEqual(mockAllProductsLimit5);
    });

    it('should return an array with 1 Lenovo product if name is passed', () => {
      expect(productService.findAll({ name: 'Lenovo' })).toEqual([
        mockProductLenovoThinkPadX1,
      ]);
    });

    it('should return an array with 1 Headphones product if category is passed', () => {
      expect(productService.findAll({ category: 'Headphones' })).toEqual([
        mockProductCategoryHeadphones,
      ]);
    });

    it('should return an array with 1 product if max_price is passed', () => {
      expect(
        productService.findAll({ start_price: 1000, end_price: 2000 }),
      ).toEqual(mockProductsMinPrice1000MaxPrice2000);
    });
  });

  describe('deleteById', () => {
    it('should call softDelete with the given id', async () => {
      const id = '123';
      await productService.deleteById(id);
      expect(productRepository.softDelete).toHaveBeenCalledWith(id);
    });
  });

  describe('getProductStatistics', () => {
    it('should return the product statistics', async () => {
      const result = await productService.getProductStatistics();
      expect(result).toEqual(mockProductStatsQueryResult.countStats);
    });
  });

  describe('getCountProductsByDateRange', () => {
    it('should return the product count by date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const result = await productService.getCountProductsByDateRange(
        startDate,
        endDate,
      );
      expect(result).toEqual(
        mockProductStatsQueryResult.countProductsByDateRange,
      );
    });
  });

  describe('getCountProductsByCategory', () => {
    it('should return the product count by category', async () => {
      const result = await productService.getCountProductsByCategory();
      expect(result).toEqual(
        mockProductStatsQueryResult.countProductsByCategory,
      );
    });
  });

  describe('getStats', () => {
    it('should return the product statistics', async () => {
      const result = await productService.findStats();
      expect(result).toEqual(mockProductStats);
    });
  });
});
