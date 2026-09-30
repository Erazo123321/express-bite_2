import { Product } from '../../domain/entities/Product.ts';
import { Money } from '../../domain/value-objects/Money.ts';

export const INITIAL_PRODUCTS_DATA: Array<{
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: 'coffee' | 'bakery' | 'beverage' | 'sandwich' | 'snack';
  badge?: string;
  badgeType?: 'popular' | 'fresh' | 'natural' | 'gourmet';
}> = [
  {
    id: 'prod-cafe-artesanal',
    name: 'Café Artesanal',
    description: 'Cappuccino doble shot',
    price: 2400,
    stock: 24,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCndNRZegd9UEuut_8NcvTCsM_HBZl4NBv9DFBeiKJjfOQCUrFNgihE6CUg9E7c1W9Y9-RhFLzNSuxNw4GpKgnrAQelTxoYJkNWJ5qzZUYmtNF2xLbS_2b0gQJW4AErIEJqnMiOmQnJjfpMjgBcufLUXaRu77BC5K6hefAqwIkAarlhzOY4RVLQxgYBY7swCwy-usP6u0No1bOgRdWVwi0vPebKE2jWU0C2oQrm_ESWuDGoCVlRnAOjdg',
    category: 'coffee',
    badge: 'Popular',
    badgeType: 'popular',
  },
  {
    id: 'prod-empanada-rellena',
    name: 'Empanada Rellena',
    description: 'Carne suave artesanal',
    price: 2800,
    stock: 8,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDgB_8VkS2Crlo-Q1uFs33uTfSvwi2NClktZyORy8ZE26nYaZaeAby7V9Z9FqPzeHGXW3rK1RP_oHcJAyE2xzfZkjQ6Ra6QttMnvRXqDaCMrTYFQCtFiO1fwwg3sSgQYp7QmdBZEgsqxL7KQnvAaazzXjeH3iQYKb2V8Bxh7dyDBBCVwl_eamKNZIhHvr83gc5vpi_penERT0y_ZQLiOV_8-7-xzYU6zezLRv69BuoIuyuISsMxVwF9AA',
    category: 'bakery',
    badge: 'Recién horneada',
    badgeType: 'fresh',
  },
  {
    id: 'prod-jugo-natural',
    name: 'Jugo Natural',
    description: 'Naranja recién exprimida',
    price: 2100,
    stock: 0, // Demonstrates out-of-stock tag in the UI mockup!
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCCpP3y-UiWUrBCkfLBkGEnlfsKG0fjY-aDt1duO9TDMmi-XqVY6bLUXErnA2k9Hm42VF0H5H-iCMUVq1gsbnFT74S_WmYWoeSeI-Zt9McQu_pu3VmLhTjTCgOUTqIJQ7XQWuYkjCxSF0-lHh-4qIrjKUL6yIXgqaXCzucDpIQ3iXdphjurG98y5NFLqxQGIcj_idVruFUmAkMpPZM7DivEe7XDD9sidTJ8T73fOIBpoJhGbjb7Pg9PJQ',
    category: 'beverage',
    badge: 'Natural',
    badgeType: 'natural',
  },
  {
    id: 'prod-sandwich-gourmet',
    name: 'Sándwich Gourmet',
    description: 'Ciabatta, pavo & rúcula',
    price: 3900,
    stock: 15,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDFXZaQamE7AMzOoINv4OXe8h2hsFi_wmYY1igToUJx8nFUcYV8pG9sWJdWQ-PvJDfZFQfikcblZOWlEBgZ15ocJAUhVo4xu4__XYKzAaT95RNVi9-gDWSDbu72_WSv9Sr_o5XH4H36eHU85WMrBnTzd5X--ZfDLL_0N4If3c4Rzo_jdZS2RT_0sh4Anai9E93YkCI_L425Gii_PBuHs5GRj1akD6lDLpAuma9s-dOXFeTPSvr6lVNl8w',
    category: 'sandwich',
    badge: 'Gourmet',
    badgeType: 'gourmet',
  },
];

export function createInitialProducts(): Product[] {
  return INITIAL_PRODUCTS_DATA.map(
    item =>
      new Product({
        id: item.id,
        name: item.name,
        description: item.description,
        price: Money.fromNumber(item.price),
        stock: item.stock,
        imageUrl: item.imageUrl,
        category: item.category,
        badge: item.badge,
        badgeType: item.badgeType,
      })
  );
}
