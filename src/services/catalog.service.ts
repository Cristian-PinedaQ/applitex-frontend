import api from '../config/api';
import { Category, CategoryRequest, Product, ProductRequest, ProductAttribute, ProductAttributeRequest } from '../types/catalog';

export const catalogService = {
  // ─── Categorías ───
  getCategories: async (): Promise<Category[]> => {
    const res = await api.get<Category[]>('/categories');
    return res.data;
  },
  getCategoryById: async (id: string): Promise<Category> => {
    const res = await api.get<Category>(`/categories/${id}`);
    return res.data;
  },
  createCategory: async (data: CategoryRequest): Promise<Category> => {
    const res = await api.post<Category>('/categories', data);
    return res.data;
  },
  updateCategory: async (id: string, data: CategoryRequest): Promise<Category> => {
    const res = await api.put<Category>(`/categories/${id}`, data);
    return res.data;
  },
  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },

  // ─── Productos ───
  getProducts: async (): Promise<Product[]> => {
    const res = await api.get<Product[]>('/products');
    return res.data;
  },
  getProductsByCategory: async (categoryId: string): Promise<Product[]> => {
    const res = await api.get<Product[]>(`/categories/${categoryId}/products`);
    return res.data;
  },
  getProductById: async (id: string): Promise<Product> => {
    const res = await api.get<Product>(`/products/${id}`);
    return res.data;
  },
  createProduct: async (data: ProductRequest): Promise<Product> => {
    const res = await api.post<Product>('/products', data);
    return res.data;
  },
  updateProduct: async (id: string, data: ProductRequest): Promise<Product> => {
    const res = await api.put<Product>(`/products/${id}`, data);
    return res.data;
  },
  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  // ─── Atributos ───
  getAttributes: async (): Promise<ProductAttribute[]> => {
    const res = await api.get<ProductAttribute[]>('/attributes');
    return res.data;
  },
  getAttributesByProduct: async (productId: string): Promise<ProductAttribute[]> => {
    const res = await api.get<ProductAttribute[]>(`/products/${productId}/attributes`);
    return res.data;
  },
  createAttribute: async (productId: string, data: ProductAttributeRequest): Promise<ProductAttribute> => {
    const res = await api.post<ProductAttribute>(`/products/${productId}/attributes`, data);
    return res.data;
  },
  updateAttribute: async (id: string, data: ProductAttributeRequest): Promise<ProductAttribute> => {
    const res = await api.put<ProductAttribute>(`/attributes/${id}`, data);
    return res.data;
  },
  deleteAttribute: async (id: string): Promise<void> => {
    await api.delete(`/attributes/${id}`);
  },
};
