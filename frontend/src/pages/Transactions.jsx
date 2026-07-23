import { Download, Filter, Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import TransactionTable from '../components/TransactionTable'
import { useApp } from '../context/AppContext'

export default function Transactions() {
  const { transactions, loading } = useApp()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [riskOnly, setRiskOnly] = useState(false)
  const [page, setPage] = useState(1)
  const filtered = useMemo(() => transactions.filter((item) => { const needle = search.toLowerCase(); return (!needle || `${item.id} ${item.account_id} ${item.destination_account_id}`.toLowerCase().includes(needle)) && (status === 'all' || item.status === status) && (!riskOnly || item.status === 'suspicious') }), [transactions, search, status, riskOnly])
  const pageSize = 5
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)
  const clear = () => { setSearch(''); setStatus('all'); setRiskOnly(false); setPage(1) }
  return <><PageHeader eyebrow="Monitoramento" title="Transações" description="Pesquise, filtre e investigue cada operação analisada pelo motor de risco." action={{ to: '/transactions/new', label: 'Nova transação' }} /><section className="panel transactions-panel"><div className="filter-toolbar"><div className="search-field"><Search size={17} /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Buscar por ID ou conta" />{search && <button onClick={() => setSearch('')} aria-label="Limpar busca"><X size={14} /></button>}</div><div className="filter-select"><Filter size={15} /><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }}><option value="all">Todos os status</option><option value="suspicious">Suspeitas</option><option value="approved">Aprovadas</option></select></div><button className={riskOnly ? 'filter-button active' : 'filter-button'} onClick={() => { setRiskOnly(!riskOnly); setPage(1) }}><SlidersHorizontal size={15} /> Só suspeitas</button><button className="icon-button export-button" aria-label="Exportar transações"><Download size={17} /></button></div><div className="results-line"><span><strong>{filtered.length}</strong> resultado{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</span>{(search || status !== 'all' || riskOnly) && <button className="clear-filters" onClick={clear}>Limpar filtros <X size={13} /></button>}</div>{loading ? <div className="loading-panel"><div className="spinner" />Carregando transações...</div> : <TransactionTable transactions={visible} />}<div className="pagination"><span>Página {page} de {pageCount}</span><div><button className="page-button" disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</button><button className="page-button" disabled={page === pageCount} onClick={() => setPage(page + 1)}>Próxima</button></div></div></section></>
}
