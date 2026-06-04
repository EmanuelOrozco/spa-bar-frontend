import { Product } from '@/types';

export function getUnavailableProducts(
  items: { productId: string; quantity: number }[],
  products: Product[]
): Product[] {
  const unavailable: Product[] = [];
  for (const item of items) {
    if (!item.productId) continue;
    const product = products.find((p) => p.id === item.productId);
    if (!product || product.stock < item.quantity) {
      if (product) unavailable.push(product);
    }
  }
  return unavailable;
}

export function formatUnavailableMessage(products: Product[]): string {
  if (!products.length) return 'Producto no disponible';
  const names = products.map((p) => p.name).join(', ');
  return `Producto no disponible: ${names}`;
}
