'use client'
import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.error('[website error]', error)
        }
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-12 text-center">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-5"
                 style={{ background: 'rgba(229,115,115,0.10)' }}>
                <AlertTriangle size={28} style={{ color: '#e57373' }} />
            </div>
            {/* A casca do site publico e navy (#0B1928), entao as cores aqui sao fixas do
                tema escuro — cinzas claros ficariam ilegiveis e texto sem cor viraria preto. */}
            <h2 className="text-lg font-bold mb-2 text-[#EDF2F8]">Algo deu errado</h2>
            <p className="text-sm mb-8 max-w-sm leading-relaxed text-[#94A3B8]">
                Ocorreu um erro inesperado. Tente recarregar a pagina.
            </p>
            <div className="flex items-center gap-3">
                <button onClick={reset}
                    className="flex items-center gap-2 h-11 px-6 rounded-md text-sm font-semibold bg-[#C8A44A] text-[#0B1928] active:scale-95 transition-all">
                    <RefreshCw size={15} /> Tentar novamente
                </button>
                <button onClick={() => (window.location.href = '/')}
                    className="flex items-center gap-2 h-11 px-6 rounded-md text-sm font-medium border border-white/25 text-[#EDF2F8] active:scale-95 transition-all">
                    <Home size={15} /> Inicio
                </button>
            </div>
            {error.digest && (
                <p className="mt-6 text-[10px] font-mono text-[#94A3B8]">Ref: {error.digest}</p>
            )}
        </div>
    )
}
