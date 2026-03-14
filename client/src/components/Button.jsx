import React from 'react'
export default function Button({ children, onClick, type = 'button', loading, variant = 'magenta', className = '', ...props }) {
  const base = variant === 'green'
    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
    : 'bg-blue-600 text-white hover:bg-blue-500'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`w-full h-12 rounded-2xl font-semibold transition ${base} disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {loading ? 'Carregando...' : children}
    </button>
  )
}
