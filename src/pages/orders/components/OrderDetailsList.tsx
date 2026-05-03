import React from 'react';
import { Plus, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrderDetailItem } from './OrderDetailItem';
import { ServiceOrderDetailRequest } from '../../../types/orders';
import { Category, Product } from '../../../types/catalog';
import { InventoryItem } from '../../../types/inventory';

interface OrderDetailsListProps {
  details: ServiceOrderDetailRequest[];
  categories: Category[];
  products: Product[];
  inventoryItems: InventoryItem[];
  onAdd: () => void;
  onRemove: (clientId: string) => void;
  onChange: (clientId: string, field: keyof ServiceOrderDetailRequest, value: any) => void;
  onAttributeChange: (clientId: string, attrIndex: number, value: string) => void;
}

export const OrderDetailsList: React.FC<OrderDetailsListProps> = ({
  details, categories, products, inventoryItems, onAdd, onRemove, onChange, onAttributeChange
}) => {
  return (
    <div className="space-y-8 pb-32">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Ítems de la Orden</h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Define los productos y sus especificaciones para producción.</p>
        </div>
        <button
          onClick={onAdd}
          className="btn-primary"
        >
          <Plus className="w-5 h-5" />
          Añadir Producto
        </button>
      </div>
      {details.length === 0 ? (
        <div className="py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[40px] flex flex-col items-center justify-center text-slate-400 bg-slate-50/30 dark:bg-slate-900/30">
          <div className="p-6 bg-white dark:bg-slate-800 rounded-full mb-6 shadow-sm">
            <Package className="w-12 h-12 opacity-20" />
          </div>
          <p className="text-xl font-bold text-slate-700 dark:text-slate-300">No hay ítems en esta orden</p>
          <p className="text-sm mt-2 mb-8">Comienza agregando el primer producto de la producción.</p>
          <button
            onClick={onAdd}
            className="px-8 py-3 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-2xl font-black hover:bg-indigo-100 transition-all"
          >
            Añadir Producto
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {details.map((detail, index) => (
              <motion.div
                key={detail.clientId}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                layout
              >
                <OrderDetailItem
                  index={index}
                  detail={detail}
                  categories={categories}
                  products={products}
                  inventoryItems={inventoryItems}
                  onChange={onChange}
                  onAttributeChange={onAttributeChange}
                  onRemove={onRemove}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
