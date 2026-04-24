import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, DollarSign, Calculator, Layers, ClipboardList } from 'lucide-react';
import { ServiceOrderDetailRequest } from '../../../types/orders';
import { Category, Product } from '../../../types/catalog';
import { InventoryItem } from '../../../types/inventory';

interface OrderDetailItemProps {
  index: number;
  detail: ServiceOrderDetailRequest;
  categories: Category[];
  products: Product[];
  inventoryItems: InventoryItem[];
  onChange: (clientId: string, field: keyof ServiceOrderDetailRequest, value: any) => void;
  onAttributeChange: (clientId: string, attrIndex: number, value: string) => void;
  onRemove: (clientId: string) => void;
}

export const OrderDetailItem: React.FC<OrderDetailItemProps> = ({
  index, detail, categories, products, inventoryItems, onChange, onAttributeChange, onRemove
}) => {
  return (
    <div className="p-8 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-[32px] shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-8">
        <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-900 dark:bg-slate-700 text-sm font-black text-white">
          {index + 1}
        </span>
        <button
          type="button"
          onClick={() => onRemove(detail.clientId!)}
          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all active:scale-95"
        >
          <Trash2 className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Category */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Categoría</label>
          <select
            required
            className="w-full px-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-900 dark:text-white"
            value={detail.categoryId}
            onChange={(e) => onChange(detail.clientId!, 'categoryId', e.target.value)}
          >
            <option value="">Seleccionar...</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Product */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Producto</label>
          <select
            required
            className="w-full px-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-900 dark:text-white disabled:opacity-50"
            value={detail.productId}
            onChange={(e) => onChange(detail.clientId!, 'productId', e.target.value)}
            disabled={!detail.categoryId}
          >
            <option value="">Seleccionar...</option>
            {products.filter(p => p.categoryId === detail.categoryId).map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Precio Unit.</label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="number"
              step="0.01"
              required
              className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-900 dark:text-white"
              value={detail.price}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                onChange(detail.clientId!, 'price', val);
              }}
            />
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Cantidad</label>
          <div className="relative">
            <Calculator className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="number"
              step="0.01"
              required
              className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-900 dark:text-white"
              value={detail.quantity}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                onChange(detail.clientId!, 'quantity', val);
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10 pt-10 border-t border-slate-100 dark:border-slate-800">
        <div className="bg-amber-50/50 dark:bg-amber-900/10 p-6 rounded-[28px] border border-amber-100/50 dark:border-amber-900/20">
          <label className="text-xs font-black text-amber-800 dark:text-amber-400 mb-4 block flex items-center gap-2 uppercase tracking-widest">
            <Calculator className="w-4 h-4" /> Descontar de Inventario
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select
              className="px-4 py-3 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/30 rounded-2xl text-sm font-bold text-slate-900 dark:text-white"
              value={detail.inventoryItemId || ''}
              onChange={(e) => onChange(detail.clientId!, 'inventoryItemId', e.target.value || undefined)}
            >
              <option value="">No descontar...</option>
              {inventoryItems.map(item => (
                <option key={item.id} value={item.id}>{item.name} ({item.finalQuantity} disp.)</option>
              ))}
            </select>
            {detail.inventoryItemId && (
              <input
                type="number"
                placeholder="Cant. a usar"
                className="px-4 py-3 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/30 rounded-2xl text-sm font-bold text-slate-900 dark:text-white"
                value={detail.usedInventoryQuantity || ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  onChange(detail.clientId!, 'usedInventoryQuantity', val);
                }}
              />
            )}
          </div>
        </div>

        <div className="bg-indigo-50/30 dark:bg-indigo-900/10 p-6 rounded-[28px] border border-indigo-100/50 dark:border-indigo-900/20">
          <label className="text-xs font-black text-indigo-800 dark:text-indigo-400 mb-4 block flex items-center gap-2 uppercase tracking-widest">
            <ClipboardList className="w-4 h-4" /> Ficha Técnica
          </label>
          {detail.attributes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {detail.attributes.map((attr, attrIndex) => (
                <div key={attrIndex}>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1.5 block ml-1">{attr.attributeKey}</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/30 rounded-xl text-sm font-bold text-slate-900 dark:text-white"
                    value={attr.attributeValue}
                    onChange={(e) => onAttributeChange(detail.clientId!, attrIndex, e.target.value)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 flex items-center justify-center border border-dashed border-indigo-200 dark:border-indigo-900/30 rounded-2xl">
              <p className="text-xs text-slate-400 font-medium italic">Seleccione un producto para ver atributos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
