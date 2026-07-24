'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { api, ApiError } from '@/lib/api';

interface MetodoDePago {
  id: string;
  nombre: string;
  tipo: string;
}

interface CuentaDePago {
  id: string;
  alias: string;
  datos: string;
  metodoPagoId: string;
}

export default function CuentasDePagoPage() {
  const { token, loading } = useAuth();
  const router = useRouter();

  const [cuentas, setCuentas] = useState<CuentaDePago[]>([]);
  const [metodos, setMetodos] = useState<MetodoDePago[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [metodoPagoId, setMetodoPagoId] = useState('');
  const [alias, setAlias] = useState('');
  const [datos, setDatos] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !token) {
      router.push('/login');
    }
  }, [loading, token, router]);

  useEffect(() => {
    if (!token) return;

    Promise.all([
      api.get<CuentaDePago[]>('/cuentas-de-pago', token),
      api.get<MetodoDePago[]>('/metodos-de-pago', token),
    ])
      .then(([cuentasData, metodosData]) => {
        setCuentas(cuentasData);
        setMetodos(metodosData);
        if (metodosData.length > 0) {
          setMetodoPagoId(metodosData[0].id);
        }
      })
      .finally(() => setLoadingData(false));
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const nueva = await api.post<CuentaDePago>(
        '/cuentas-de-pago',
        { metodoPagoId, alias, datos },
        token,
      );
      setCuentas((prev) => [...prev, nueva]);
      setAlias('');
      setDatos('');
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Error al crear la cuenta de pago',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !token) {
    return null;
  }

  return (
    <main className="flex-1 px-4 py-8 max-w-md mx-auto w-full">
      <h1 className="text-2xl font-semibold text-neutral-900 mb-6">
        Mis cuentas de pago
      </h1>

      {loadingData ? (
        <p className="text-neutral-600">Cargando...</p>
      ) : (
        <>
          {cuentas.length === 0 ? (
            <p className="text-neutral-600 mb-6">Aún no tienes cuentas de pago.</p>
          ) : (
            <ul className="space-y-3 mb-8">
              {cuentas.map((cuenta) => (
                <li
                  key={cuenta.id}
                  className="rounded-lg border border-neutral-200 bg-white px-4 py-3"
                >
                  <p className="font-medium text-neutral-900">{cuenta.alias}</p>
                  <p className="text-sm text-neutral-600">{cuenta.datos}</p>
                </li>
              ))}
            </ul>
          )}

          {metodos.length === 0 ? (
            <p className="text-sm text-amber-600">
              No hay métodos de pago disponibles todavía. Deben crearse primero
              (por ahora, vía la API directamente).
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-medium text-neutral-900">
                Agregar cuenta de pago
              </h2>

              <div>
                <label htmlFor="metodoPagoId" className="block text-sm font-medium text-neutral-700">
                  Método de pago
                </label>
                <select
                  id="metodoPagoId"
                  required
                  value={metodoPagoId}
                  onChange={(e) => setMetodoPagoId(e.target.value)}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  {metodos.map((metodo) => (
                    <option key={metodo.id} value={metodo.id}>
                      {metodo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="alias" className="block text-sm font-medium text-neutral-700">
                  Alias
                </label>
                <input
                  id="alias"
                  type="text"
                  required
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="Cuenta Bancolombia"
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label htmlFor="datos" className="block text-sm font-medium text-neutral-700">
                  Datos
                </label>
                <input
                  id="datos"
                  type="text"
                  required
                  value={datos}
                  onChange={(e) => setDatos(e.target.value)}
                  placeholder="N/A o número de cuenta"
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
              >
                {submitting ? 'Guardando...' : 'Agregar'}
              </button>
            </form>
          )}
        </>
      )}
    </main>
  );
}