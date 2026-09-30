import React, { useState } from 'react';
import { Package, Pencil, AlertCircle, RefreshCw, Check, X } from 'lucide-react';
import { ProductDTO } from '../../../core/application/dtos/ProductDTO.ts';

interface InventoryTableProps {
  products: ProductDTO[];
  onUpdateStock: (productId: string, newStock: number) => Promise<unknown>;
  onResetMockData: () => Promise<unknown>;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  products,
  onUpdateStock,
  onResetMockData,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const startEditing = (product: ProductDTO) => {
    setEditingId(product.id);
    setEditingValue(product.stock.toString());
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingValue('');
  };

  const handleSaveStock = async (productId: string) => {
    const val = parseInt(editingValue, 10);
    if (isNaN(val) || val < 0) {
      alert('Por favor introduce un número entero no negativo para el stock.');
      return;
    }

    try {
      setIsUpdating(true);
      await onUpdateStock(productId, val);
      setEditingId(null);
    } catch (e: any) {
      alert(e?.message || 'Error al actualizar');
    } finally {
      setIsUpdating(false);
    }
  };

  const outOfStockProducts = products.filter(p => p.isOutOfStock);
  const lowStockProducts = products.filter(p => p.isLowStock && !p.isOutOfStock);

  return (
    <div className="bg-white rounded-[12px] border border-gray-200/80 shadow-xs p-5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[8px] bg-gray-100 text-gray-700 flex items-center justify-center">
            <Package className="w-4 h-4 text-gray-700" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Gestión de Inventario</h3>
            <p className="text-xs text-gray-400">3 columnas: Producto, Stock Actual y Acción</p>
          </div>
        </div>
        <button
          onClick={onResetMockData}
          className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Restablecer</span>
        </button>
      </div>

      {/* Inventory Table: 3 Columns (Producto, Stock Actual, Acción) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
              <th className="py-2.5 px-3">Producto</th>
              <th className="py-2.5 px-3 text-center">Stock Actual</th>
              <th className="py-2.5 px-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(product => {
              const isEditing = editingId === product.id;

              return (
                <tr
                  key={product.id}
                  className={`hover:bg-gray-50/60 transition-colors ${
                    product.isOutOfStock ? 'bg-red-50/20' : ''
                  }`}
                >
                  {/* Col 1: Producto */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-[8px] object-cover shrink-0 border border-gray-200/60"
                      />
                      <div>
                        <div className="font-bold text-gray-900 leading-tight">{product.name}</div>
                        <div className="text-[11px] text-gray-400 tabular-nums">
                          {product.formattedPrice}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Col 2: Stock Actual */}
                  <td className="py-3 px-3 text-center">
                    {isEditing ? (
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min="0"
                          value={editingValue}
                          onChange={e => setEditingValue(e.target.value)}
                          className="w-16 px-1.5 py-1 text-center font-bold border border-emerald-500 rounded text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveStock(product.id);
                            if (e.key === 'Escape') cancelEditing();
                          }}
                        />
                      </div>
                    ) : product.isOutOfStock ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="font-bold text-red-600 text-sm">0</span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-[6px] text-[10px] font-extrabold bg-red-100 text-red-600 border border-red-200">
                          Agotado
                        </span>
                      </div>
                    ) : (
                      <span className="font-semibold text-gray-800 text-sm tabular-nums">
                        {product.stock} un.
                      </span>
                    )}
                  </td>

                  {/* Col 3: Acción */}
                  <td className="py-3 px-3 text-right">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleSaveStock(product.id)}
                          disabled={isUpdating}
                          aria-label="Confirmar cambio de stock"
                          className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          aria-label="Cancelar"
                          className="p-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(product)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[8px] border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-2xs hover:border-gray-300 transition cursor-pointer"
                      >
                        <Pencil className="w-3 h-3 text-gray-500" />
                        <span>Editar</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Quick Stock Alert Notification Banner */}
      {outOfStockProducts.length > 0 || lowStockProducts.length > 0 ? (
        <div className="mt-4 p-3 bg-amber-50/70 rounded-[10px] border border-amber-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900">
          <span className="flex items-center gap-1.5 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            {outOfStockProducts.length > 0
              ? `${outOfStockProducts[0].name} requiere reposición inmediata.`
              : `${lowStockProducts[0].name} tiene stock bajo.`}
          </span>
          <button
            onClick={() => {
              const target = outOfStockProducts[0] || lowStockProducts[0];
              if (target) {
                onUpdateStock(target.id, 20);
              }
            }}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-white px-2.5 py-1 rounded-md border border-amber-200 shadow-2xs cursor-pointer text-center"
          >
            + Reabastecer {outOfStockProducts[0]?.name || 'Producto'} (20 un.)
          </button>
        </div>
      ) : (
        <div className="mt-4 p-2.5 bg-emerald-50/60 rounded-[10px] border border-emerald-100 flex items-center justify-between text-xs text-emerald-800">
          <span>Todos los productos cuentan con inventario óptimo.</span>
        </div>
      )}
    </div>
  );
};
