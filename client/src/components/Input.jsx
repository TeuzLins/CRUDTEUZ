import React, { useId } from 'react'

export default function Input({ label, type = 'text', value, onChange, placeholder, error, name, leftIcon, rightSlot, ...props }) {
  const id = useId()
  const hasLeft = !!leftIcon
  const hasRight = !!rightSlot
  const paddingLeft = hasLeft ? 'pl-10' : 'pl-4'
  const paddingRight = hasRight ? 'pr-12' : 'pr-4'

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-slate-200">{label}</label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full h-12 rounded-2xl ${paddingLeft} ${paddingRight} bg-slate-950/70 text-slate-100 placeholder-slate-500 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
          {...props}
        />
        {hasLeft && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            {leftIcon}
          </span>
        )}
        {hasRight && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightSlot}
          </div>
        )}
      </div>
      {error && <p id={`${id}-error`} className="text-xs text-rose-400">{error}</p>}
    </div>
  )
}
