import React, { useState } from 'react';
import { Plus, Coffee, Sparkles } from 'lucide-react';
import { ProductDTO } from '../../../core/application/dtos/ProductDTO.ts';

interface ProductCardProps {
  product: ProductDTO;
  onOrder: (product: ProductDTO) => Promise<void>;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOrder }) => {
  const [isOrdering, setIsOrdering] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleOrderClick = async () => {
    if (product.isOutOfStock || isOrdering) return;
    try {
      setIsOrdering(true);
      await onOrder(product);
    } finally {
      setIsOrdering(false);
    }
  };

  const getBadgeStyle = () => {
    switch (product.badgeType) {
      case 'popular':
        return 'bg-white/95 text-gray-900 border border-gray-100 shadow-xs';
      case 'fresh':
        return 'bg-emerald-600 text-white shadow-xs';
      case 'natural':
        return 'bg-amber-500 text-white shadow-xs';
      case 'gourmet':
        return 'bg-gray-900 text-white shadow-xs';
      default:
        return 'bg-gray-800 text-white';
    }
  };

  return (
    <div className="group bg-white rounded-[12px] p-2.5 border border-gray-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      {/* Product Image with Fallback Container */}
      <div className="relative w-full aspect-square rounded-[10px] overflow-hidden bg-gray-100 mb-2">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-200/60 animate-pulse flex items-center justify-center">
            <Coffee className="w-5 h-5 text-gray-400" />
          </div>
        )}

        {!imageError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } ${product.isOutOfStock ? 'grayscale opacity-60' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-500 p-2 text-center">
            <Coffee className="w-6 h-6 mb-1 text-emerald-600" />
            <span className="text-[10px] font-semibold">{product.name}</span>
          </div>
        )}

        {/* Badge */}
        {product.badge && (
          <span
            className={`absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded-[6px] backdrop-blur-xs flex items-center gap-1 ${getBadgeStyle()}`}
          >
            {product.badgeType === 'popular' && <Sparkles className="w-2.5 h-2.5 text-amber-500 inline" />}
            {product.badge}
          </span>
        )}

        {product.isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1">
        <h3 className="font-bold text-gray-900 text-xs sm:text-sm leading-snug line-clamp-1">
          {product.name}
        </h3>
        <p className="text-[11px] text-gray-400 mb-2 line-clamp-1">{product.description}</p>
      </div>

      {/* Price & Action */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100 mt-auto">
        <span className="text-xs sm:text-sm font-extrabold text-gray-900 tabular-nums">
          {product.formattedPrice}
        </span>

        {product.isOutOfStock ? (
          <span className="text-[11px] font-semibold text-gray-400 px-2 py-1">
            Sin stock
          </span>
        ) : (
          <button
            onClick={handleOrderClick}
            disabled={isOrdering}
            aria-label={`Pedir ${product.name}`}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold px-2.5 py-1.5 rounded-[8px] transition-all flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <span>{isOrdering ? '...' : 'Pedir'}</span>
            <Plus className="w-3 h-3" strokeWidth={3} />
          </button>
        )}
      </div>
    </div>
  );
};
