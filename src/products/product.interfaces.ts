export enum Currency {
  USD = 'USD',
}

export interface IProduct {
  id?: string;
  sku: string;
  name: string;
  model: string;
  category: string;
  color: string;
  price: number;
  currency: Currency;
  stock: number;
}

export interface IProductFilter {
  name?: string;
  category?: string;
  start_price?: number;
  end_price?: number;
}
