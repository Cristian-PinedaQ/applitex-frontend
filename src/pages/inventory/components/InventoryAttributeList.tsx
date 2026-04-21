import { useState } from 'react';
import { Pencil, Trash2, Box, PlusCircle, Search } from 'lucide-react';
import { InventoryItemAttribute, InventoryItem } from '../../../types/inventory';

interface InventoryAttributeListProps {
  attributes: InventoryItemAttribute[];
  onEdit: (attr: InventoryItemAttribute) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export function InventoryAttributeList({ attributes, onEdit, onDelete, onAddNew }: InventoryAttributeListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Agrupar atributos por ítem
  const groupedAttributes = attributes.reduce((acc, attr) => {
    if (!acc[attr.itemName]) {
      acc[attr.itemName] = [];
    }
    acc[attr.itemName].push(attr);
    return acc;
  }, {} as Record<string, InventoryItemAttribute[]>);

  const filteredItems = Object.keys(groupedAttributes).filter(itemName => 
    itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search and Add Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar por ítem..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
          />
        </div>
        <button
          onClick={onAddNew}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-primary-100 transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          Nuevo Atributo
        </button>
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
            <Search className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No se encontraron atributos</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
            Asegúrate de que el nombre del ítem sea correcto o crea uno nuevo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map(itemName => (
            <div key={itemName} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100">
                  <Box className="w-4 h-4 text-primary-500" />
                </div>
                <h3 className="font-bold text-slate-800 truncate">{itemName}</h3>
                <span className="ml-auto bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {groupedAttributes[itemName].length}
                </span>
              </div>
              <div className="p-4 space-y-2">
                {groupedAttributes[itemName].map(attr => (
                  <div key={attr.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors group">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{attr.attributeKey}</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{attr.attributeValue}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onEdit(attr)}
                        className="p-2 hover:bg-white hover:text-primary-600 rounded-xl transition-all text-slate-400"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(attr.id)}
                        className="p-2 hover:bg-white hover:text-red-600 rounded-xl transition-all text-slate-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
