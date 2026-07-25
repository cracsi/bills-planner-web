'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { api, ApiError } from '@/lib/api';

interface Factura {
  id: string;
  nombre: string;
  valor: number;
  pagado: boolean;
  fechaVencimiento: string | null;
}

interface CuentaDePago {
  id: string;
  alias: string;
}

interface Pago {
  id: string;
  valor: number;
  fecha: string;
  cuentaDePagoId: string;
}

export default function FacturaDetailPage() {
  const { token, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const facturaId = params.id as string;

  const [factura, setFactura] = useState<Factura | null>(null);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [cuentas, setCuentas] = useState<CuentaDePago[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [cuentaDePagoId, setCuentaDePagoId] = useState('');
  const [valor, setValor] = useState('');
  const [fecha, setFecha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !token) {
      router.push('/login');
    }
  }, [loading, token, router]);

  useEffect(() => {
    if (!token || !facturaId) return;

    Promise.all([
      api.get<Factura>(`/facturas/${facturaId}`, token),
      api.get<Pago[]>(`/pagos?facturaId=${facturaId}`, token),
      api.get<CuentaDePago[]>('/cuentas-de-pago', token),
    ])
      .then(([facturaData, pagosData, cuentasData]) => {
        setFactura(facturaData);
        setPagos(pagosData);
        setCuentas(cuentasData);
        if (cuentasData.length > 0) {
          setCuentaDePagoId(cuentasData[0].id);
        }
      })
      .finally(() => setLoadingData(false));
  }, [token, facturaId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const nuevoPago = await api.post<Pago>(
        '/pagos',
        { facturaId, cuentaDePagoId, valor: Number(valor), fecha },
        token,
      );
      setPagos((prev) => [...prev, nuevoPago]);
      setFactura((prev) => (prev ? { ...prev, pagado: true } : prev));
      setValor('');
      setFecha('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al registrar el pago');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !token || loadingData) {
    return null;
  }

  if (!factura) {
    return <p className="text-neutral-600 px-4 py-8">Factura no encontrada.</p>;
  }

  return (
    <main className="flex-1 px-4 py-8 max-w-md mx-auto w-full">
      <h1 className="text-2xl font-semibold text-neutral-900">{factura.nombre}</h1>
      <p className="text-sm text-neutral-600 mb-1">
        Valor: ${factura.valor.toFixed(2)} · Vence: {factura.fechaVencimiento}
      </p>
      <span
        className={`inline-block text-xs font-medium mb-6 ${
          factura.pagado ? 'text-green-600' : 'text-amber-600'
        }`}
      >
        {factura.pagado ? 'Pagada' : 'Pendiente'}
      </span>

      <h2 className="text-lg font-medium text-neutral-900 mb-3">
        Historial de pagos
      </h2>
      {pagos.length === 0 ? (
        <p className="text-neutral-600 mb-6">Sin pagos registrados.</p>
      ) : (
        <ul className="space-y-2 mb-6">
          {pagos.map((pago) => (
            <li
              key={pago.id}
              className="flex justify-between rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm"
            >
              <span>{pago.fecha}</span>
              <span className="font-medium">${pago.valor.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}

      {cuentas.length === 0 ? (
        <p className="text-sm text-amber-600">
          Necesitas al menos una cuenta de pago antes de registrar un pago.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-lg font-medium text-neutral-900">Registrar pago</h2>

          <div>
            <label htmlFor="cuentaDePagoId" className="block text-sm font-medium text-neutral-700">
              Cuenta de pago
            </label>
            <select
              id="cuentaDePagoId"
              required
              value={cuentaDePagoId}
              onChange={(e) => setCuentaDePagoId(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              {cuentas.map((cuenta) => (
                <option key={cuenta.id} value={cuenta.id}>
                  {cuenta.alias}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="valor" className="block text-sm font-medium text-neutral-700">
              Valor
            </label>
            <input
              id="valor"
              type="number"
              step="0.01"
              min="0"
              required
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label htmlFor="fecha" className="block text-sm font-medium text-neutral-700">
              Fecha
            </label>
            <input
              id="fecha"
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {submitting ? 'Guardando...' : 'Registrar pago'}
          </button>
        </form>
      )}
    </main>
  );
}