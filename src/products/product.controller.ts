import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  health(
    @Query('name') name,
    @Query('category') category,
    @Query('min_price') minPrice,
    @Query('max_price') maxPrice,
  ) {
    return this.productService.findAll(name, category, minPrice, maxPrice);
  }

  @Delete(':id')
  deleteById(@Param('id') id: string) {
    return this.productService.deleteById(id);
  }
}
