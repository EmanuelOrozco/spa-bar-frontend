'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Product } from '@/types';
import { productSchema, ProductFormValues, CATEGORY_LABELS } from '@/lib/schemas';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from './ImageUpload';

interface ProductFormProps {
  defaultValues?: Partial<Product>;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProductForm({ defaultValues, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const [imageChanged, setImageChanged] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: defaultValues?.sku ?? '',
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      category: defaultValues?.category ?? 'COCKTAILS',
      price: defaultValues?.price ?? 0,
      stock: defaultValues?.stock ?? 0,
      minStock: defaultValues?.minStock ?? 0,
      unit: defaultValues?.unit ?? 'unidad',
      imageData: defaultValues?.imageData ?? null,
      isMenuItem: defaultValues?.isMenuItem ?? true,
    },
  });

  const categories = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

  const handleFormSubmit = async (values: ProductFormValues) => {
    if (defaultValues && !imageChanged) {
      const { imageData: _removed, ...rest } = values;
      await onSubmit(rest);
      return;
    }
    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Código"
        placeholder="Ej: CCK-001"
        error={errors.sku?.message}
        {...register('sku')}
      />
      <Input label="Nombre" error={errors.name?.message} {...register('name')} />
      <Input label="Descripción" error={errors.description?.message} {...register('description')} />

      <Controller
        name="imageData"
        control={control}
        render={({ field }) => (
          <ImageUpload
            value={field.value}
            onChange={(value) => {
              setImageChanged(true);
              field.onChange(value);
            }}
            error={errors.imageData?.message}
          />
        )}
      />

      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <Select
            label="Categoría"
            options={categories}
            error={errors.category?.message}
            {...field}
          />
        )}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Precio"
          type="number"
          step="0.01"
          error={errors.price?.message}
          {...register('price')}
        />
        <Input label="Stock" type="number" error={errors.stock?.message} {...register('stock')} />
        <Input
          label="Stock mínimo"
          type="number"
          error={errors.minStock?.message}
          {...register('minStock')}
        />
      </div>
      <Input label="Unidad" error={errors.unit?.message} {...register('unit')} />
      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" {...register('isMenuItem')} className="rounded" />
        Mostrar en menú
      </label>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Guardar
        </Button>
      </div>
    </form>
  );
}
