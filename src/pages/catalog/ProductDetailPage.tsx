import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Loader2,
  Save,
  Trash2,
  Tag,
  PackageOpen,
  DollarSign,
  Boxes,
  FolderOpen,
  Plus,
  X,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, ProductRequest, Category, ProductAttribute, ProductAttributeRequest } from '../../types/catalog';
import { catalogService } from '../../services/catalog.service';
import { useKeyboardVisible } from '../../hooks/useKeyboardVisible';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingAttrId, setDeletingAttrId] = useState<string | null>(null);

  // Edición de atributo inline
  const [editingAttr, setEditingAttr] = useState<{ id?: string; key: string; value: string } | null>(null);

  const isKeyboardVisible = useKeyboardVisible();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [editData, setEditData] = useState<ProductRequest>({
    categoryId: '',
    name: '',
    description: '',
    price: 0,
    quantity: 0,
  });

  // ─── Carga del producto ───
  const loadProduct = async (signal?: AbortSignal) => {
    if (isNew) return;
    setLoading(true);
    try {
      const [data, cats] = await Promise.all([
        catalogService.getProductById(id!, signal),
        catalogService.getCategories(signal),
      ]);
      const attrs = await catalogService.getAttributesByProduct(id!, signal);
      setProduct(data);
      setCategories(cats);
      setAttributes(attrs);
      setEditData({
        categoryId: data.categoryId,
        name: data.name,
        description: data.description ?? '',
        price: data.price,
        quantity: data.quantity,
      });
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      setError('No se pudo cargar la información del producto');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Carga de categorías para modo "nuevo"
  const loadCategories = async (signal?: AbortSignal) => {
    if (!isNew) return;
    try {
      const cats = await catalogService.getCategories(signal);
      setCategories(cats);
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    if (isNew) {
      loadCategories(controller.signal);
    } else {
      loadProduct(controller.signal);
    }
    return () => controller.abort();
  }, [id]);

  // ─── Guardar ───
  const handleSave = async () => {
    if (!editData.name || !editData.categoryId) {
      alert('Nombre y categoría son obligatorios.');
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        await catalogService.createProduct(editData);
        navigate('/catalog', { replace: true });
      } else {
        await catalogService.updateProduct(id!, editData);
        await loadProduct();
      }
    } catch {
      setError('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  // ─── Eliminar producto ───
  const handleDelete = async () => {
    if (isNew || !id) return;
    if (!confirm('¿Estás seguro de que deseas eliminar este producto permanentemente?')) return;
    try {
      await catalogService.deleteProduct(id);
      navigate('/catalog', { replace: true });
    } catch {
      setError('Error al eliminar el producto');
    }
  };

  // ─── Gestión de atributos ───
  const handleSaveAttr = async () => {
    if (!editingAttr || !editingAttr.key.trim()) return;
    try {
      const data: ProductAttributeRequest = {
        attributeKey: editingAttr.key,
        defaultValue: editingAttr.value,
      };
      if (editingAttr.id) {
        await catalogService.updateAttribute(editingAttr.id, data);
      } else {
        await catalogService.createAttribute(id!, data);
      }
      setEditingAttr(null);
      const updated = await catalogService.getAttributesByProduct(id!);
      setAttributes(updated);
    } catch {
      alert('Error al guardar el atributo');
    }
  };

  const handleDeleteAttr = async (attrId: string) => {
    if (!confirm('¿Eliminar este atributo?')) return;
    setDeletingAttrId(attrId);
    try {
      await catalogService.deleteAttribute(attrId);
      setAttributes((prev) => prev.filter((a) => a.id !== attrId));
    } catch {
      alert('Error al eliminar el atributo');
    } finally {
      setDeletingAttrId(null);
    }
  };

  // ─── Estados de renderizado ───
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cargando producto...</p>
      </div>
    );
  }

  if (error || (!product && !isNew)) {
    return (
      <div className="p-8 text-center bg-rose-50 rounded-[40px] border border-rose-100">
        <p className="text-rose-600 font-bold">{error || 'Producto no encontrado'}</p>
        <button onClick={() => navigate('/catalog')} className="mt-4 text-indigo-600 font-bold underline">
          Volver al catálogo
        </button>
      </div>
    );
  }

  const stockStatus =
    (editData.quantity ?? 0) > 10 ? { label: 'Stock Disponible', color: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-400' } :
    (editData.quantity ?? 0) > 0  ? { label: 'Stock Bajo', color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-400 animate-pulse' } :
    { label: 'Sin Stock', color: 'bg-rose-50 text-rose-700', dot: 'bg-rose-400' };
   
  void stockStatus; // used for display in other variants

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-8 pb-32 md:pb-10"
      >
        {/* ─── Cabecera de navegación ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 md:px-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/catalog')}
              className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:bg-slate-50 transition-all active:scale-90"
            >
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">
                {isNew ? 'Nuevo Producto' : editData.name || 'Sin nombre'}
              </h1>
              <p className="text-sm font-medium text-slate-400">
                {isNew ? 'Alta de producto al catálogo' : `Ficha de Producto / ID: ${product?.id.substring(0, 8)}`}
              </p>
            </div>
          </div>

          {/* Acciones desktop */}
          <div className="hidden md:flex items-center gap-3">
            {!isNew && (
              <button
                onClick={handleDelete}
                className="p-4 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-2xl transition-all"
                title="Eliminar Producto"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-3 btn-primary"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isNew ? 'Crear Producto' : 'Guardar Cambios'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ─── Columna principal ─── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Card: Información general */}
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600">
                  <PackageOpen className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Información del Producto</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Nombre */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    placeholder="Ej. Tela de algodón 100%"
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all font-bold text-slate-700 dark:text-white"
                  />
                </div>

                {/* Descripción */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    Descripción (Opcional)
                  </label>
                  <textarea
                    rows={3}
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    placeholder="Descripción del producto..."
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all font-medium text-slate-700 dark:text-white resize-none"
                  />
                </div>

                {/* Categoría */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    Categoría *
                  </label>
                  <div className="relative">
                    <FolderOpen className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select
                      value={editData.categoryId}
                      onChange={(e) => setEditData({ ...editData, categoryId: e.target.value })}
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all font-bold text-slate-700 dark:text-white appearance-none cursor-pointer"
                    >
                      <option value="">Seleccionar categoría...</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>
            </div>

            {/* Card: Precio e Inventario */}
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-600">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Precio Sugerido</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    Precio Unitario (COP) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">$</span>
                    <input
                      type="number"
                      min={0}
                      value={editData.price}
                      onChange={(e) => setEditData({ ...editData, price: Number(e.target.value) })}
                      className="w-full pl-10 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none transition-all font-bold text-slate-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    Cantidad
                  </label>
                  <div className="relative">
                    <Boxes className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="number"
                      min={0}
                      value={editData.quantity}
                      onChange={(e) => setEditData({ ...editData, quantity: Number(e.target.value) })}
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none transition-all font-bold text-slate-700 dark:text-white"
                    />
                  </div>
                </div>

                {!isNew && product && (
                  <div className="md:col-span-2 p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor Total en Stock</p>
                      <p className="text-3xl font-black text-slate-900 dark:text-white">
                        ${(editData.price * editData.quantity).toLocaleString('es-CO')}
                      </p>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl">
                      <DollarSign className="w-6 h-6 text-emerald-500" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card: Atributos (solo en modo edición) */}
            {!isNew && (
              <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-2xl text-purple-600">
                      <Tag className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Atributos</h3>
                  </div>
                  <button
                    onClick={() => setEditingAttr({ key: '', value: '' })}
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-xl font-black text-sm transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" /> Añadir
                  </button>
                </div>

                {/* Formulario de edición de atributo */}
                <AnimatePresence>
                  {editingAttr !== null && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 p-5 bg-purple-50 dark:bg-purple-900/10 border-2 border-purple-200 dark:border-purple-800 rounded-2xl space-y-4 overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-black text-purple-600 uppercase tracking-widest px-1 mb-1 block">Clave</label>
                          <input
                            autoFocus
                            type="text"
                            value={editingAttr.key}
                            onChange={(e) => setEditingAttr({ ...editingAttr, key: e.target.value })}
                            placeholder="ej. color, talla..."
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm font-bold text-slate-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-purple-600 uppercase tracking-widest px-1 mb-1 block">Valor</label>
                          <input
                            type="text"
                            value={editingAttr.value}
                            onChange={(e) => setEditingAttr({ ...editingAttr, value: e.target.value })}
                            placeholder="ej. rojo, XL..."
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm font-bold text-slate-700 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveAttr}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-black py-2.5 rounded-xl transition-all active:scale-95 text-sm"
                        >
                          Guardar Atributo
                        </button>
                        <button
                          onClick={() => setEditingAttr(null)}
                          className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 transition-all"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {attributes.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                    <p className="text-slate-400 font-bold text-sm">No hay atributos registrados</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {attributes.map((attr) => (
                      <div
                        key={attr.id}
                        className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl group"
                      >
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{attr.attributeKey}</span>
                          <span className="text-sm font-bold text-slate-800 dark:text-white">{attr.defaultValue}</span>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingAttr({ id: attr.id, key: attr.attributeKey, value: attr.defaultValue })}
                            className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAttr(attr.id)}
                            disabled={deletingAttrId === attr.id}
                            className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-all disabled:opacity-50"
                          >
                            {deletingAttrId === attr.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─── Sidebar ─── */}
          <div className="space-y-8">
            {/* Card: Categoría asignada */}
            {!isNew && (
              <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-4">
                  <FolderOpen className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-black text-slate-900 dark:text-white tracking-tight">Categoría</h4>
                </div>
                <div className="px-5 py-4 bg-indigo-50 dark:bg-indigo-950 rounded-2xl">
                  <p className="font-black text-indigo-700 dark:text-indigo-300 text-lg">
                    {product?.categoryName ?? categories.find(c => c.id === editData.categoryId)?.name ?? '—'}
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </motion.div>

      {/* ─── Sticky Bottom Bar (Mobile) ─── */}
      <AnimatePresence>
        {!isDesktop && !isKeyboardVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 pb-safe glass-dark dark:glass-dark border-t border-white/10 z-50 flex gap-3"
          >
            {!isNew && (
              <button
                onClick={handleDelete}
                className="p-4 bg-rose-500 text-white rounded-2xl shadow-lg active:scale-95 transition-all"
              >
                <Trash2 className="w-6 h-6" />
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-indigo-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 py-4"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isNew ? 'Crear Producto' : 'Guardar Cambios'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductDetailPage;
