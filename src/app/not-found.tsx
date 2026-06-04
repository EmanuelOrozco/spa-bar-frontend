import Link from 'next/link';
import Image from 'next/image';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <Image
        src="/logo-spa-bar.png"
        alt="Gestor Bar"
        width={80}
        height={80}
        className="rounded-xl opacity-50"
      />
      <div>
        <h1 className="text-6xl font-bold text-brand-500">404</h1>
        <p className="mt-2 text-lg text-muted">Página no encontrada</p>
      </div>
      <Link
        href="/dashboard"
        className="rounded-lg bg-brand-500 px-6 py-3 font-semibold text-black transition-all hover:brightness-110"
      >
        Volver al Dashboard
      </Link>
    </div>
  );
}
