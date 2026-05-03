import api from '../config/api';
import { Category, CategoryRequest, Product, ProductRequest, ProductAttribute, ProductAttributeRequest } from '../types/catalog';

export const catalogService = {
  // ─── Categorías ───
  getCategories: async (signal?: AbortSignal): Promise<Category[]> => {
    const res = await api.get<Category[]>('categories', { signal });
    return res.data;
  },
  getCategoryById: async (id: string, signal?: AbortSignal): Promise<Category> => {
    const res = await api.get<Category>(`categories/${id}`, { signal });
    return res.data;
  },
  createCategory: async (data: CategoryRequest): Promise<Category> => {
    const res = await api.post<Category>('categories', data);
    return res.data;
  },
  updateCategory: async (id: string, data: CategoryRequest): Promise<Category> => {
    const res = await api.put<Category>(`categories/${id}`, data);
    return res.data;
  },
  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`categories/${id}`);
  },

  // ─── Productos ───
  getProducts: async (signal?: AbortSignal): Promise<Product[]> => {
    const res = await api.get<Product[]>('products', { signal });
    return res.data;
  },
  getProductsByCategory: async (categoryId: string, signal?: AbortSignal): Promise<Product[]> => {
    const res = await api.get<Product[]>(`categories/${categoryId}/products`, { signal });
    return res.data;
  },
  getProductById: async (id: string, signal?: AbortSignal): Promise<Product> => {
    const res = await api.get<Product>(`products/${id}`, { signal });
    return res.data;
  },
  searchProducts: async (query: string, signal?: AbortSignal): Promise<Product[]> => {
    const res = await api.get<Product[]>('products/search', { 
      params: { q: query },
      signal 
    });
    return res.data;
  },
  createProduct: async (data: ProductRequest): Promise<Product> => {
    const res = await api.post<Product>('products', data);
    return res.data;
  },
  updateProduct: async (id: string, data: ProductRequest): Promise<Product> => {
    const res = await api.put<Product>(`products/${id}`, data);
    return res.data;
  },
  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`products/${id}`);
  },

  // ─── Atributos ───
  getAttributes: async (signal?: AbortSignal): Promise<ProductAttribute[]> => {
    const res = await api.get<ProductAttribute[]>('attributes', { signal });
    return res.data;
  },
  getAttributesByProduct: async (productId: string, signal?: AbortSignal): Promise<ProductAttribute[]> => {
    const res = await api.get<ProductAttribute[]>(`products/${productId}/attributes`, { signal });
    return res.data;
  },
  createAttribute: async (productId: string, data: ProductAttributeRequest): Promise<ProductAttribute> => {
    const res = await api.post<ProductAttribute>(`products/${productId}/attributes`, data);
    return res.data;
  },
  updateAttribute: async (id: string, data: ProductAttributeRequest): Promise<ProductAttribute> => {
    const res = await api.put<ProductAttribute>(`attributes/${id}`, data);
    return res.data;
  },
  deleteAttribute: async (id: string): Promise<void> => {
    await api.delete(`attributes/${id}`);
  },
};
