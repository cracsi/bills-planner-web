'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { api, ApiError } from '@/lib/api';

export default function NuevaFacturaPage() {
  const { token, loading } = useAuth();
  const router = useRouter();

  const [nombre, setNombre] = useState('');
  const [valor, setValor] = useState('');
  const [diaVencimiento, setDiaVencimiento] = useState('');
  const [diaSuspension, setDiaSuspension] = useState('');
  const [descripción, setDescripción] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !token) {
      router.push('/login');
    }
  }, [loading, token, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await api.post(
        '/facturas',
        {
          nombre,
          valor: Number(valor),
          diaVencimiento: Number(diaVencimiento),
          diaSuspension: Number(diaSuspension),
          descripción: descripción || undefined,
        },
        token,
      );
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al crear la factura');
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
        Nueva factura
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-neutral-700">
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Netflix"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="diaVencimiento" className="block text-sm font-medium text-neutral-700">
              Día de vencimiento
            </label>
            <input
              id="diaVencimiento"
              type="number"
              min="1"
              max="31"
              required
              value={diaVencimiento}
              onChange={(e) => setDiaVencimiento(e.target.value)}
              placeholder="15"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label htmlFor="diaSuspension" className="block text-sm font-medium text-neutral-700">
              Días para suspensión
            </label>
            <input
              id="diaSuspension"
              type="number"
              min="0"
              required
              value={diaSuspension}
              onChange={(e) => setDiaSuspension(e.target.value)}
              placeholder="5"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
        </div>

        <div>
          <label htmlFor="descripción" className="block text-sm font-medium text-neutral-700">
            Descripción (opcional)
          </label>
          <input
            id="descripción"
            type="text"
            value={descripción}
            onChange={(e) => setDescripción(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
    </main>
  );
}