import { Product } from '../../domain/entities/Product.ts';

export interface ProductDTO {
  id: string;
  name: string;
  description: string;
  price: number;
  formattedPrice: string;
  stock: number;
  imageUrl: string;
  category: string;
  badge?: string;
  badgeType?: 'popular' | 'fresh' | 'natural' | 'gourmet';
  isAvailable: boolean;
  isOutOfStock: boolean;
  isLowStock: boolean;
}

export class ProductDTOMapper {
  static toDTO(product: Product): ProductDTO {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.amount,
      formattedPrice: product.price.format(),
      stock: product.stock,
      imageUrl: product.imageUrl,
      category: product.category,
      badge: product.badge,
      badgeType: product.badgeType,
      isAvailable: product.isAvailable,
      isOutOfStock: product.isOutOfStock(),
      isLowStock: product.isLowStock(),
    };
  }
}
