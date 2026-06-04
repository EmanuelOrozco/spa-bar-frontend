'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tableSchema, TableFormValues } from '@/lib/schemas';
import { DEFAULT_TABLE_ZONES } from '@/lib/constants';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

const CUSTOM_ZONE = '__custom__';

interface TableFormProps {
  existingLocations?: string[];
  defaultLocation?: string;
  onSubmit: (values: TableFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TableForm({
  existingLocations = [],
  defaultLocation,
  onSubmit,
  onCancel,
  isLoading,
}: TableFormProps) {
  const zones = useMemo(
    () =>
      Array.from(new Set([...DEFAULT_TABLE_ZONES, ...existingLocations.filter(Boolean)])).sort(),
    [existingLocations]
  );

  const initialLocation = defaultLocation ?? zones[0] ?? DEFAULT_TABLE_ZONES[0];
  const startsCustom = Boolean(defaultLocation && !zones.includes(defaultLocation));

  const [customZone, setCustomZone] = useState(startsCustom);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TableFormValues>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      number: '',
      name: '',
      capacity: 4,
      location: startsCustom ? (defaultLocation ?? '') : initialLocation,
    },
  });

  const location = watch('location');

  const zoneOptions = [
    ...zones.map((zone) => ({ value: zone, label: zone })),
    { value: CUSTOM_ZONE, label: 'Nueva zona...' },
  ];

  const handleZoneSelect = (value: string) => {
    if (value === CUSTOM_ZONE) {
      setCustomZone(true);
      setValue('location', '', { shouldValidate: true });
      return;
    }
    setCustomZone(false);
    setValue('location', value, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Número de mesa"
          placeholder="Ej: 12, B3"
          error={errors.number?.message}
          {...register('number')}
        />
        <Input
          label="Capacidad (personas)"
          type="number"
          min={1}
          error={errors.capacity?.message}
          {...register('capacity')}
        />
      </div>
      <Input
        label="Nombre visible"
        placeholder="Ej: Mesa 12"
        error={errors.name?.message}
        {...register('name')}
      />

      {!customZone ? (
        <>
          <Select
            label="Zona del local"
            options={zoneOptions}
            value={zones.includes(location) ? location : initialLocation}
            onChange={(e) => handleZoneSelect(e.target.value)}
          />
          <input type="hidden" {...register('location')} />
        </>
      ) : (
        <div className="space-y-2">
          <Input
            label="Nombre de la nueva zona"
            placeholder="Ej: Patio, VIP, Segundo piso"
            error={errors.location?.message}
            {...register('location')}
          />
          <button
            type="button"
            className="text-xs text-brand-500 hover:underline"
            onClick={() => {
              setCustomZone(false);
              setValue('location', zones[0] ?? DEFAULT_TABLE_ZONES[0], { shouldValidate: true });
            }}
          >
            Elegir una zona existente
          </button>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Crear mesa
        </Button>
      </div>
    </form>
  );
}
