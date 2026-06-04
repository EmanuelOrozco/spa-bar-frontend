'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { processImageFile } from '@/lib/image';
import { Button } from '@/components/ui/Button';
import { ProductImage } from './ProductImage';

interface ImageUploadProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  error?: string;
  label?: string;
}

export function ImageUpload({
  value,
  onChange,
  error,
  label = 'Imagen del platillo',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setLocalError(null);
    setProcessing(true);
    try {
      const dataUrl = await processImageFile(file);
      onChange(dataUrl);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Error al procesar la imagen');
    } finally {
      setProcessing(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="overflow-hidden rounded-xl border border-border bg-black/20">
        <div className="relative h-44 w-full">
          <ProductImage imageData={value} alt="Vista previa" />
        </div>
        <div className="flex flex-wrap gap-2 border-t border-border p-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            className="text-sm"
            isLoading={processing}
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4" />
            {value ? 'Cambiar imagen' : 'Subir imagen'}
          </Button>
          {value && (
            <Button
              type="button"
              variant="danger"
              className="text-sm"
              onClick={() => onChange(null)}
            >
              <Trash2 className="h-4 w-4" />
              Quitar
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted">
        JPEG, PNG o WebP. Se optimiza y guarda en la base de datos.
      </p>
      {(error || localError) && <p className="text-xs text-red-400">{error ?? localError}</p>}
    </div>
  );
}
