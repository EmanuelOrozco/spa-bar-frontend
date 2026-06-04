'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/RouteGuards';
import { AppShell } from '@/components/layout/Sidebar';
import { PageHeader } from '@/components/layout/AuthLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { LoadingState, EmptyState } from '@/components/ui/Spinner';
import { DataTable, DataRow, DataCell } from '@/components/ui/DataTable';
import { useProducts, useProductMutations } from '@/hooks/useProducts';
import { useAuth } from '@/context/AuthContext';
import { CATEGORY_LABELS } from '@/lib/schemas';
import { Product, ProductCategory } from '@/types';
import { getApiErrorMessage } from '@/services/http';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

type StockFilter = 'all' | 'sufficient' | 'low' | 'critical';

function getStockLevel(stock: number, minStock: number): Exclude<StockFilter, 'all'> {
  if (stock <= 0) return 'critical';
  if (stock <= minStock) return 'low';
  return 'sufficient';
}

function stockBadge(stock: number, minStock: number) {
  if (stock <= 0) return <Badge variant="danger">Crítico</Badge>;
  if (stock <= minStock) return <Badge variant="warning">Bajo</Badge>;
  return <Badge variant="success">Suficiente</Badge>;
}

export default function InventarioPage() {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ProductCategory | ''>('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [newStock, setNewStock] = useState('');

  const { data, isLoading } = useProducts({
    page: 1,
    limit: 100,
    search: search || undefined,
    category: category || undefined,
    ...(!isAdmin && { isMenuItem: true }),
  });

  const filteredProducts =
    data?.data.filter((product) => {
      if (stockFilter === 'all') return true;
      return getStockLevel(product.stock, product.minStock) === stockFilter;
    }) ?? [];

  const toggleStockFilter = (filter: Exclude<StockFilter, 'all'>) => {
    setStockFilter((current) => (current === filter ? 'all' : filter));
  };

  const stockFilterButtons: {
    key: Exclude<StockFilter, 'all'>;
    label: string;
    activeClass: string;
  }[] = [
    {
      key: 'sufficient',
      label: 'Suficiente',
      activeClass: 'bg-success/20 text-success border-success/40',
    },
    {
      key: 'low',
      label: 'Bajo stock',
      activeClass: 'bg-warning/20 text-warning border-warning/40',
    },
    { key: 'critical', label: 'Crítico', activeClass: 'bg-danger/20 text-danger border-danger/40' },
  ];

  const { update } = useProductMutations();

  const categories = [
    { value: '', label: 'Todas las categorías' },
    ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
  ];

  const openAdjust = (product: Product) => {
    setAdjustProduct(product);
    setNewStock(String(product.stock));
  };

  const saveStock = async () => {
    if (!adjustProduct) return;
    try {
      await update.mutateAsync({
        id: adjustProduct.id,
        payload: { stock: parseInt(newStock, 10) },
      });
      toast.success('Stock actualizado');
      setAdjustProduct(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <PageHeader
          title="Control de Inventario"
          subtitle={
            isAdmin
              ? 'Gestión de stock en tiempo real (incluye productos ocultos en menú)'
              : 'Gestión de stock en tiempo real'
          }
        />

        <Card>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 flex-wrap gap-3">
              <div className="relative min-w-[250px] flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  placeholder="Buscar ingrediente, licor, código..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select
                options={categories}
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory | '')}
                className="w-auto min-w-[200px]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {stockFilterButtons.map(({ key, label, activeClass }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleStockFilter(key)}
                  className={cn(
                    'rounded-full border px-4 py-2 text-sm font-medium transition-all',
                    stockFilter === key ? activeClass : 'border-border text-muted hover:bg-white/5'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {isLoading && <LoadingState />}
          {!isLoading && filteredProducts.length === 0 && (
            <EmptyState
              title="Sin productos con este filtro"
              description="Prueba otro estado de stock o ajusta la búsqueda"
            />
          )}

          {!isLoading && filteredProducts.length > 0 && (
            <>
              <DataTable
                columns={[
                  { key: 'sku', label: 'Código' },
                  { key: 'producto', label: 'Producto' },
                  { key: 'cat', label: 'Categoría' },
                  { key: 'stock', label: 'Stock' },
                  { key: 'unit', label: 'Unidad' },
                  { key: 'min', label: 'Mín.' },
                  { key: 'estado', label: 'Estado' },
                  { key: 'accion', label: 'Acción' },
                ]}
              >
                {filteredProducts.map((product) => (
                  <DataRow key={product.id}>
                    <DataCell className="text-muted">{product.sku}</DataCell>
                    <DataCell className="font-medium">
                      <span className="flex items-center gap-2">
                        {product.name}
                        {isAdmin && !product.isMenuItem && (
                          <Badge variant="default" className="text-[10px]">
                            No en menú
                          </Badge>
                        )}
                      </span>
                    </DataCell>
                    <DataCell className="text-muted">{CATEGORY_LABELS[product.category]}</DataCell>
                    <DataCell
                      className={`font-bold ${
                        product.stock <= product.minStock ? 'text-brand-500' : 'text-foreground'
                      }`}
                    >
                      {product.stock}
                    </DataCell>
                    <DataCell>{product.unit}</DataCell>
                    <DataCell>{product.minStock}</DataCell>
                    <DataCell>{stockBadge(product.stock, product.minStock)}</DataCell>
                    <DataCell>
                      <Button
                        variant="outline"
                        className="px-3 py-1 text-xs"
                        onClick={() => openAdjust(product)}
                      >
                        Ajustar
                      </Button>
                    </DataCell>
                  </DataRow>
                ))}
              </DataTable>
              <p className="mt-4 text-xs text-muted">
                Mostrando {filteredProducts.length} de {data?.data.length ?? 0} productos
              </p>
            </>
          )}
        </Card>

        <Modal
          isOpen={Boolean(adjustProduct)}
          onClose={() => setAdjustProduct(null)}
          title={`Ajustar stock — ${adjustProduct?.name}`}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Stock actual: <strong className="text-white">{adjustProduct?.stock}</strong>{' '}
              {adjustProduct?.unit}
            </p>
            <Input
              label="Nuevo stock"
              type="number"
              min={0}
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
            />
            <Button className="w-full" onClick={saveStock} isLoading={update.isPending}>
              Guardar
            </Button>
          </div>
        </Modal>
      </AppShell>
    </ProtectedRoute>
  );
}
