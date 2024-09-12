import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Product, ProductStats } from './product.entity';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'Get products' })
  @ApiResponse({
    status: 200,
    description: 'List of up to 5 products.',
    type: [Product],
  })
  getAll(
    @Query('name') name,
    @Query('category') category,
    @Query('min_price') start_price,
    @Query('max_price') end_price,
  ) {
    return this.productService.findAll({
      name,
      category,
      start_price,
      end_price,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get products statistics' })
  @ApiResponse({
    status: 200,
    description: 'List some stats',
    type: ProductStats,
  })
  @UseGuards(JwtAuthGuard)
  getStats() {
    return this.productService.findStats();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product by id' })
  @ApiResponse({ status: 204, description: 'No content response' })
  deleteById(@Param('id') id: string) {
    return this.productService.deleteById(id);
  }
}
