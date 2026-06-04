'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/RouteGuards';
import { AppShell } from '@/components/layout/Sidebar';
import { PageHeader } from '@/components/layout/AuthLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoadingState, EmptyState } from '@/components/ui/Spinner';
import { ProductForm } from '@/components/products/ProductForm';
import { useProducts, useProductMutations } from '@/hooks/useProducts';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { ProductFormValues, CATEGORY_LABELS } from '@/lib/schemas';
import { Product, ProductCategory } from '@/types';
import { getApiErrorMessage } from '@/services/http';
import { productService } from '@/services/product.service';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { ProductImage } from '@/components/products/ProductImage';

function statusBadge(status: string) {
  if (status === 'ACTIVE') return <Badge variant="success">Activo</Badge>;
  if (status === 'LOW_STOCK') return <Badge variant="warning">Poco Stock</Badge>;
  return <Badge variant="danger">Inactivo</Badge>;
}

export default function MenuPage() {
  const { isAdmin } = useAuth();
  const [category, setCategory] = useState<ProductCategory | 'ALL'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const filters = {
    page: 1,
    limit: 50,
    ...(!isAdmin && { isMenuItem: true }),
    includeImage: true,
    ...(category !== 'ALL' && { category }),
  };

  const { data, isLoading } = useProducts(filters);
  const { create, update, remove } = useProductMutations();

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = async (product: Product) => {
    setLoadingEdit(true);
    try {
      const full = await productService.getById(product.id);
      setEditing(full);
      setModalOpen(true);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo cargar el producto'));
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleSubmit = async (values: ProductFormValues) => {
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, payload: values });
        toast.success('Producto actualizado');
      } else {
        await create.mutateAsync(values);
        toast.success('Producto creado');
      }
      setModalOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await remove.mutateAsync(id);
      toast.success('Producto eliminado');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const tabs: { key: ProductCategory | 'ALL'; label: string }[] = [
    { key: 'ALL', label: 'Todos' },
    ...Object.entries(CATEGORY_LABELS)
      .filter(([k]) => ['COCKTAILS', 'BEERS', 'APPETIZERS', 'MAINS'].includes(k))
      .map(([key, label]) => ({ key: key as ProductCategory, label })),
  ];

  return (
    <ProtectedRoute>
      <AppShell>
        <PageHeader
          title="Gestión del Menú"
          subtitle={
            isAdmin
              ? `${data?.meta.total ?? 0} productos (incluye ocultos en menú)`
              : `${data?.meta.total ?? 0} ítems en el menú`
          }
          action={
            isAdmin && (
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> Nuevo Plato/Bebida
              </Button>
            )
          }
        />

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setCategory(tab.key)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition-all ${
                category === tab.key
                  ? 'bg-brand-500 font-semibold text-black'
                  : 'border border-border text-muted hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading && <LoadingState />}
        {!isLoading && !data?.data.length && (
          <EmptyState
            title="Sin productos en el menú"
            action={<Button onClick={openCreate}>Crear producto</Button>}
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data?.data.map((product) => (
            <Card
              key={product.id}
              className={`flex flex-col ${isAdmin && !product.isMenuItem ? 'opacity-75 ring-1 ring-border/60' : ''}`}
            >
              <div className="relative mb-4 h-40 overflow-hidden rounded-xl bg-black/30">
                <ProductImage imageData={product.imageData} alt={product.name} />
                {isAdmin && !product.isMenuItem && (
                  <span className="absolute left-3 top-3 rounded-full border border-border bg-black/70 px-2.5 py-1 text-xs font-medium text-muted backdrop-blur">
                    No en menú
                  </span>
                )}
                {product.price > 0 && (
                  <span className="absolute right-3 top-3 rounded-full border border-border bg-black/60 px-3 py-1 text-sm font-bold text-brand-500 backdrop-blur">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="font-semibold text-white">{product.name}</h3>
                {statusBadge(product.status)}
              </div>
              <p className="mb-4 flex-1 text-xs text-muted line-clamp-2">
                {product.description ?? 'Sin descripción'}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Stock: {product.stock}</span>
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="px-3 py-1.5"
                      onClick={() => openEdit(product)}
                      disabled={loadingEdit}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="danger"
                      className="px-3 py-1.5"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}

          {isAdmin && (
            <button
              onClick={openCreate}
              className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white/[0.02] text-muted transition-colors hover:bg-white/5"
            >
              <Plus className="mb-2 h-10 w-10" />
              <span>Añadir Nuevo</span>
            </button>
          )}
        </div>

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editing ? 'Editar Producto' : 'Nuevo Producto'}
        >
          <ProductForm
            key={editing?.id ?? 'new'}
            defaultValues={editing ?? undefined}
            onSubmit={handleSubmit}
            onCancel={() => setModalOpen(false)}
            isLoading={create.isPending || update.isPending}
          />
        </Modal>
      </AppShell>
    </ProtectedRoute>
  );
}
