export interface ProductAttribute {
  id: string;
  productId: string;
  productName: string;
  attributeKey: string;
  defaultValue: string;
}

export interface ProductAttributeRequest {
  attributeKey: string;
  defaultValue: string;
}

export interface Product {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  totalValue: number;
  attributes: ProductAttribute[];
}

export interface ProductRequest {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  products: Product[];
}

export interface CategoryRequest {
  name: string;
  description?: string;
}
