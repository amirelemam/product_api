import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from './product.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
  ],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
