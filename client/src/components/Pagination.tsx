type Props = {
  page: number
  pages: number
  onChange: (page: number) => void
}

export default function Pagination({ page, pages, onChange }: Props) {
  const prev = () => onChange(Math.max(1, page - 1))
  const next = () => onChange(Math.min(pages, page + 1))
  return (
    <div className="flex items-center justify-center gap-3">
      <button onClick={prev} disabled={page <= 1} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-100 hover:bg-slate-700 disabled:opacity-50">Anterior</button>
      <span className="text-sm text-slate-400">Pagina {page} de {pages}</span>
      <button onClick={next} disabled={page >= pages} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-100 hover:bg-slate-700 disabled:opacity-50">Proxima</button>
    </div>
  )
}
