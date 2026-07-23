'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Factura {
  id: string;
  nombre: string;
  valor: number;
  pagado: boolean;
  fechaVencimiento: string | null;
}

export default function DashboardPage() {
  const { usuario, token, loading, logout } = useAuth();
  const router = useRouter();

  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loadingFacturas, setLoadingFacturas] = useState(true);

  useEffect(() => {
    if (!loading && !token) {
      router.push('/login');
    }
  }, [loading, token, router]);

  useEffect(() => {
    if (!token) return;

    api
      .get<Factura[]>('/facturas', token)
      .then(setFacturas)
      .finally(() => setLoadingFacturas(false));
  }, [token]);

  if (loading || !token) {
    return null;
  }

  return (
    <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
  <div>
    <h1 className="text-2xl font-semibold text-neutral-900">Mis facturas</h1>
    <p className="text-sm text-neutral-600">Hola, {usuario?.nombre}</p>
  </div>
  <div className="flex items-center gap-4">
    <Link
      href="/facturas/nueva"
      className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
    >
      + Nueva factura
    </Link>
    <button
      onClick={logout}
      className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
    >
      Cerrar sesión
    </button>
  </div>
</div>

      {loadingFacturas ? (
        <p className="text-neutral-600">Cargando...</p>
      ) : facturas.length === 0 ? (
        <p className="text-neutral-600">Aún no tienes facturas registradas.</p>
      ) : (
        <ul className="space-y-3">
          {facturas.map((factura) => (
            <li
              key={factura.id}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3"
            >
              <div>
                <p className="font-medium text-neutral-900">{factura.nombre}</p>
                <p className="text-sm text-neutral-600">
                  Vence: {factura.fechaVencimiento ?? 'sin definir'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-neutral-900">
                  ${factura.valor.toFixed(2)}
                </p>
                <span
                  className={`text-xs font-medium ${
                    factura.pagado ? 'text-green-600' : 'text-amber-600'
                  }`}
                >
                  {factura.pagado ? 'Pagada' : 'Pendiente'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}